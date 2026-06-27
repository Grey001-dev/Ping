import styles from './StatusPanel.module.css'
import { useEffect, useState } from 'react';
const getErrorMessage=(errorCode)=>{
    switch(errorCode){
        case 'URL_DOES_NOT_EXIST':
            return 'Url/domain does not exist';
        case 'TIMEOUT':
            return 'Connection Timeout';
        case "UNKNOWN_DOWN":
            return 'Network issues'
        default:
            if(errorCode?.startsWith('SERVER_CRASHED')){
                const code=errorCode.split('_')[2];
                return `Web Server Crashed /encountered an HTTP${code} internal error.`
            }
            return 'An unexpected issue was detected.';
    }
}

export default function StatusPanel({monitor,onDelete}){
    const max_bars=25;
    const isDown=monitor.status=='down';
    const [showError,setShowError]=useState(false);
    const paddingNeeded=Math.max(0,max_bars-monitor.history.length);
    const emptyPlaceholders=Array(paddingNeeded).fill({status:'empty'});
    const fullTimeline=[...emptyPlaceholders,...monitor.history.slice(-max_bars)]
    const upCount=monitor.history.filter(p=>p.status==='up').length;
    const downCount=monitor.history.filter(p=>p.status==='dowm').length
    useEffect(()=>{
        if(isDown && monitor.error){
            setShowError(true);

            const timer=setTimeout(()=>{
                setShowError(false);
            },5000);
            return ()=> clearTimeout(timer);

        }else{
            setShowError(false);
        }
    },[monitor.error,isDown,monitor.status])

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
                    {isDown ? 'DOWN':"ONLINE"}
                </span>
            </div>
            <button
            className={styles.deleteBtn}
            onClick={()=>onDelete(monitor.id)}
            >Delete</button>

            {showError &&(
                <div className={styles.errorBanner}>
                    <div className={styles.errorContent}>
                        <span className={styles.errorIcon}>⚠️</span>
                        <div className={styles.errorText}>
                            <strong>Issue Detected:</strong>{getErrorMessage(monitor.error)}
                        </div>
                    </div>
                    <div className={styles.progressBar}></div>
                </div>
            )}

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
            </div>

        </div>
    )
}