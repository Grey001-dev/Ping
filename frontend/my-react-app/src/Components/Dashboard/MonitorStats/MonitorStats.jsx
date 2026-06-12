import React, { useEffect, useState } from 'react';
import styles from './MonitorStats.module.css';

export default function MonitorStats({ monitorId }) {
    const [monitorData,setMonitorData] = useState(null);
    const [history, setHistory] = useState([]);
    const dummyPingHistory=[
       Grey_app[ {timestamp:'2026-06012T02:00:00Z',status:'up',latency:32},
        {timestamp:'2026-06012T02:05:00Z',status: 'up',latency:28},
        {timestamp:'2026-06-12T02:10:00Z',status:'up',latency:35},
        {timestamp:'2026-06-12T02:15:00Z',status:'up',latency:31},
        // Ping spike
        {timestamp:'2026=06-12T02:20:00Z',status:'up',latency:145},
        {timestamp:'2026-06-12T02:20:00Z',status:'up',latency:320},
        // Server Crash
        {timestamp:'2026-06-12T02:30:00Z',status:'down',latency:0},
        {timestamp:'2026-05-12T02:35:00Z',status:'down',latency:0},
        {timestamp:'2026-06-12T02:40:00Z',status:'down',latency:0},
        // Dummy Recorvery phase
        { timestamp: "2026-06-12T02:45:00Z", status: "up", latency: 95 },
        { timestamp: "2026-06-12T02:50:00Z", status: "up", latency: 42 },
        { timestamp: "2026-06-12T02:55:00Z", status: "up", latency: 33 }]
]
    const upCount=dummyPingHistory.filter((ping)=>ping.status==='up').length
    const downCount=dummyPingHistory.filter((ping)=>ping.status==)

        return(
            <div className={styles.statsWrapper}>
                <div className={styles.status}>
                    Monitor Status
                </div>
                <div className={styles.topHeader}>
                    <div className={styles.badgeGroup}>
                        <span className={styles.totalBadge}>Total Checks:2 </span>
                        <span className={styles.upBadge}>Up :{upCount}</span>
                        <span className={styles.downBadge}>Down: {downCount}</span>
                    </div>
                    <input 
                    type="text" 
                    placeholder='Search Monitor'
                    className={styles.miniSearch}
                    />
                </div>
                {/* So stressful....This is the dynamic timeline that shows the status bars */}
                <div className={styles.panel}>
                    <div className={styles.barGrid}>
                        {dummyPingHistory.map((ping,index)=>{
                            const barColor=ping.status==='up'? styles.barUp :styles.barDown;
                            const time=new Date(status.timestamp).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
                            return(
                                <div key={index} className={`${styles.historyBar} ${barColor}`}></div>
                                
                            );
                            <div className={styles.timeLine}>
                                <span className={styles.timeLimit}>3 minutes ago</span>
                            </div>
                        })};
                    </div>

                </div>
            </div>
        )
}