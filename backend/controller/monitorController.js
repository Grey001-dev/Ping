import db from "../config/db.js";
import { startMonitor,stopMonitor } from "../workers/pingWorkers.js";

// Get request to getMonitors so i can render on my status panel and sidebar
export const getMonitors= async (req,res)=>{
    const userId=req.user.id;
    try{
        // This gets all monitors belonging to this user and sort!
        const monitors=await db.query(
            'SELECT * FROM monitors WHERE user_id = $1 ORDER BY created_at DESC',[userId]
        )
    
    // For each monitor i get from the database , i check its last 30 pings
    const monitorsHistory=await Promise.all(
        monitors.rows.map(async (monitor)=>{
            const history= await db.query(
                `SELECT status,latency,timestamp
                FROM ping_history
                WHERE monitor_id =$1
                ORDER by timestamp DESC
                LIMIT 30
                `,
                [monitor.id]
            );
        // I reversed so oldest is first to make my frontend easier
        const historyRows=history.rows.reverse();
        
        // Instead of hitting my db,used this to calculate everything dynamically
        const upCount=historyRows.filter(p=>p.status==='up').length
        const downCount=historyRows.filter(p=>p.status==='down').length
        
        const total=historyRows.length;
        const retries=monitor.retries;
        // MY uptime percentage
        const uptimePct=total>0 ? Math.round((upCount/total)*100):0

        const latencies=historyRows.filter(p=>p.latency>0);
        const avgLatency=latencies.length>0 ? Math.round(latencies.reduce((a,p)=> a + p.latency,0)/latencies.length) : 0;

        const lastPing=historyRows[historyRows.length-1];
        const currentStatus=lastPing ? lastPing.status : "unknown"
        const currentLatency=lastPing ? lastPing.latency:0;
        const currentError=currentStatus==='down' ? lastPing.error :null
        return{
            ...monitor,
            status:currentStatus,
            uptime:`${uptimePct}`,
            currentLatency,
            avgLatency,
            upCount:upCount,
            downCount:downCount,
            retries:retries,
            error:currentError,
            history:historyRows
        }
    })
    );
    res.status(200).json(monitorsHistory);
    
    }catch(err){
        res.status(500).json({message:'Errors fetching monitors',error:err.message})
    }
};
// Post request to create monitors
export const createMonitors=async(req,res)=>{
    const userId=req.user.id;
    const {name,url,type,interval,retries,method,custom_headers,request_body,port,allowed_status_codes}=req.body;

    if(!name || !url){
        return res.status(400).json({message:'Name and URL are required'});
    }
    
    try{
        const newMonitors=await db.query(
            `INSERT INTO monitors (name,url,type,interval,retries,method,user_id,custom_headers,request_body,port,allowed_status_codes)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
            RETURNING *`,
            [name,url,type || 'HTTP' , interval || 60, retries || 3, method || 'GET',userId, custom_headers || null, request_body || null,port ||null,
                allowed_status_codes || []
            ]
        );
        const monitor=newMonitors.rows[0];
        // I send back empty history as well so front end can render it immediately
        res.status(201).json({
            ...monitor,
            status:'unknown',
            uptime:'0%',
            currentLatency:0,
            avgLatency:0,
            custom_headers:"",
            request_body:"",
            history:[]
        });
        startMonitor(monitor);
        
        
    }catch(err){
        res.status(500).json({message:'Error Creating monitor',error:err.message})
    }

};

export const deleteMonitor=async (req,res) =>{
    const {id}=req.params;
    const userId=req.user.id;
    try {
        const monitor=await db.query(
            'SELECT * FROM monitors WHERE id=$1 AND user_id=$2',[id,userId]
        );
        if(monitor.rows.length==0){
            return res.status(400).json({message:"Monitor not found"})}
        stopMonitor(id)
        await db.query("DELETE FROM ping_history WHERE monitor_id=$1",[id])
        await db.query("DELETE FROM monitors WHERE id=$1",[id])

        res.status(200).json({message:'Monitor deleted successfully'});
    } catch (err) {
        res.status(500).json({message:'Error deleting monitor',error:err.message})
    }
}

export const togglePause=async (req,res)=>{
    const {id}=req.params;
    const userId=req.user.id;
    try {
        const monitor=await db.query("SELECT * FROM monitors WHERE id=$1 AND user_id=$2 ",[id,userId])
        if(monitor.rows.length===0) return res.status(404).json({message:' Monitor not found'})
        const newState=!monitor.rows[0].is_paused;
        await db.query("UPDATE monitors SET is_paused=$1 WHERE id=$2",[newState,id]);
        if(newState){
            stopMonitor(id)
            console.log(`${monitor.rows[0].name} is paused`)
        }else{
            startMonitor(monitor.rows[0])
        }
        res.status(200).json({is_paused:newState})
    } catch (error) {
        res.status(500).json({message:'Error toggling pause',error})
    }
}

export const editMonitors=async (req,res)=>{
    const {id}=req.params;
    const userId=req.user.id
    const {name,url,type,interval,retries,method,request_body,custom_headers,port,allowed_status_codes}=req.body;
    try {
        const monitorExist=await db.query("SELECT * FROM monitors WHERE id=$1 AND user_id=$2",[id,userId]);
        if(monitorExist.rows.length===0){
            return res.status(404).json({message:"Monitor doesn't exist"})

        }
        const updatedMonitor=await db.query("UPDATE monitors SET name=$1 ,url=$2,type=$3,interval=$4,retries=$5,method=$6,custom_headers=$7,request_body=$8,port=$9,allowed_status_codes=$10 WHERE id=$11 and user_id=$12 RETURNING *",
            [name,url,type,interval,retries,method,custom_headers,request_body,port,allowed_status_codes,id,userId]
        )
        stopMonitor(id)
        startMonitor(updatedMonitor.rows[0])

        return res.status(200).json( updatedMonitor.rows[0]);
    } catch (err) {
        console.log(err.message)
        return res.status(500).json({message:'Error updating monitors',error:err.message})
    }
}
