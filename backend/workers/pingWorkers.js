import db from '../config/db.js';
import axios from 'axios';

const activeWorkers={};
// This performs the network request and returns a promise containing the response time and up/down status
async function pingUrl(url){
    const startTime=Date.now();
    try{
        const res=await axios.get(url,{
            timeout:10000,
            headers:{
                'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        const latency=Date.now()-startTime;
        return{
            // anything below 500 means the server is alive as we might get blocked
            status:res.status<500 ?'up':'down',latency
        }
    }catch(err){
        return {status:'down',latency:0}
    }
}


// add these ping responses tp out database 
async function savePingResult(monitorid,status,latency){
    // check if monitor exist
    const monitor=await db.query(
        "SELECT id FROM monitors WHERE id=$1",[monitorid]
    )
    if(monitor.rows.length==0){
        stopMonitor(monitorid);
        return;
    }

    await db.query(
        `INSERT INTO ping_history (monitor_id,status,latency,timestamp)
        VALUES ($1,$2,$3,NOW())`,[monitorid,status,latency]
    );
}


async function runMonitorLoop(monitor){
    // If i click delete on my frontend
    if(!activeWorkers[monitor.id]) return;

    try {
        const result=await pingUrl(monitor.url)
        await savePingResult(monitor.id,result.status,result.latency)
    } catch (error) {
        console.log(`Error pinging ${monitor.name}:`,error.message)
    }
    if(!activeWorkers[monitor.id]) return;

    const timer=setTimeout(()=>{
        runMonitorLoop(monitor)
    },monitor.interval*1000)
    activeWorkers[monitor.id]=timer
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
    }
    // Delete the monitor from the list
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