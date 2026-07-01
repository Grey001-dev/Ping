import styles from './StatusPanel.module.css'
import { useEffect, useState } from 'react';
import {Monitor, TriangleAlert} from 'lucide-react';
import {Trash} from 'lucide-react';
import {SquarePen} from "lucide-react";
import {Pause} from "lucide-react";
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

export default function StatusPanel({monitor,onDelete,savedError,onPause,onEdit}){
    const max_bars=25;
    const isDown=monitor.status=='down';
    const [showError,setShowError]=useState(false);
    const paddingNeeded=Math.max(0,max_bars-monitor.history.length);
    const emptyPlaceholders=Array(paddingNeeded).fill({status:'empty'});
    const fullTimeline=[...emptyPlaceholders,...monitor.history.slice(-max_bars)]
    const upCount=monitor.history.filter(p=>p.status==='up').length;
    const downCount=monitor.history.filter(p=>p.status==='down').length
    
    
    useEffect(()=>{
        if(isDown && monitor.error){
            setShowError(true);
        }else{
        setShowError(false);
        }
    },[monitor.error,monitor.status]);

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
                <button className={styles.pausebtn} onClick={()=>onPause(monitor.id)}><Pause size={14}/>{monitor.is_paused ? 'Resume' :"Pause"}</button>
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
                    <p className={styles.statusLabel}>
                        Uptime
                    </p>
                    <p className={`${styles.statusValue} ${isDown ? styles.valueDown : styles.valueUp}`}>
                        {monitor.uptime}%
                    </p>
                </div>

                <div className={styles.statusCard}>
                    <p className={styles.statusLabel}>Checks up</p>
                    <p className={`${styles.statusValue} ${monitor.upCount>0 ? styles.valueUp : styles.valueDown}`}>
                        {monitor.upCount}
                    </p>
                </div>

                <div className={styles.statusCard}>
                    <p className={styles.statusLabel}>Checks down</p>
                    <p className={`${styles.statusValue } ${monitor.downCount>0 ?styles.valueDown :''}`}>
                        {monitor.downCount}
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
                                styles.barDown :styles.barEmpty  }`}/>
                        </div>
                    ))}
                </div>
                <div className={styles.timeLineLabels}>
                    <span>60 mins ago</span>
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
            </div>
        

        </div>
    )
}