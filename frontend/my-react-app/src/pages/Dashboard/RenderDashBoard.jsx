import { useState,useEffect } from "react";
import MonitorStats from "../../Components/Sidebar/MonitorStats.jsx";
import StatusPanel from "../../Components/StatusPanel/StatusPanel.jsx";
import MonitorForm from "../../Components/MonitorForm/MonitorForm.jsx";
import styles from './RenderDashboard.module.css';
import { monitorService } from "../../services/monitorService.js";
import {io} from "socket.io-client"

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
    const socket=io("http://localhost:5000");

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
        }].slice(-25); 
        return{
          ...m,
          status:updatedData.status,
          currentLatency:updatedData.latency,
          error:updatedData.error || (m.status==='down' ? m.error:null),
          history:newHistory
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
        console.log(`${data.is_paused}`)

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
            <StatusPanel monitor={selectedMonitor} onDelete={handleMonitorDeleted} onPause={handleMonitorPaused} onEdit={handleEditClick}/>
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

