import {useState,useEffect} from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import styles from './PublicStatusPage.module.css';
import { ArrowRight,Activity,Clock } from 'lucide-react';

export default function PublicStatusPage(){
    const [data,setData]=useState(null);
    const [loading,setLoading]=useState(true);
    const [error,setError]=useState(false);
    const {userId}=useParams()
    useEffect(()=>{
        const fetchStatus=async()=>{
            try {
                const res=await axios.get(`https://ping-7u78.onrender.com/api/status/${userId}`)
                setData(res.data);
            } catch (err) {
                setError(true);
            }finally{
                setLoading(false);
            }
        };
        fetchStatus()
    },[userId]);
    if (loading) {
    return (
        <div className={styles.loadingWrapper}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Loading...</p>
        </div>
    );
}

    if(error || !data){
        return(
            <div className={styles.errorWrapper}>
                <p>Status page not found.</p>
            </div>
        )
    }
    const hasMonitors=data.monitors.length>0

    const allUp=hasMonitors && data.monitors.every(m=>m.status==='up');
    return(
        <div className={styles.wrapper}>

            <header className={styles.header}>
                <div className={styles.brand}>
                    <Activity className={styles.brandIcon} size={18}/>
                    <h1>System Status</h1>
                </div>
                <span className={styles.realTime}>Real-time</span>
            </header>

            {hasMonitors &&(
                <div className={allUp? styles.Up:styles.Down}>
                <span className={styles.pulse}></span>
                {allUp? 'All Systems Are Active' :'Some Systems are experiencing Issues'}
            </div>
            )}
            <div className={styles.monitorList}>
                {data.monitors.length===0 ?(
                    <div className={styles.emptyCard}>
                        <p className={styles.empty}>No active monitors linked to this page.</p>
                    </div>
                ):(
                    data.monitors.map(monitor=>(
                        <div key={monitor.id} className={styles.monitorRow}>
                            <div className={styles.monitorNameGroup}>
                                <span className={`${styles.monitorIndicator} ${monitor.status ==='up' ? styles.indicateUp: styles.indicateDown}`}></span>
                                <span className={styles.monitorName}>{monitor.name}</span>
                            </div>
                            <div className={styles.monitorMetaGroup}>
                                {monitor.uptime !==null &&(
                                    <span className={styles.uptime}>
                                        {`${Number(monitor.uptime).toFixed(2)}% uptime`}
                                    </span>
                                )}
                                <span className={monitor.status==='up' ? styles.up :styles.down}>
                                    {monitor.status==='up' ? "Operational" :"Down"}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
            {data.incidents.length>0 &&(
                <div className={styles.incidentSection}>
                    <div className={styles.incidentSectionHeader}>
                        <Clock size={16}/>
                        <h2>Recent incidents</h2>
                    </div>
                    <div className={styles.incidentList}>
                        {data.incidents.map(incident=>(
                        <div key={incident.id} className={styles.incidentRow}>
                            <div className={styles.incidentHeader}>
                                <span className={styles.incidentMonitorName}>{incident.monitor_name}</span>
                                <span className={
                                    incident.resolved_at ? styles.onResolved :styles.onGoing
                                }>
                                    {incident.resolved_at ? "Resolved":"Ongoing"}
                                </span>
                            </div>
                            <div className={styles.incidentTimeline}>
                                <span className={styles.incidentTime}>
                                    {new Date(incident.started_at).toLocaleString(undefined,{
                                        month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'
                                    })}
                                </span>
                                {incident.resolved_at && (
                                    <>
                                    <ArrowRight size={12} className={styles.timelineArrow}/>
                                    <span className={styles.incidentTimeResolved}>
                                        {new Date(incident.resolved_at).toLocaleString(undefined,{
                                            month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'
                                        })}
                                    </span>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    </div>

                </div>
            )}

        </div>
    )
}