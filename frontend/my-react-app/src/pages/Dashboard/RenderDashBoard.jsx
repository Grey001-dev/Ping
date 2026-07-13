import { useState,useEffect } from "react";
import MonitorStats from "../../Components/Sidebar/MonitorStats.jsx";
import StatusPanel from "../../Components/StatusPanel/StatusPanel.jsx";
import MonitorForm from "../../Components/MonitorForm/MonitorForm.jsx";
import styles from './RenderDashboard.module.css';
import { monitorService } from "../../services/monitorService.js";
import {io} from "socket.io-client"
import { Plus } from "lucide-react";

export default function MonitorDashboard(){
  const [monitors,setMonitors]=useState([])
  const [selectedId,setSelectedId]=useState(null);
  const [view,setView]=useState('empty')
  const [loading,setLoading]=useState(true);
  const selectedMonitor=monitors.find(m=>m.id===selectedId) ?? null;
  const token= localStorage.getItem('token');
  const [edit,setEdit]=useState(false);
  // fetch monitors on load
  useEffect(()=>{
    fetchMonitors();
  },[]);

  useEffect(()=>{
    const BASE_URL=import.meta.env.VITE_API_BASE_URL || 'https://ping-7u78.onrender.com';
    const socket=io(BASE_URL);

  // After listening for the broadcast from my backend
    socket.on('monitor-updated',(updatedData)=>{
      console.log("Real-time update recieved from backend: ",updatedData)
      setMonitors((prevMonitors)=>
      prevMonitors.map((m)=>{
        if (m.id != updatedData.id) return m;

        const newHistory=[...m.history,{
          status:updatedData.status,
          latency:updatedData.latency,
          timestamp:new Date().toISOString()
        }].slice(-30); 
        const upCount=newHistory.filter((p)=>p.status==="up").length;
        const downCount=newHistory.filter((p)=>p.status==="down").length;
        const uptime = newHistory.length > 0 ? Math.round((upCount / newHistory.length) * 100) : 0;
        console.log(`up:${upCount}, down:${downCount}`);
        
        return{
          ...m,
          status:updatedData.status,
          currentLatency:updatedData.latency,
          error:updatedData.error || (m.status==='down' ? m.error:null),
          history:newHistory,
          upCount,
          downCount,
          uptime
        }
      }
      )
      );
    });
    return()=>{
      socket.disconnect()
    };
  },[])

  useEffect(()=>{
    const interval=setInterval(()=>{
      fetchMonitors();
    },60000);

    return ()=> clearInterval(interval);
  },[]);

  async function fetchMonitors(){
    try {
      const data=await monitorService.getAll()
      console.log(data)
      if (Array.isArray(data)){
        setMonitors(data);
      }else{
        setMonitors([]);
        console.log("Backend did not return an array:",data.message)
      }

    } catch (error) {
      console.log(`Error caught while fetching monitors:`,error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchIncidents(id){
    try {
      const data=await monitorService.incidents(id)
      return data
    } catch (error) {
      console.log('Error caught fetching incidents')
    }
  }

    function handleSelect(id){
    setSelectedId(id);
    setView('status');
  }

    function handleAddNewClick(){
      setSelectedId(null);
      setView('add')
    }

    function handleEditClick(){
      setView("edit")
    }

   async function handleMonitorCreated(newmonitor){
      try {
        const data=await monitorService.create(newmonitor)
        if(data && data.id){
          setMonitors(prev=>[...prev,data]);
          setSelectedId(data.id);
          setView('status');
        }
      } catch (err) {
        console.error('Error creating monitor:',err)
      }
      

    }
    async function handleMonitorDeleted(id){
      try {
        const data=await monitorService.delete(id)
        setMonitors(prev=>prev.filter(m=>m.id !==id))
        setSelectedId(null);
        setView('empty');
      } catch (error) {
        console.log("Error deleting monitor:",error)
      }
    }

    async function handleMonitorPaused(id){
      try {
        const data=await monitorService.pause(id);
        setMonitors(prev=>prev.map(m=>
        m.id===id ? {...m,is_paused:data.is_paused}:m
        ));
        console.log(`${data.is_paused} `)

      } catch (err) {
        console.error("Error toggling pause:",err)
      }
    }

    async function handleEdit(newMonitor,id) {
      try {
        const data=await monitorService.edit(newMonitor,id);
        console.log('Edit response:',data)
        if(data && data.id){
          setMonitors(prev=>prev.map(m=>m.id===id ? {...data,history:m.history}:m));
          setSelectedId(id);
          setView('status');
        }

      } catch (err) {
        console.error('Error editing monitor:',err)
      }
    }
    return(
    <div className={styles.dashboardRoot}>
        <MonitorStats 
        monitors={monitors}
        selectedId={selectedId}
        onSelect={handleSelect}
        onAddClick={handleAddNewClick}
        loading={loading}
        />
        
        <main className={styles.mainPanel}>
            {/* Basically those views are used to know what to render and all 

            If status then we display our status panel else if add we display our add,

            if empty we show the user our empty state 
            */}
            {view=='status' && selectedMonitor&& 
            <StatusPanel monitor={selectedMonitor} onDelete={handleMonitorDeleted} onPause={handleMonitorPaused} onEdit={handleEditClick} fetchIncidents={fetchIncidents}/>
            }
            {
              view=='add' && 
              <MonitorForm onMonitorCreated={handleMonitorCreated} />
            }
            {
              view==='edit' && selectedMonitor &&
              <MonitorForm onMonitorCreated={handleMonitorCreated} onMonitorEdited={handleEdit} existingMonitor={selectedMonitor}/>
            }

            {
              view==='empty' &&
              <EmptyState  hasMonitors={monitors.length>0}/>
            }           
        </main>    
    </div>
    )
}


function EmptyState({ hasMonitors }) {
  if (!hasMonitors) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <div className={styles.pulseBars}>
            <span className={styles.PulseBar} style={{height:'30%'}}></span>
            <span className={styles.PulseBar} style={{height:'60%'}}></span>
            <span className={styles.PulseBar} style={{height:'90%'}}></span>
            <span className={styles.PulseBar} style={{height:'50%'}}></span>
            <span className={styles.PulseBar} style={{height:'75%'}}></span>
            <span className={styles.PulseBar} style={{height:'40%'}}></span>
          </div>
        </div>
        <h2 className={styles.emptyTitle}>
            No monitors yet
        </h2>
        <p className={styles.emptyText}>
          Start tracking uptime for the things you care about
        </p>
        <div className={styles.Cards}>
          <div className={styles.card}>
            <span className={styles.Label}>
              HTTP(S)
            </span>
            <span className={styles.description}>
                Websites & APIs
            </span>
          </div>

          <div className={styles.card}>
            <span className={styles.Label}>
                TCP Port
            </span>
            <span className={styles.description}>
              Databases & servers
            </span>
          </div>

          <div className={styles.card}>
            <span className={styles.Label}>
              ICMP Ping
            </span>
            <span className={styles.description}>
                Raw connectivity
            </span>
          </div>
        </div>
        <p className={styles.emptyHint}>
          Click <strong> "+New Monitor"</strong> in the sidebar to get started
        </p>
      </div>
  )
  }
  return (
    <div className={styles.emptyState}>
      <p className={styles.emptyText}>Select a monitor from the sidebar to view its status</p>
    </div>
  );
}
