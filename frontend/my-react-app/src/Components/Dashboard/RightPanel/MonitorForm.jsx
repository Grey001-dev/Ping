import { useState } from 'react'
import styles from './MonitorForm.module.css'

export default function MonitorForm({onMonitorCreated,onMonitorEdited,existingMonitor}){
    const isEdit=existingMonitor ? true: false;
    const [monitorType,setMonitorType]=useState(existingMonitor?.type|| 'HTTP');
    const [friendlyName,setFriendlyName]=useState(existingMonitor?.name || '')
    const [url,setUrl]=useState(existingMonitor?.url || '');
    const [interval,setInterval]=useState(existingMonitor?.interval || 20);
    const [retries,setRetries]=useState(existingMonitor?.retries || 3);
    const [httpMethod,setHttpMethod]=useState(existingMonitor?.method || 'GET')
    const [bodyEncoding,setBodyEncoding]=useState('JSON')
    const [requestBody,setRequestBody]=useState('')

    const handleSubmit=(e)=>{
        e.preventDefault();
        if(!friendlyName.trim() || !url.trim()) return
        
        const newMonitor={
            id:Date.now(),
            name:friendlyName,
            url:url,
            interval:interval,
            retries:retries,
            type:monitorType,
            history:[]
        };
        if(isEdit){
            onMonitorEdited(newMonitor,existingMonitor.id)
        }else{
            onMonitorCreated(newMonitor) 
        }   
    }

    return(
        <div className={styles.formWrapper}>
            <h1 className={styles.formTitle}>{isEdit ? 'Edit Monitor':'Add new Monitor'}</h1>
            <form action="" onSubmit={handleSubmit} className={styles.gridContainer}>
                
                {/* 1. LEFT COLUMN */}
                <div className={styles.leftColumn}>
                    <div className={styles.panel}>
                        <h2 className={styles.panelHeading}>General</h2>
                        
                        <div className={styles.inputs}>
                            <label className={styles.label}>Monitor Type</label>
                            <select 
                                onChange={(e)=>setMonitorType(e.target.value)}
                                value={monitorType}    
                                className={styles.inputField}
                            >
                                <option value='HTTP'>HTTP(s)</option>
                                <option value="PING">PING</option>
                                <option value="PORT">TCP PORT</option>
                            </select>
                        </div>

                        <div className={styles.inputs}>
                            <label className={styles.label}>Friendly Name</label>
                            <input 
                                type="text" 
                                placeholder='My Website' 
                                className={styles.inputField} 
                                value={friendlyName} 
                                onChange={(e)=>setFriendlyName(e.target.value)} 
                            />
                        </div>
                        
                        <div className={styles.inputs}>
                            <label className={styles.label}>URL</label>
                            <input type="text" 
                            placeholder='https://example.com'
                            className={styles.inputField}
                            value={url}
                            onChange={(e)=>setUrl(e.target.value)}
                            />
                        </div>

                        <div className={styles.inputs}>
                            <label className={styles.label}> Heartbeat Interval(check every 20sec)</label>
                            <input 
                                type="text" 
                                onChange={(e)=>setInterval(e.target.value)}
                                value={interval}
                                className={styles.inputField}
                            />
                        </div>

                        <div className={styles.inputs}>
                            <label className={styles.label}>Retries</label>
                            <input 
                                type="text" 
                                onChange={(e)=>setRetries(e.target.value)}
                                value={retries}
                                className={styles.inputField}
                            />
                        </div>
                        <span className={styles.inputHint}>Maximum retries before the service is marked as down</span>

                        {monitorType === 'HTTP' && (
                            <div className={styles.panel}>
                                <h2 className={styles.panelHeading}>HTTP Options</h2>
                                <div className={styles.inputs}>
                                    <label className={styles.label}>Method</label>
                                    <select 
                                        value={httpMethod} 
                                        onChange={(e)=>setHttpMethod(e.target.value)}
                                        className={styles.inputField}
                                    >
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>
                </div> 

                {/* The RIGHT COLUMN  starts here*/}
                <div className={styles.rightColumn}>
                    <div className={styles.panel}>
                        <h2 className={styles.panelHeading}>Notifications</h2>
                        <p className={styles.statusText}>Not available,please setup</p>
                        <button type='button' className={styles.utilityBtn}>
                            Setup Notifications
                        </button>
                    </div>

                    
                    <div className={styles.panel}>
                        <h2 className={styles.panelHeading}>Proxy</h2> 
                        <p className={styles.statusText}>Not available,please setup.</p> 
                        <button type='button' className={styles.utilityBtn}>
                            Setup Proxy
                        </button>
                    </div>
                    <div className={styles.actionRow}>
                        <button type='submit' className={styles.saveBtn} >
                            {isEdit ? 'Update Monitor':'Save Monitor'}
                        </button>
                    </div>
                </div> 
            </form>
        </div>
    );
}