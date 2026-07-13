
import prisma from "../config/prisma.js";
export const getIncidents=async(req,res)=>{
    const userId=req.user.id;
    try {
        const results=await prisma.incidents.findMany({
            where:{
                monitors:{user_id:userId}
            },
            include:{
                monitors:{
                    select:{name:true,url:true}
                }
            },orderBy:{
                started_at:'desc'
            },
             take: 30 
        })
        const formattedForMyFrontend=results.map(incident=>({
            id:incident.id,
            monitor_id:incident.monitor_id,
            monitor_name:incident.monitors.name,
            url:incident.monitors.url,
            started_at:incident.started_at,
            resolved_at:incident.resolved_at,
            error:incident.error,
            duration_seconds:incident.duration_seconds
        }))
        res.status(200).json(formattedForMyFrontend);
    } catch (error) {
        res.status(500).json({message:'Error fetching incidents',error:error.message})
    }
}

export const getIncidentsyMonitor=async(req,res)=>{
    const {monitorId}=req.params;
    const userId=req.user.id;
    try {
        const result =await prisma.incidents.findMany({
            where:{monitor_id:parseInt(monitorId),
                monitors:{user_id:userId}
            },orderBy:{started_at:desc}
        })
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({message:'Error fetching incidents',error:error.message})   
    }
}