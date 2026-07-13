import { useState } from 'react'
import styles from './MonitorForm.module.css'

function parseInput(value){
    if(!value) return '';
    if (typeof value === 'string'){
        return value
    }
    return JSON.stringify(value, null, 2)
}

export default function MonitorForm({onMonitorCreated, onMonitorEdited, existingMonitor}){
    const isEdit = existingMonitor ? true : false;
    const [monitorType, setMonitorType] = useState(existingMonitor?.type || 'HTTP');
    const [friendlyName, setFriendlyName] = useState(existingMonitor?.name || '');
    const [url, setUrl] = useState(existingMonitor?.url || '');
    const [interval, setInterval] = useState(existingMonitor?.interval || 60);
    const [retries, setRetries] = useState(existingMonitor?.retries || 3);
    const [httpMethod, setHttpMethod] = useState(existingMonitor?.method || 'GET');
    const [headersText, setHeadersText] = useState(isEdit ? parseInput(existingMonitor.custom_headers) : '');
    const [requestBody, setRequestBody] = useState(isEdit ? parseInput(existingMonitor.request_body) : '');
    const [port, setPort] = useState(existingMonitor?.port || '');
    const [allowedCodes,setAllowedCodes]=useState(existingMonitor?.allowed_status_codes || [] )
    const [isPublic,setIsPublic]=useState(existingMonitor?.is_public || false)
    const common_4xx_codes=[400,401,403,404,405,429]
    const intervalOptions=[
        {time:'30sec', value:30},
        {time:'1 min',value:60},
        {time:'5 min',value:300},
        {time:'10 min',value:600},
        {time:'30 min',value:1800},
        {time:'1 hr',value:3600},
    ]
    const toggleCode=(code)=>{
        if(allowedCodes.includes(code)){
            setAllowedCodes(allowedCodes.filter(c=>c!==code))
        }else{
            setAllowedCodes([...allowedCodes,code])
        }
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        if(!friendlyName.trim() || !url.trim()) return;

        const newMonitor = {
            name: friendlyName,
            url,
            interval,
            retries,
            type: monitorType,
            method: monitorType === 'HTTP' ? httpMethod : null,
            custom_headers: (typeof headersText === 'string' && headersText.trim()) ? headersText : null,
            request_body: (monitorType === 'HTTP' && httpMethod !== 'GET' && typeof requestBody === 'string') ? requestBody : null,
            port: monitorType === 'PORT' ? port : null,
            allowed_status_codes:allowedCodes,
            is_public:isPublic,
            history: []
        };

        if(isEdit){
            onMonitorEdited(newMonitor, existingMonitor.id);
        } else {
            onMonitorCreated(newMonitor);
        }
    }

    return(
    <div className={styles.formWrapper}>
        <h1 className={styles.formTitle}>{isEdit ? 'Edit Monitor' : 'Create New Monitor'}</h1>
        <form onSubmit={handleSubmit} className={styles.gridContainer}>

            {/* LEFT COLUMN — Core config, same for every monitor type */}
            <div className={styles.leftColumn}>
                <div className={styles.panel}>
                    <h2 className={styles.panelHeading}>General Configuration</h2>

                    <div className={styles.inputs}>
                        <label className={styles.label}>Monitor Type</label>
                        <select onChange={(e) => setMonitorType(e.target.value)} value={monitorType} className={styles.inputField}>
                            <option value='HTTP'>HTTP(s)</option>
                            <option value="PING">ICMP PING</option>
                            <option value="PORT">TCP PORT</option>
                        </select>
                    </div>

                    <div className={styles.inputs}>
                        <label className={styles.label}>Friendly Name</label>
                        <input type="text" placeholder='myMainAPI' className={styles.inputField} value={friendlyName} onChange={(e) => setFriendlyName(e.target.value)}/>
                    </div>

                    <div className={styles.inputs}>
                        <label className={styles.label}>Destination Host / URL</label>
                        <input type="text" placeholder='https://example.com' className={styles.inputField} value={url} onChange={(e) => setUrl(e.target.value)}/>
                    </div>
                    <div className={styles.inputs}>
                        <label className={styles.checkboxItem}>
                            <input type="checkbox"
                            checked={isPublic}
                            onChange={(e)=>setIsPublic(e.target.checked)}
                            />
                            Show on publc status page
                        </label>
                    </div>

                    <div className={styles.inputs}>
                        <label className={styles.label}>Heartbeat Interval</label>
                        <select
                            value={interval}
                            className={styles.inputField}
                            onChange={(e)=>setInterval(parseInt(e.target.value))}
                        >
                            {intervalOptions.map(opt=>(
                                <option key={opt.value} value={opt.value}>{opt.time}</option>
                            ))}
                        </select>
                    </div>

                    <div className={styles.inputs}>
                        <label className={styles.label}>Retries Before Alert</label>
                        <input type="number" min='1' onChange={(e) => setRetries(parseInt(e.target.value))} value={retries} className={styles.inputField}/>
                        <span className={styles.inputHint}>Number of failed checks required before declaring a target down.</span>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN — everything that depends on Monitor Type */}
            <div className={styles.rightColumn}>
                <div className={styles.panel}>
                    <h2 className={styles.panelHeading}>
                        {monitorType === 'HTTP' && 'HTTP Configuration'}
                        {monitorType === 'PORT' && 'Port Configuration'}
                        {monitorType === 'PING' && 'Ping Configuration'}
                    </h2>

                    {monitorType === 'HTTP' && (
                        <>
                            <div className={styles.inputs}>
                                <label className={styles.label}>Method</label>
                                <select value={httpMethod} onChange={(e) => setHttpMethod(e.target.value)} className={styles.inputField}>
                                    <option value="GET">GET</option>
                                    <option value="POST">POST</option>
                                    <option value="PUT">PUT</option>
                                </select>
                            </div>

                            <div className={styles.inputs}>
                                <label className={styles.label}>Treat these status codes as healthy</label>
                                <div className={styles.checkboxGroup}>
                                    {common_4xx_codes.map((code)=>(
                                        <label key={code} className={styles.checkboxItem}>
                                            <input
                                                type="checkbox"
                                                checked={allowedCodes.includes(code)}
                                                onChange={()=>toggleCode(code)}
                                            />
                                            {code}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.inputs}>
                                <label className={styles.label}>Custom Headers</label>
                                <textarea
                                    className={styles.codeBox}
                                    value={headersText}
                                    placeholder={`{\n  "Authorization": "Bearer TOKEN"\n}`}
                                    onChange={(e) => setHeadersText(e.target.value)}
                                    rows={4}
                                />
                            </div>

                            {(httpMethod === 'POST' || httpMethod === 'PUT') && (
                                <div className={styles.inputs}>
                                    <label className={styles.label}>Payload Body</label>
                                    <textarea
                                        className={styles.codeBox}
                                        value={requestBody}
                                        onChange={(e) => setRequestBody(e.target.value)}
                                        rows={4}
                                        placeholder={`{\n  "status": "active"\n}`}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {monitorType === 'PORT' && (
                        <div className={styles.inputs}>
                            <label className={styles.label}>Port Number</label>
                            <input
                                type="number"
                                className={styles.inputField}
                                value={port}
                                onChange={(e) => setPort(e.target.value)}
                                placeholder='443'
                                min='1'
                            />
                            <span className={styles.inputHint}>
                                Common ports: 443 (HTTPS), 22 (SSH), 3306 (MySQL), 5432 (PostgreSQL).
                            </span>
                        </div>
                    )}

                    {monitorType === 'PING' && (
                        <p className={styles.inputHint}>
                            No additional configuration needed — this monitor will send ICMP echo requests to the host above.
                        </p>
                    )}
                </div>

                <div className={styles.actionRow}>
                    <button type='submit' className={styles.saveBtn}>
                        {isEdit ? 'Apply Amendments' : 'Deploy Monitor'}
                    </button>
                </div>
            </div>

        </form>
    </div>
);
}