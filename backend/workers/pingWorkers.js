import db from '../config/db.js';
import axios from 'axios';
import {io} from '../index.js';
import { sendDownEmail,sendRecoveryEmail } from '../services/emailService.js';
import dns, { resolve } from 'dns';
import { Socket } from 'socket.io';
import net from 'net';
import ping from 'ping';
import { readdirSync } from 'fs';


// using reliable public resolvers
dns.setServers(["1.1.1.1","8.8.8.8"])
const activeWorkers={};
const failureCounts={}
// This performs the network request and returns a promise containing the response time and up/down status

function parseIncomingRequests(value){
    if (!value) return null;
    if(typeof value !=='string') return value;
    try {
        value=JSON.parse(value)
        return value
    } catch (error) {
        console.log("Error caught parsing requests")
        return null
    }
}
// I used regex to remove http:// frommy url so it can be used for the Port and Ping
function stripHttpsFromUrl(url){
    return url.trim().replace(/^https?:\/\//,'').split('/')[0]
}

async function checkPing(host,timeout=10){
    const start=Date.now();

    try {
        // I send small packet of data to the target address using probe
        const result=await ping.promise.probe(host,{timeout})
        if(result.alive){
            const end=Date.now()
            return{
                status:'up',
                latency:end-start,
                error:null
            }
        }
        return{
            status:'down',
            latency:0,
            error:'HOST_NOT_REACHABLE'
        }
    } catch (err) {
        return{
            status:'down',
            latency:0,
            error:err.message || 'PING_FAILED'
        }
    }

}
async function checkPort(host,port,timeout=10000) {
    return new Promise((resolve)=>{
        const start=Date.now();
        const socket=new net.Socket()
        // My safety net so i dont fire up an error after a timeout
        let done=false;

        socket.setTimeout(timeout)

        socket.on('connect',()=>{
            if (done) return;
            done=true;
            socket.destroy();
            const end=Date.now()
            resolve({status:'up',latency:end-start,error:null})
        })

        socket.on('timeout',()=>{
            if(done) return;
            done=true;
            socket.destroy()
            resolve({status:'down',latency:0,error:'CNNECTION_TIMEOUT'})
        })

        socket.on('error',(err)=>{
            if(done) return;
            done=true;
            socket.destroy();
            resolve({status:'down',latency:0,error:err.code || 'CONNECTION_REFUSED'})

        })
        socket.connect(port,host )
    })
}
async function checkHttp(monitor){
    const startTime=Date.now();
    let url=monitor.url.trim();
    if(!url.startsWith(`http://`) && !url.startsWith('https://')){
            url="https://"+ url.trim()
        }
    let res;

    try {
        let customHeaders=parseIncomingRequests(monitor.custom_headers)||{}
        let requestBody=parseIncomingRequests(monitor.request_body) ||{}
        let method=monitor.method.toUpperCase()
        let lowerCaseMethod=method.toLowerCase();
        console.log(`Post request of ${monitor.request_body} for ${monitor.name} with headers:${monitor.custom_headers} and method:${monitor.method}` );
        if(method==='POST' || method==='PUT'){
            res=await axios[lowerCaseMethod](url,
                requestBody,
                {
                timeout:10000,
                // headers to make my requests look like a normal user
                headers:{
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language':'en-US,en;q=0.5',
                    'Connection':'keep-alive',
                    ...customHeaders
                },
                validateStatus:(status)=>status<500
            });
        }else{
            res=await axios.get(url,{
                timeout:10000,
                headers:{
                    'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language':'en-US,en;q=0.5',
                    'Connection':'keep-alive',
                    ...customHeaders
                },
                validateStatus:(status)=>status<500
            })
        }    
        const endTime=Date.now()
        const latency=endTime-startTime;

        const allowedCodes=monitor.allowed_status_codes || [];
        if(res.status>=400 && !allowedCodes.includes(res.status)){
            return {status:'down',latency,error:`HTTP_${res.status}`,statusCode:res.status}
        }

        return{
            status:'up',
            latency,
            error:null,
            statusCode:res.status
        }
    }catch(err){
        // This only handles 5xx or my total network drops/timeout
        let errorType='UNKNOWN_DOWN';
        if(err.code==='ENOTFOUND' || err.code ==='EAI_AGAIN'){
            errorType='URL_DOES_NOT_EXIST';
        }else if(err.code==='ECONNABORTED' || err.message.includes('timeout')){
            errorType='TIMEOUT';
        }else if(err.response && err.response.status>=500){
            errorType=`SERVER_CRASHED_${err.response.status}`
        }
        return {status:'down',latency:0,error:errorType};

    }
}

async function pingUrl(monitor){
    const type=(monitor.type ||'HTTP').toUpperCase()
    if(type==='PING'){
        const url=stripHttpsFromUrl(monitor.url)
        return checkPing(url)
    }
    if(type==='PORT'){
        const host=stripHttpsFromUrl(monitor.url);
        const port=monitor.port
        if(!port) return{status:'down',latency:0,error:'No_PORT_SPECIFIED'}
        return checkPort(host,port)
    }
    return checkHttp(monitor);
}



async function savePingResult(monitorid,status,latency,error=null){
    // check if monitor exist
    const monitor=await db.query(
        "SELECT id FROM monitors WHERE id=$1",[monitorid]
    )
    if(monitor.rows.length==0){
        stopMonitor(monitorid);
        return;
    }

    await db.query(
        `INSERT INTO ping_history (monitor_id,status,latency,error,timestamp)
        VALUES ($1,$2,$3,$4,NOW())`,[monitorid,status,latency,error]
    );
}


async function runMonitorLoop(monitor){
    // If i click delete on my frontend
    if(!activeWorkers[monitor.id]) return;
    // if monitor is edited on my frontend and prevent my backend from using stale data
    let freshMonitor=monitor;
    try {
        const result=await db.query("SELECT * FROM monitors WHERE id=$1",[monitor.id])
        if(result.rows.length===0){
            stopMonitor(monitor.id);
            return
        }
        freshMonitor=result.rows[0];
        if(freshMonitor.is_paused){
            stopMonitor(monitor.id);
            return;
        }
    } catch (error) {
        console.log(`Could not refresh monitor ${monitor.id},using stale copy:`,error.message)
    }
    const retries=freshMonitor.retries
    try {
        const result=await pingUrl(freshMonitor);
        console.log(`[STAGE 2] Ping finished with status: ${result.status}...for ${monitor.url}`)
        
        if(result.status==='up' ){
            failureCounts[freshMonitor.id]=0
            
            await savePingResult(freshMonitor.id,result.status,result.latency,result.error);
            if(freshMonitor.is_down){
                console.log(`RECOVERY!! ${freshMonitor.name} is back up! Flippping state to healthy`)
                await db.query("UPDATE monitors SET is_down=false WHERE id=$1",[monitor.id])
                freshMonitor.is_down=false;
                const user=await db.query("SELECT  COALESCE(notification_email,email)AS email FROM users WHERE id=$1",[monitor.user_id])
                if(user.rows.length>0){
                    await sendRecoveryEmail(freshMonitor,user.rows[0].email);
                }
            }

            console.log(`[STAGE 3] DB save complete .Emitting socket for ${monitor.url}`)
            io.emit('monitor-updated',{
                id:freshMonitor.id,
                status:result.status,
                latency:result.latency,
                error:result.error
            })
            console.log(`Broadcasted update form ${freshMonitor.name}:${result.status}`)
        }
        else{
            failureCounts[freshMonitor.id]=(failureCounts[freshMonitor.id] || 0) + 1;
            if(failureCounts[freshMonitor.id]>=retries){
                console.log("Website is officially down")

                await savePingResult(freshMonitor.id,result.status,result.latency,result.error);
                if(!freshMonitor.is_down){
                    await db.query("UPDATE monitors SET is_down=true WHERE id=$1",[freshMonitor.id]);
                    freshMonitor.is_down=true;

                    const user=await db.query("SELECT COALESCE(notification_email,email) AS email FROM users WHERE id=$1",[freshMonitor.user_id])
                    console.log(user)
                    if(user.rows.length>0){
                        console.log("Should send an email")
                        await sendDownEmail(freshMonitor,user.rows[0].email)
                    }
                }
                io.emit('monitor-updated',{
                    id:freshMonitor.id,
                    status:result.status,
                    latency:result.latency,
                    error:result.error
                })
                console.log(`Broadcasted update form ${freshMonitor.name} : ${result.status}`)
                
            }else{
                console.log(`Soft failure ${failureCounts[freshMonitor.id]} with retries of :${retries}.`)
                // i Will quickly double-check
                const fastTimer=setTimeout(()=>{
                    runMonitorLoop(freshMonitor);
                },2000)
                activeWorkers[freshMonitor.id]=fastTimer
                return;

            }
        }
    } catch (error) {
        console.log(`Error pinging ${freshMonitor.name}:`,error.message)
    }
    if(!activeWorkers[freshMonitor.id]) return;

    const NormalTimer=setTimeout(()=>{
        runMonitorLoop(freshMonitor)
    },freshMonitor.interval*1000)
    activeWorkers[freshMonitor.id]=NormalTimer
}

// After every X second it wakes up,knowcks on the door and saves the result
export function startMonitor(monitor){
    // if this monitor is already active then do not start another one
    if(activeWorkers[monitor.id]) {
        console.log(`${monitor.name} is already running`);
        return;
    }
    activeWorkers[monitor.id]=true;//set to true to know if running
    runMonitorLoop(monitor);

    console.log(`Starting ${monitor.name} every ${monitor.interval} seconds`)
    
}

export function stopMonitor(monitorId){
    if(activeWorkers[monitorId]){
        if(activeWorkers[monitorId]!==true){
           clearTimeout(activeWorkers[monitorId])
        }
        delete activeWorkers[monitorId];
    }
    delete failureCounts[monitorId]
    console.log(`Stopped monitor ${monitorId}`);
}

export async function startAllMonitors(){
    try {
        const myDb=await db.query("SELECT * FROM monitors");
        const monitors=myDb.rows;

        if(monitors.length===0){
            console.log('No monitors yet,waiting for users to add some monitors ')
            return;
        }
        
        // Goes to the start monitor and starts them for me 
        // Also added a 1000ms start between each monitors
        monitors.forEach((monitor,index)=>{
            setTimeout(()=>{
                startMonitor(monitor);

            },index*1000)
        })
        console.log(`${monitors.length} monitors are now running`)
    } catch (error) {
        console.error('Could not start monitors:',error.message);
    }
}