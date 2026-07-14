import {useState,useEffect} from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import styles from './PublicStatusPage.module.css';
import { ArrowRight } from 'lucide-react';

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
    if(loading){
        return(
            <div className={styles.wrapper}>
                <p>Loading...</p>
            </div>
        )
    }

    if(error || !data){
        return(
            <div className={styles.wrapper}>
                <p>Status page not found.</p>
            </div>
        )
    }
    const allUp=data.monitors.every(m=>m.status==='up');
    return(
        <div className={styles.wrapper}>
            <div className={allUp? styles.Up:styles.Down}>
                {allUp? 'All Systems Are Active' :'Some Systems are experiencing Issues'}
            </div>

            <div className={styles.monitorList}>
                {data.monitors.length===0 ?(
                    <p className={styles.empty}>No public monitors to display</p>
                ):(
                    data.monitors.map(monitor=>(
                        <div key={monitor.id} className={styles.monitorRow}>
                            <span>{monitor.name} &nbsp;</span>
                            <span className={monitor.status==='up' ? styles.up :styles.down}>{monitor.status==='up' ?'Operational' :'Down'}</span>
                            {monitor.uptime !==null && <span className={styles.uptime}>{monitor.uptime}% uptime</span> }
                        </div>
                    ))
                )}
            </div>
            {data.incidents.length>0 &&(
                <div className={styles.incidentSection}>
                    <h2>Recent Incidents</h2>
                    {data.incidents.map(incident=>(
                        <div key={incident.id} className={styles.incidentRow}>
                            <strong>{incident.monitor_name}</strong>
                            <span>{new Date(incident.started_at).toLocaleString()}</span>
                            {incident.resolved_at && <span><ArrowRight size={14}/>Resolved{new Date(incident.resolved_at).toLocaleString()} </span>}
                        </div>
                    ))}
                </div>
            )}

        </div>
    )
}