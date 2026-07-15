import { startMonitor,stopMonitor } from "../workers/pingWorkers.js";
import prisma from '../config/prisma.js'
// Get request to getMonitors so i can render on my status panel and sidebar
export const getMonitors = async (req, res) => {
    const userId = req.user.id;
    try {
        // This gets all monitors belonging to this user and sort!
        const monitors = await prisma.monitors.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' }
        })
        // For each monitor i get from the database , i check its last 30 pings...very exhausting
        const monitorsHistory = await Promise.all(
            monitors.map(async (monitor) => {
                const history = await prisma.ping_history.findMany({
                    where: { monitor_id: monitor.id },
                    orderBy: { timestamp: 'desc' },
                    take: 30,
                    select: { status: true, latency: true, timestamp: true }
                });
                // I reversed so oldest is first to make my frontend easier
                const historyRows = history.reverse();

                const upCount = historyRows.filter(p => p.status === 'up').length;
                const downCount = historyRows.filter(p => p.status === 'down').length;
                const total = historyRows.length;
                const uptimePct = total > 0 ? Math.round((upCount / total) * 100) : 0
                const latencies = historyRows.filter(p => p.latency > 0);
                const avgLatency = latencies.length > 0
                    ? Math.round(latencies.reduce((a, p) => a + p.latency, 0) / latencies.length)
                    : 0;
                const lastPing = historyRows[historyRows.length - 1];
                const currentStatus = lastPing ? lastPing.status : "unknown";
                const currentLatency = lastPing ? lastPing.latency : 0;
                const currentError = currentStatus === 'down' ? lastPing.error : null;
                return {
                    ...monitor,
                    status: currentStatus,
                    uptime: `${uptimePct}`,
                    currentLatency: currentLatency,
                    avgLatency: avgLatency,
                    upCount,
                    downCount,
                    retries: monitor.retries,
                    error: currentError,
                    history: historyRows
                }
            })
        )
        res.status(200).json(monitorsHistory);

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Errors fetching monitors', error: err.message })
    }
}
export const get24hHistory = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const monitor = await prisma.monitors.findFirst({
            where: { id: parseInt(id), user_id: userId }
        });
        if (!monitor) return res.status(404).json({ message: 'Monitor not found' });

        const history = await prisma.ping_history.findMany({
            where: {
                monitor_id: parseInt(id),
                timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
            },
            orderBy: { timestamp: 'asc' },
            select: { status: true, latency: true, timestamp: true }
        });

        const upCount = history.filter(p => p.status === 'up').length;
        const downCount = history.filter(p => p.status === 'down').length;
        const uptimePct = history.length > 0 ? Math.round((upCount / history.length) * 100) : null;

        res.status(200).json({
            uptime24h: uptimePct,
            upCount24h: upCount,
            downCount24h: downCount
        });
    } catch (err) {
        console.error('FULL 24H HISTORY ERROR:', err);
        res.status(500).json({ message: 'Error fetching 24h history', error: err.message });
    }
};
// Post request to create monitors
export const createMonitors = async (req, res) => {
    const userId = req.user.id;
    const { name, url, type, interval, retries, method, custom_headers, request_body, port, allowed_status_codes, is_public } = req.body;

    if (!name || !url) {
        return res.status(400).json({ message: 'Name and URL are required' });
    }

    try {
        const monitor=await prisma.monitors.create({
            data:{
                name,
                url,
                type:type || 'HTTP',
                interval:interval || 60,
                retries:retries ||3,
                method:method||'GET',
                user_id:userId,
                custom_headers:custom_headers || null,
                request_body:request_body|| null,
                port:port || null,
                allowed_status_codes:allowed_status_codes || [],
                is_public:is_public || false
            }
        })
        res.status(201).json({
            ...monitor,
            status: 'unknown',
            uptime: '0%',
            currentLatency: 0,
            avgLatency: 0,
            custom_headers: "",
            request_body: "",
            history: []
        });
        startMonitor(monitor);
    } catch (err) {
        res.status(500).json({ message: 'Error Creating monitor', error: err.message });
    }
}

export const deleteMonitor=async (req,res) =>{
    const {id}=req.params;
    const userId=req.user.id;
    try {
        const monitor=await prisma.monitors.findFirst({
            where:{id:parseInt(id),user_id:userId}
        })
        if(!monitor){
            return res.status(400).json({message:"Monitor not found"})}
        stopMonitor(id)
        await prisma.monitors.delete({
            where: { id: parseInt(id) }
        })
        res.status(200).json({message:'Monitor deleted successfully'});
    } catch (err) {
        res.status(500).json({message:'Error deleting monitor',error:err.message})
    }
}

export const togglePause=async (req,res)=>{
    const {id}=req.params;
    const userId=req.user.id;
    try {
        const monitor = await prisma.monitors.findFirst({
            where: { id: parseInt(id), user_id: userId }
        });
        if(!monitor) {
            return res.status(404).json({message:' Monitor not found'})
        }
        const newState=!monitor.is_paused;
        const updated = await prisma.monitors.update({
            where: { id: parseInt(id) },
            data: { is_paused: newState }
        });
        if(newState){
            stopMonitor(id)
            console.log(`${monitor.name} is paused`)
        }else{
            startMonitor(updated)
        }
        res.status(200).json({is_paused:newState})
    } catch (error) {
        res.status(500).json({message:'Error toggling pause',error:error.message})
    }
}
export const editMonitors = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, url, type, interval, retries, method, request_body, custom_headers, port, allowed_status_codes, is_public } = req.body;
    try {
        const monitorExist = await prisma.monitors.findFirst({
            where: { id: parseInt(id), user_id: userId }
        });
        if (!monitorExist) {
            return res.status(404).json({ message: "Monitor doesn't exist" });
        }

        const updatedMonitor = await prisma.monitors.update({
            where: { id: parseInt(id) },
            data: {
                name,
                url,
                type,
                interval,
                retries,
                method,
                custom_headers,
                request_body,
                port: port ? parseInt(port) : null,
                allowed_status_codes: allowed_status_codes || [],
                is_public: is_public || false
            }
        });

        stopMonitor(id);
        startMonitor(updatedMonitor);

        return res.status(200).json(updatedMonitor);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: 'Error updating monitors', error: err.message });
    }
};