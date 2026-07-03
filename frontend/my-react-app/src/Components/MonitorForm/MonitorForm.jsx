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
    const [headersText,setHeadersText]=useState(`{\n "Authorization" : "Bearer Your_token"\n}`);
    const [requestBody,setRequestBody]=useState('{\n "key":"value"\n')

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
            request_body:httpMethod=="GET" ? requestBody : null,
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
                    
                    <div className={styles.panel}>
                        <h2 className={styles.panelHeading}>
                            Custom Headers
                        </h2>
                        <p className={styles.inputHint}>
                            Replace the values with your actual keys. Delete line you don't need
                        </p>
                        <textarea 
                        className={styles.codeBox} 
                        value={headersText} 
                        onChange={(e)=>setHeadersText(e.target.value)}
                        rows={5}
                        />
                    </div>

                    {(httpMethod==="POST" || httpMethod==='PUT')&&(
                        <div className={styles.panel}>
                            <h2 className={styles.panelHeading}>
                                Request Body
                            </h2>
                            <p className={styles.inputHint}>
                                JSON body that gets sent with your request
                            </p>
                            <textarea 
                            className={styles.codeBox}
                            value={requestBody}
                            onChange={(e)=>setRequestBody(e.target.value)}
                            row={5}
                            
                            />
                        </div>
                    )}
                    <div className={styles.actionRow}>
                        <button type='submit' className={styles.saveBtn}>
                            {isEdit ? 'Update Monitor':'Save Monitor'}
                        </button>
                    </div>
                </div> 
            </form>
        </div>
    );
}