// import React, { useEffect, useState } from 'react';
// import styles from './MonitorStats.module.css';

// export default function MonitorStats({ monitorId }) {
//     const [monitorData,setMonitorData] = useState([]);
//     const [history, setHistory] = useState([]);
//     const [maxBars,setMaxBars]=useState(30)
//     //This is to resize my status bar upon shrinking for mobile and PC view
//     useEffect(()=>{
//         function handleResize(){
//             if(window.innerWidth<600){
//                 setMaxBars(15);
//             }else{
//                 setMaxBars(30)
//             }
//         }
//         handleResize()
//         window.addEventListener('resize',handleResize);
//         return ()=>window.removeEventListener('resize',handleResize)
//     },[])
//     const dummyPingHistory=[
//         {timestamp:'2026-06012T02:00:00Z',status:'up',latency:32},
//         {timestamp:'2026-06012T02:05:00Z',status: 'up',latency:28},
//         {timestamp:'2026-06-12T02:10:00Z',status:'up',latency:35},
//         {timestamp:'2026-06-12T02:15:00Z',status:'up',latency:31},
//         // Ping spike
//         {timestamp:'2026=06-12T02:20:00Z',status:'up',latency:145},
//         {timestamp:'2026-06-12T02:20:00Z',status:'up',latency:320},
//         // Server Crash
//         {timestamp:'2026-06-12T02:30:00Z',status:'down',latency:0},
//         {timestamp:'2026-05-12T02:35:00Z',status:'down',latency:0},
//         {timestamp:'2026-06-12T02:40:00Z',status:'down',latency:0},
//         // Dummy Recorvery phase
//         { timestamp: "2026-06-12T02:45:00Z", status: "up", latency: 95 },
//         { timestamp: "2026-06-12T02:50:00Z", status: "up", latency: 42 },
//         { timestamp: "2026-06-12T02:55:00Z", status: "up", latency: 33 }]
//     const monitorDataSet=[{
//         'monitorName':"Grey App",
//         'history':[
//             {"status":"up","latency":32,"timestamp":"2026-06-12T02:00:00Z"},
//             { "status": "up", "latency": 28, "timestamp": "2026-06-12T02:05:00Z" },
//             { "status": "up", "latency": 35, "timestamp": "2026-06-12T02:10:00Z" },
//             { "status": "down", "latency": 0, "timestamp": "2026-06-12T02:30:00Z" },
//             { "status": "up", "latency": 42, "timestamp": "2026-06-12T02:50:00Z" }
//         ]
//     },{
//       "monitorName": "Main API",
//       "history": [
//         { "status": "up", "latency": 15, "timestamp": "2026-06-12T02:00:00Z" },
//         { "status": "up", "latency": 18, "timestamp": "2026-06-12T02:05:00Z" },
//         { "status": "down", "latency": 0, "timestamp": "2026-06-12T02:10:00Z" },
//         { "status": "down", "latency": 0, "timestamp": "2026-06-12T02:30:00Z" },
//         { "status": "up", "latency": 22, "timestamp": "2026-06-12T02:50:00Z" }
//       ]
//     }
//         ]

//     const upCount=dummyPingHistory.filter((ping)=>ping.status==='up').length
//     const downCount=dummyPingHistory.filter((ping)=>ping.status==='down').length

//         return(
//             <div className={styles.statsWrapper}>
//                 <div className={styles.statusTitle}>
//                     Monitor Status
//                 </div>
//                 <div className={styles.topHeader}>
//                     <div className={styles.badgeGroup}>
//                         <span className={styles.totalBadge}>Total Checks : 2 </span>
//                         <span className={styles.upBadge}>Up :{upCount}</span>
//                         <span className={styles.downBadge}>Down: {downCount}</span>
//                     </div>
//                     <input 
//                     type="text" 
//                     placeholder='Search Monitor'
//                     className={styles.miniSearch}
//                     />
//                 </div>
//                 {/* So stressful....This is the dynamic timeline that shows the status bars */}
//                 <div className={styles.panel}>
//                 {monitorDataSet.map((monitor, index) => {
//                     // --- THE TIME MACHINE LOGIC ---
//                     // Calculate how many empty slots we need to fill up to MAX_BARS (30)
//                     const paddingNeeded = Math.max(0, maxBars - monitor.history.length);
                    
//                     const slicedHistory=monitor.history.slice(-maxBars)
//                     // Create an array filled with 'empty' placeholder objects
//                     const greyPlaceholders = Array(paddingNeeded).fill({ status: 'empty' });
                    
//                     // Combine them: grey slots go first (left), actual historical items go last (right)
//                     const fullTimelineHistory = [...greyPlaceholders, ...slicedHistory];

//                     return (
//                         <div className={styles.eachStatus} key={index}>
//                             <div className={styles.eachLayout}>
//                                 <div className={styles.monitorName}>
//                                     <h1>{monitor.monitorName}</h1>
//                                 </div>
//                                 <div className={styles.smallerPanel} key={maxBars}>
//                                     {fullTimelineHistory.map((ping, secondIndex) => {
//                                         // Pick the correct style class based on status string
//                                         let barColorClass = styles.barEmpty; // Default fallback
//                                         if (ping.status === 'up') barColorClass = styles.barUp;
//                                         if (ping.status === 'down') barColorClass = styles.barDown;

//                                         return (
//                                             <div key={secondIndex} className={styles.statusBar_time}>
//                                                 {/* Fixed the template string to use styles.statusBar */}
//                                                 <div className={`${styles.statusBar} ${barColorClass}`} />
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//                 </div>
//             </div>
    
//         )
//     }

import styles from './MonitorStats.module.css';
export default function MonitorStats({monitors,selectedId,onSelect}){
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
                <button className={styles.addBtn}>+New Monitor</button>
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