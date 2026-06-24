import styles from './StatusPanel.module.css'


export default function StatusPanel({monitor,onDelete}){
    const max_bars=25;
    const isDown=monitor.status=='down';

    const paddingNeeded=Math.max(0,max_bars-monitor.history.length);
    const emptyPlaceholders=Array(paddingNeeded).fill({status:'empty'});
    const fullTimeline=[...emptyPlaceholders,...monitor.history.slice(-max_bars)]

    const upCount=monitor.history.filter(p=>p.status=='up').length
    const DownCount=monitor.history.filter(s=>s.status=='down').length

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
                        {monitor.uptime}
                    </p>
                </div>

                <div className={styles.statusCard}>
                    <p className={styles.statusLabel}>Checks up</p>
                    <p className={`${styles.statusValue} ${upCount>0 ? styles.valueUp : styles.valueDown}`}>
                        {upCount}
                    </p>
                </div>

                <div className={styles.statusCard}>
                    <p className={styles.statusLabel}>Checks down</p>
                    <p className={`${styles.statusValue } ${DownCount>0 ?styles.valueDown :''}`}>
                        {DownCount}
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