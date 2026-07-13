import styles from './StatusPanel.module.css'
import { useEffect, useState } from 'react';
import {Monitor, TriangleAlert} from 'lucide-react';
import {Trash} from 'lucide-react';
import { monitorService } from '../../services/monitorService';
import {SquarePen} from "lucide-react";
import {Pause,Play} from "lucide-react";
import { LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer } from 'recharts';
const getErrorMessage=(errorCode)=>{
    if(!errorCode) return 'Unknown error';
    if(errorCode.startsWith('SERVER_CRASHED_')){
        const code=errorCode.split('_').pop();
        return `Server error (${code})`;
    }
    switch(errorCode){
        case 'URL_DOES_NOT_EXIST':
            return 'URL / Domain does not exist';
        case 'TIMEOUT':
            return 'Connection Timeout';
        case "UNKNOWN_DOWN":
            return 'Network issues'
        default: return 'Unknown error';
    }
}

export default function StatusPanel({monitor,onDelete,savedError,onPause,onEdit,fetchIncidents}){
    const max_bars=30;
    const isDown=monitor.status=='down';
    const [showError,setShowError]=useState(false);
    const [incidents,setIncidents]=useState([])
    const paddingNeeded=Math.max(0,max_bars-monitor.history.length);
    const emptyPlaceholders=Array(paddingNeeded).fill({status:'empty'});
    const fullTimeline=[...emptyPlaceholders,...monitor.history.slice(-max_bars)]
    const upCount=monitor.history.filter(p=>p.status==='up').length;
    const downCount=monitor.history.filter(p=>p.status==='down').length
    const [dayHistory,setDayHistory]=useState(null)
    
    
    useEffect(()=>{
        if(isDown && monitor.error){
            setShowError(true);
        }else{
        setShowError(false);
        }
    },[monitor.error,monitor.status]);

    const Duration=(seconds)=>{
        if(seconds==null){
            return null
        }
        if(seconds<60) {
            return `${seconds}s`
        }
        if(seconds<3600){
            return `${Math.round(seconds/60)}m`
        }
        return `${Math.round(seconds/3600)}h ${Math.round((seconds % 3600)/60)}m`
    }

    useEffect(()=>{
        const loadIncidents=async()=>{
            const data=await fetchIncidents(monitor.id)
            if(Array.isArray(data)){
                setIncidents(data)
                console.log("current incident state:",incidents);
            }else{
                setIncidents([]);
            }
        }
        loadIncidents()
    },[monitor.id])

    useEffect(()=>{
        const load24h=async()=>{
            try {
                const res=await monitorService.fetch24h(monitor.id)
                setDayHistory(res);
            } catch (err) {
                console.error(`Error fetching 24h stats:`,err)
            }
        }
        load24h()
    },[monitor.id])

    const chartData=monitor.history.map(p=>({
        time:p.timestamp.slice(11,16),
        latency:p.latency,
        status:p.status
    }))
    const avgLatency=Math.round(
        monitor.history.filter(p=>p.latency>0).reduce((a,p)=>a+p.latency,0)/
        (monitor.history.filter(p => p.latency > 0).length || 1)
    )
    return(
        <div className={styles.statusPanel}>
            <div className={styles.statusPanelHeader}>
                <div>
                    <h2 className={styles.friendlyName}>{monitor.name}</h2>
                    <p className={styles.panelUrl}>{monitor.url}</p>
                </div>
                <span className={isDown ? styles.pillDown : styles.pillUp}>
                    {monitor.status==='down' ? 'DOWN':"ONLINE"}
                </span>
            </div>
            <div className={styles.btns}>
                <button className={styles.pausebtn} onClick={()=>onPause(monitor.id)}>{monitor.is_paused? <Play size={14}/> :<Pause size={14}/>}{monitor.is_paused ? 'Resume' :"Pause"}</button>
                <button className={styles.editbtn} onClick={()=>onEdit(monitor)}><SquarePen size={14}/> Edit</button>
                <button className={styles.deletebtn} 
                onClick={()=>onDelete(monitor.id)}
                ><Trash size={14}/>Delete</button>
            </div>
           

            {showError &&(
                <div className={styles.errorBanner}>
                    <div className={styles.errorContent}>
                        <span className={styles.errorIcon}><TriangleAlert size={16}/> </span>
                        <div className={styles.errorText}>
                            <strong>Issue Detected:</strong>
                            <span>{getErrorMessage(monitor.error)}</span>
                        </div>
                    </div>
                </div>
            )}
            <div className={styles.statusLabel}>
                Most Recent Status
            </div>
            <div className={styles.statusWhole}>
                <div className={styles.statusCard}>
                    <p className={styles.statusLabel}>Current Latency</p>
                    <p className={styles.statusValue}>
                        {monitor.currentLatency ? `${monitor.currentLatency}ms`:'--'}
                    </p>
                </div>
                <div className={styles.statusCard}>
                    <p className={styles.statusLabel}> Avg Latency</p>
                    <p className={styles.statusValue}>
                        {avgLatency}ms
                    </p>
                </div>

                <div className={styles.statusCard}>
                <p className={styles.statusLabel}>Uptime(24h)</p>
                <p className={`${styles.statusValue} ${isDown ? styles.valueDown : styles.valueUp}`}>
                    { dayHistory?.uptime24h != null ? `${dayHistory.uptime24h}%` : '--'}
                </p>
            </div>

            <div className={styles.statusCard}>
                <p className={styles.statusLabel}>Checks up(24h)</p>
                <p className={`${styles.statusValue} ${dayHistory?.upCount24h > 0 ? styles.valueUp : styles.valueDown}`}>
                    {dayHistory?.upCount24h ?? '--'}
                </p>
            </div>

            <div className={styles.statusCard}>
                <p className={styles.statusLabel}>Checks down(24h)</p>
                <p className={`${styles.statusValue} ${dayHistory?.downCount24h > 0 ? styles.valueDown : ''}`}>
                    {dayHistory?.downCount24h ?? '--'}
                </p>
            </div>
            </div>

            <div className={styles.statusBarsSection}>
                <p className={styles.sectionLabel}>
                    RESPONSE TIMELINE
                </p>
                <div className={styles.smallerPanel}>
                    {fullTimeline.map((ping,index)=>(
                        <div key={index} className={styles.statusBarLines}>
                            <div className={`${styles.statusBar} ${ping.status=='up' ? 
                                styles.barUp: ping.status=="down" ? 
                                styles.barDown :styles.barEmpty  }`}>
                                {ping.status !=='empty' && ping.timestamp && (
                                    <span className={styles.toolTip}>
                                        {new Date(ping.timestamp).toLocaleString(undefined,{
                                            month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'
                                        })}
                                        {'-'}
                                        {ping.status==='up'?"Up":"Down"}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className={styles.timeLineLabels}>
                    <span>Last 30 checks</span>
                    <span>Just now</span>
                </div>
                <div className={styles.sectionLabel}>
                    <p className={styles.sectionLabel}>LATENCY TREND</p>
                    <div className={styles.chartWrapper}>
                        <ResponsiveContainer width='100%' height={180}>
                            <LineChart data={chartData}>
                                <CartesianGrid stroke="#1e1e2e" strokeDasharray="3 3" vertical={false}/>
                                <XAxis dataKey="time" stroke='rgba(255,255,255,0.3' fontSize={10}/>
                                <YAxis stroke='rgba(255,255,255,0.3)' fontSize={10}/>
                                <Tooltip
                                    contentStyle={{background:'#111118',border:'1px solid #1e1e2e', borderRadius:8, fontSize:12}}
                                    labelStyle={{color:'#f1f5f9'}}
                                />
                                <Line type='monotone' dataKey='latency' stroke='#10b981' strokeWidth={2} dot={false}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className={styles.incidentSection}>
                    <p className={styles.sectionLabel}>
                        INCIDENT HISTORY
                    </p>
                    {incidents.length===0 ?(
                        <p className={styles.noincidents}>No incidents recorder for this monitor</p>
                    ):(
                        <div className={styles.incidentList}>
                            {incidents.map(incident=>(
                                <div key={incident.id} className={styles.incidentRow}>
                                    <div className={styles.incidentTop}>
                                        <span className={incident.resolved_at ? styles.resolve: styles.ongoing}>
                                            {incident.resolved_at ? 'Resolved' :'Ongoing'}
                                        </span>
                                        <span className={styles.incidentError}>{getErrorMessage(incident.error)}</span>
                                    </div>
                                    <div className={styles.incidentDetails}>
                                        <span className={styles.detailItem}>
                                            <strong>Started:</strong>{new Date(incident.started_at).toLocaleString()}
                                        </span>
                                        {incident.resolved_at ? (
                                            <span className={styles.detailItem}>
                                                <strong>Resolved:</strong>{new Date(incident.resolved_at).toLocaleString()}
                                            </span>
                                        ):(
                                            <span className={styles.detailItemongoing}>Still ongoing</span>
                                        )}
                                        {incident.duration_seconds !=null &&(
                                            <span className={styles.detailItem}>
                                                <strong>Duration:</strong>{Duration(incident.duration_seconds)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}