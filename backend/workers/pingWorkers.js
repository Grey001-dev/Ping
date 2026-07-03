import db from '../config/db.js';
import axios from 'axios';
import {io} from '../index.js';
import { sendDownEmail,sendRecoveryEmail } from '../services/emailService.js';
const activeWorkers={};
const failureCounts={}
// This performs the network request and returns a promise containing the response time and up/down status
async function pingUrl(url){
    const startTime=Date.now();

    try{
        if(!url.startsWith('http://') && !url.startsWith('https://')){
            url='https://'+ url.trim()
        }
        const res=await axios.get(url,{
            timeout:10000,
            headers:{
                'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            // ALL redirects and protected are accepted 
            validateStatus:function(status){
                return status<500;
            }
        });
        const latency=Date.now()-startTime;
        return{
            status:'up',
            latency,
            error:null,
            statusCode:res.status
        }
    }catch(err){
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



// add these ping responses tp out database 
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
    const retries=monitor.retries;
    try {
        console.log(`[STAGE 1] About to ping: ${monitor.url}`)
        const result=await pingUrl(monitor.url)
        console.log(`[STAGE 2] Ping finished with status: ${result.status}...for ${monitor.url}`)
        if(result.status==='up' ){
            failureCounts[monitor.id]=0
            
            await savePingResult(monitor.id,result.status,result.latency,result.error);
            if(monitor.is_down){
                console.log(`RECOVERY!! ${monitor.name} is back up! Flippping state to healthy`)
                await db.query("UPDATE monitors SET is_down=false WHERE id=$1",[monitor.id])
                monitor.is_down=false;
                const user=await db.query("SELECT email FROM users WHERE id=$1",[monitor.user_id])
                if(user.rows.length>0){
                    await sendRecoveryEmail(monitor,user.rows[0].email);
                }
            }

            console.log(`[STAGE 3] DB save complete .Emitting socket for ${monitor.url}`)
            io.emit('monitor-updated',{
                id:monitor.id,
                status:result.status,
                latency:result.latency,
                error:result.error
            })
            console.log(`Broadcasted update form ${monitor.name}:${result.status}`)
        }
        else{
            failureCounts[monitor.id]=(failureCounts[monitor.id] || 0) + 1;
            if(failureCounts[monitor.id]>=retries){
                console.log("Website is officially down")

                await savePingResult(monitor.id,result.status,result.latency,result.error);
                if(!monitor.is_down){
                    await db.query("UPDATE monitors SET is_down=true WHERE id=$1",[monitor.id]);
                    monitor.is_down=true;

                    const user=await db.query("SELECT email FROM users WHERE id=$1",[monitor.user_id])
                    console.log(user)
                    if(user.rows.length>0){
                        console.log("Should send an email")
                        await sendDownEmail(monitor,user.rows[0].email)
                    }
                }
                io.emit('monitor-updated',{
                    id:monitor.id,
                    status:result.status,
                    latency:result.latency,
                    error:result.error
                })
                console.log(`Broadcasted update form ${monitor.name} : ${result.status}`)
                
            }else{
                console.log(`Soft failure ${failureCounts[monitor.id]} with retries of :${retries}.`)
                // i Will quickly double-check
                const fastTimer=setTimeout(()=>{
                    runMonitorLoop(monitor);
                },2000)
                activeWorkers[monitor.id]=fastTimer
                return;

            }
        }
    } catch (error) {
        console.log(`Error pinging ${monitor.name}:`,error.message)
    }
    if(!activeWorkers[monitor.id]) return;

    const NormalTimer=setTimeout(()=>{
        runMonitorLoop(monitor)
    },monitor.interval*1000)
    activeWorkers[monitor.id]=NormalTimer
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
        if(activeWorkers[monitorId]===true){
           delete activeWorkers[monitorId];
           return
        }
        clearTimeout(activeWorkers[monitorId]);
        delete activeWorkers[monitorId];
    }
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