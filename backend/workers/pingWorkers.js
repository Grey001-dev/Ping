import db from '../config/db.js';
import https from 'https';
import http from 'http';

const activeWorkers={};
// This performs the network request and returns a promise containing the response time and up/down status
async function pingUrl(url){
    return new Promise((resolve)=>{
        // save the time now for knowing the response time
        const startTime=Date.now();

        // picking the right module https or http
        let client;
        if(url.startsWith('https')){
            client=https;
        }
        else{
            client=http;
        }
        //Knocks on the door of the url given
        const req=client.get(url,(res)=>{
            // once inside the website then stop timer
            const latency=Date.now()-startTime;
            resolve({
                status:res.statusCode>=200 && 
                res.statusCode<400 ? 'up':'down',latency
            });
        });
        // If nobody answers after 10 seconds stop waiting
        // we set a timer to return down
        req.setTimeout(10000,()=>{
            req.destroy();
            resolve({status:'down',latency:0})
        })

        // if something goes completely wrong (no internet,wrong url)
        req.on('error',()=>{
            resolve({status:'down',latency:0})
        })
    })
}
// add these ping responses tp out database 
async function savePingResult(monitorid,status,latency){
    await db.query(
        `INSERT INTO ping_history (monitor_id,status,latency,timestamp)
        VALUES ($1,$2,$3,NOW())`,[monitorid,status,latency]
    );
}

// After every X second it wakes up,knowcks on the door and saves the result
export function startMonitor(monitor){
    // if this monitor is already active then do not start another one
    if(activeWorkers[monitor.id]) {
        console.log(`${monitor.name} is already running`);
        return;
    }

    console.log(`Starting ${monitor.name} every ${monitor.interval} seconds`)
    const timer=setInterval(async()=>{
        try {
            const result=await pingUrl(monitor.url);
            await savePingResult(monitor.id,result.status,result.latency)
            console.log(`${monitor.name}: ${result.status}, ${result.latency}ms`)
        } catch (error) {
            console.error(`Something went wrong while pinging ${monitor.name}:`,error.message)
        }
    },monitor.interval*1000)
    activeWorkers[monitor.id]=timer;
}

export function stopMonitor(monitorId){
    if(activeWorkers[monitorId]){
        clearInterval(activeWorkers[monitorId]);
    }
    // Delete the monitor from the list
    delete activeWorkers[monitorId];
    console.log(`Stopped monitor ${monitorId}`)
}

export async function StartAllMonitors(){
    try {
        // This fetches the whole db because my server is global and should start for all users not just a specific user
        const myDb=await db.query("SELECT & FROM monitors");
        const monitors=myDb.rows;

        if(monitors.length===0){
            console.log('No monitors yet,waiting for users to add some monitors ')
            return;
        }
        // Goes to the start monitor and starts them for me 
        monitors.forEach(monitor=>startMonitor(monitor));
        console.log(`${monitors.length} monitors are now running`)
    } catch (error) {
        console.error('Could not start monitors:',err.message);
    }
}