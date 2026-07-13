import prisma from "../config/prisma.js";
export const getPublicStatus = async (req, res) => {
    const { userId } = req.params;
    try {
        const monitors=await prisma.monitors.findMany({
            where:{user_id:parseInt(userId),is_public:true},
            select:{id:true,name:true,is_down:true}
        })
        // Stressssssssssssss broooooooooooooooooo
        // So basically after gettting the monitors i fetch the last 24 days status for each of the monitors 
        const monitorsWithHistory = await Promise.all(
            monitors.map(async (monitor) => {
                const history = await prisma.ping_history.findMany({
                    where:{
                        monitor_id:monitor.id,
                        timestamp:{gte :new Date(Date.now()-24 * 60 *60 *1000)}
                    },orderBy:{timestamp:'desc'},
                    select:{status:true,timestamp:true}
                }
                    
                );
                const upCount = history.filter(p => p.status === 'up').length;
                const uptimePercent = history.length > 0 ? Math.round((upCount / history.rows.length) * 100) : null;

                return {
                    id: monitor.id,
                    name: monitor.name,
                    status: monitor.is_down ? 'down' : 'up',
                    uptime: uptimePercent
                };
            })
        );

        const publicMonitorIds = monitors.map(m => m.id);
        let incidents = [];
        if (publicMonitorIds.length > 0) {
            const incidentResults = await prisma.incidents.findMany({
                where: { monitor_id: { in: publicMonitorIds } },
                include: { monitors: { select: { name: true } } },
                orderBy: { started_at: 'desc' },
                take: 10
            });

            incidents = incidentResults.map(incident => ({
                id: incident.id,
                monitor_id: incident.monitor_id,
                monitor_name: incident.monitors.name,
                started_at: incident.started_at,
                resolved_at: incident.resolved_at
            }));
        }

        res.status(200).json({
            monitors: monitorsWithHistory,
            incidents: incidents
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching status page', error: error.message });
    }
};
