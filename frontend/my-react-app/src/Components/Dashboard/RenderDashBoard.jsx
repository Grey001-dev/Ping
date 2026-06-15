import { useState } from "react";
import MonitorStats from "./MonitorStats/MonitorStats.jsx";
import StatusPanel from "./RightPanel/StatusPanel.jsx";
import MonitorForm from "./RightPanel/MonitorForm.jsx";
import styles from './RenderDashboard.module.css';

const DUMMY_MONITORS=[
    {
        id:1,
        name:'Grey App',
        url:'https://greyapp.io',
        status:'up',
        uptime:'99.8%',
        currentLatency:32,
        avgLatency:41,
        history: [
            {status:'up',latency:32,timestamp:'2026-06-12T02:00:00Z'},
            {status:'up',latency:28,timestamp : '2026-06-12T02:05:00Z'},
            {status:'up',latency:35,timestamp:'2026-06-12T02:10:00Z'},
            {status:'down',latency:0,timestamp:'2026-06-12T02:30:00Z'},
            {status:'up',latency:42, timestamp: '2026-06-12T02:50:00Z' },

        ]
    },
     {
    id: 2,
    name: 'Main API',
    url: 'https://api.example.com',
    status: 'up',
    uptime: '97.2%',
    currentLatency: 15,
    avgLatency: 22,
    history: [
      { status: 'up', latency: 15, timestamp: '2026-06-12T02:00:00Z' },
      { status: 'up', latency: 18, timestamp: '2026-06-12T02:05:00Z' },
      { status: 'down', latency: 0, timestamp: '2026-06-12T02:10:00Z' },
      { status: 'down', latency: 0, timestamp: '2026-06-12T02:30:00Z' },
      { status: 'up', latency: 22, timestamp: '2026-06-12T02:50:00Z' },
    ],
  },
  {
    id: 3,
    name: 'Pi-hole',
    url: 'http://192.168.1.1/admin',
    status: 'down',
    uptime: '84.1%',
    currentLatency: 0,
    avgLatency: 4,
    history: [
      { status: 'up', latency: 4, timestamp: '2026-06-12T02:00:00Z' },
      { status: 'down', latency: 0, timestamp: '2026-06-12T02:10:00Z' },
      { status: 'down', latency: 0, timestamp: '2026-06-12T02:20:00Z' },
      { status: 'down', latency: 0, timestamp: '2026-06-12T02:30:00Z' },
    ],
  },
]
export default function MonitorDashboard(){
    const [monitors,setMonitors]=useState(DUMMY_MONITORS)
    const [selectedId,setSelectedId]=useState(null);
    cont [view,setView]=useState(null)
    const selectedMonitor=monitors.find(m=>m.id===selectedId) ?? null;

    function handleSelect(id){
    setSelectedId(id);
    setView('status');
  }

    function handleAddNewClick(){
      setSelectedId(null);
      setView('add')
    }

    function handleMonitorCreated(newmonitor){
      setMonitors(prev=>[...prev,newmonitor]),
      setSelectedId(newmonitor.id)
      setView('status')
    }
    return(
    <div className={styles.dashboardRoot}>
        <MonitorStats 
        monitors={monitors}
        selectedId={selectedId}
        onSelect={handleSelect}
        onAddClick={handleAddClick}
        />
        <main className={styles.mainPanel}>
            {/* Basically those views are used to know what to render and all 
            If status then we display our status panel else if add we display our add,
            if empty we show the user our empty state 
            */}
            {view=='status' && selectedMonitor&& 
            <StatusPanel monitor={selectedMonitor}/>
            }
            {
              view=='add' && 
              <MonitorForm onMonitorCreated={handleMonitorCreated}/>
            }
            {
              view=='empty' &&
              <EmptyState/>
            }
            
        </main>
    </div>
    )
}

function EmptyState() {
  return(
    <div className={styles.emptyState}>
      <p>Select a monitor to view its status</p>

    </div>
  )
}

