import SkeletonItem from "../Common/SkeletonItem.jsx"
import { Plus } from "lucide-react";
import styles from './MonitorStats.module.css';
export default function MonitorStats({monitors,selectedId,onSelect,onAddClick,loading}){
    const upCount=monitors.filter(m=>m.status=='up').length
    const downCount=monitors.filter(m=>m.status=='down').length
    return(
        <div className={styles.sidebar}>
            <div className={styles.topPanel}>
                <h1 className={styles.panelTitle}>Monitors</h1>
                {monitors.length>0 && (
                    <div className={styles.badges}>
                        <span className={styles.totalBadge}>Total : {monitors.length}</span>
                        <span className={styles.upBadge}>Up :{upCount}</span>
                        <span className={styles.downBadge}>Down :{downCount}</span>
                    </div>
                )}
            </div>
            <div className={styles.monitorList}>
            {loading ?(
                <>
                <SkeletonItem/>
                <SkeletonItem/>
                <SkeletonItem/>
                </>

            ):
            (monitors.map(monitor=>(
                <MonitorItem
                key={monitor.id}
                monitor={monitor}
                isActive={monitor.id===selectedId}
                onClick={()=>onSelect(monitor.id)}
                />
            ))
            )}
            </div>
            <div className={styles.footer}>
                <button className={styles.addBtn}
                onClick={onAddClick}
                ><Plus size={14} className={styles.icon}/> New Monitor</button>
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


