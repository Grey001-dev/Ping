

import styles from './MonitorStats.module.css';
export default function MonitorStats({monitors,selectedId,onSelect,onAddClick,loading}){
    const upCount=monitors.filter(m=>m.status=='up').length
    const downCount=monitors.filter(m=>m.status=='down').length
    return(
        <div className={styles.sidebar}>
            <div className={styles.topPanel}>
                <h1 className={styles.panelTitle}>Monitors</h1>
                <div className={styles.badges}>
                    <span className={styles.totalBadge}>Total : {monitors.length}</span>
                    <span className={styles.upBadge}>Up :{upCount}</span>
                    <span className={styles.downBadge}>Down :{downCount}</span>
                </div>
            </div>
            <div className={styles.monitorList}>
            {monitors.map(monitor=>(
                <MonitorItem
                key={monitor.id}
                monitor={monitor}
                isActive={monitor.id===selectedId}
                onClick={()=>onSelect(monitor.id)}
                />
            ))}
            </div>
            <div className={styles.footer}>
                <button className={styles.addBtn}
                onClick={onAddClick}
                >+New Monitor</button>
            </div>

        </div>
    )
}
function MonitorItem({monitor,isActive,onClick}){
    const isDown=monitor.status=='down';
    return(
        <div className={`${styles.monitorItem} ${isActive ? styles.Active : ''} ${isDown ? styles.Down: ''}`
        }onClick={onClick}>
            <div className={styles.Rows}>
                <span className={`${styles.dot} ${isDown ? styles.dotDown : styles.dotUp}`}/>
                <span className={styles.monitorName}>{monitor.name}</span>
                <span className={`${styles.itemPct} ${isDown ? styles.pctDown : styles.pctUp}`}>{monitor.uptime}</span>
            </div>
            <div className={styles.miniBars}>
                {monitor.history.map((ping,index)=>(
                    <div key={index} className={
                        `${styles.miniBar} 
                        ${ping.status=="up" ? styles.miniBarUp : ping.status=='down' ? styles.miniBarDown : styles.miniBarEmpty}`
                    }>

                    </div>
                ))}
            </div>
        </div>
    )
}
function SkeletonItem(){
    return(
        <div className={styles.skeletonItem}>
            <div className={styles.skeletonRow}>
                <div className={styles.skeletonDot}/>
                <div className={styles.skeletonName}/>
                <div className={styles.sleletonPct}/>
            </div>
            <div className={styles.skeletonBars}>
                {Array(15).fill(null).map((_,i)=>(
                    <div key={i} className={styles.skeletonBar}/>
                ))}
            </div>
        </div>
    )
}