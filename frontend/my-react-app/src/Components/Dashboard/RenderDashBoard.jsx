import { useState,useEffect } from "react";
import MonitorStats from "./MonitorStats/MonitorStats.jsx";
import StatusPanel from "./RightPanel/StatusPanel.jsx";
import MonitorForm from "./RightPanel/MonitorForm.jsx";
import styles from './RenderDashboard.module.css';


export default function MonitorDashboard(){
  const [monitors,setMonitors]=useState([])
  const [selectedId,setSelectedId]=useState(null);
  const [view,setView]=useState('empty')
  const [loading,setLoading]=useState(true);
  const selectedMonitor=monitors.find(m=>m.id===selectedId) ?? null;

  const token= localStorage.getItem('token');
  // fetch monitors on load
  useEffect(()=>{
    fetchMonitors();
  },[]);


  useEffect(()=>{
    const interval=setInterval(()=>{
      fetchMonitors();
    },60000);

    return ()=> clearInterval(interval);
  },[]);

  async function fetchMonitors(){
    try {
      const res=await fetch('http://localhost:5000/api/monitors',{
        headers:{
          'Authorization':`Bearer ${token}`
        }
      });
      const data=await res.json()
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

   async function handleMonitorCreated(newmonitor){
      try {
        const res=await fetch('http://localhost:5000/api/monitors',{
          method:'POST',
          headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`
          },

          body:JSON.stringify(newmonitor)
        })
        const saved=await res.json()
        if(Array.isArray(saved)){
          setMonitors(prev=>[...prev,saved])
        }else{
          console.log("Backend coundn't return array:",data.message)
        }
        
        setSelectedId(saved.id)
        setView('status')
      } catch (err) {
        console.error('Error creating monitor:',err)
      }
      

    }
    async function handleMonitorDeleted(id){
      try {
        await fetch(`http://localhost:5000/api/monitors/${id}`,{
          method:'DELETE',
          headers:{'Authorization':`Bearer ${token}`}
        })
        setMonitors(prev=>prev.filter(m=>m.id !==id))
        setSelectedId(null);
        setView('empty');
      } catch (error) {
        console.log("Error deleting monitor:",error)
      }
    }
    return(
    <div className={styles.dashboardRoot}>
        <MonitorStats 
        monitors={monitors}
        selectedId={selectedId}
        onSelect={handleSelect}
        onAddClick={handleAddNewClick}
        />
        

        <main className={styles.mainPanel}>
            {/* Basically those views are used to know what to render and all 

            If status then we display our status panel else if add we display our add,

            if empty we show the user our empty state 
            */}
            {view=='status' && selectedMonitor&& 
            <StatusPanel monitor={selectedMonitor} onDelete={handleMonitorDeleted}/>
            }
            {
              view=='add' && 
              <MonitorForm onMonitorCreated={handleMonitorCreated}/>
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

