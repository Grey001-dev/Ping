import {useState,useEffect} from 'react'
import {getUser,updateUser} from '../../services/settingsService';
import { Bell,Shield ,TriangleAlert,CheckCircle2,Settings2Icon,UserKey,Copy} from 'lucide-react';
import styles from './Settings.module.css'


export default function Settings(){
    const [email,setEmail]=useState('');
    const [notificationEmail,setNotificationEmail]=useState('')
    const [loading,setLoading]=useState(true);
    const [saving,setSaving]=useState(false);
    const [message,setMessage]=useState(null);
    const [userId,setUserId]=useState(null);
    const [copied,setCopied]=useState(false)
    const token=localStorage.getItem("token")

    useEffect(()=>{
       const loadUser=async()=> {
        try {
            const datas= await getUser();
            setEmail(datas.data.email);
            setUserId(datas.data.id)
            setNotificationEmail(datas.data.notification_email ||'');
        } catch (error) {
            setMessage({type:'error',text:'Could not load account info'});
        }finally{
            setLoading(false)
        };
    }
    loadUser();
},[])
    
    const handleCopy=async ()=>{
        const link =`${window.location.origin}/status/${userId}`;
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(()=>setCopied(false),2000)
    }

    const handleSave=async (e)=>{
        e.preventDefault();
        setSaving(true);
        setMessage(null)
        try {
            const datas=await updateUser(notificationEmail);
            setNotificationEmail(datas.data.notification_email ||'')
            setMessage({type:'success',text:'Notification email updated'})
        } catch (error) {
            setMessage({type:'error',text:'Could not update notification email'})
        } finally{
            setSaving(false)
        }   
    }
    if(loading){
        return(
            <div className={styles.wrapper}>
                <div className={styles.spinnerContainer}>
                    <div className={styles.spinner}></div>
                    <p className={styles.spinnerText}>Loading settings...</p>
                </div>
            </div>
        )
    }


    return(
        <div className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.pageHeader}>
                    <Settings2Icon size={20} className={styles.mainIcon}/>
                    <h1 className={styles.title}>
                    Settings
                    </h1>
                </div>
                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <Shield size={14} className={styles.icon}/>
                        <h2 className={styles.panelHeading}>
                            Account
                        </h2>
                    </div>
                    <div className={styles.inputs}>
                        <label className={styles.label}>Login Email</label>
                        <input type="email" value={email} readOnly className={styles.inputField} />
                    </div>
                </div>



                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <UserKey size={14} className={styles.icon}/>
                        <h2 className={styles.panelHeading}>Public Status Page</h2>
                    </div>
                    <p className={styles.inputHint}>
                        Share this link so others can see your public monitors:
                    </p>
                    <div className={styles.statusLinkRow}>
                        <code className={styles.codeBlock}>
                            {userId ? `${window.location.origin}/status/${userId}`: 'Generating link...'}
                        </code>
                        <button onClick={handleCopy} disabled={!userId} className={copied ? styles.copyBtnCopied : styles.copyBtn}>
                            <Copy size={12}/>
                            {copied ? 'Copied!':'Copy'}
                        </button>

                    </div>
                </div>



                <div className={styles.panel}>
                    <div className={styles.panelHeader}>
                        <Bell size={14} className={styles.icon}/>
                        <h2 className={styles.panelHeading}>
                        Notifications
                    </h2>
                    </div>
                    <p className={styles.inputHint}>
                        Down/recovery alerts will be sent to this address instead of your login email.
                        Leave blank to use your login email
                    </p>

                    <form onSubmit={handleSave}>
                        <div className={styles.inputs}>
                            <label className={styles.label}>
                                Notification Email
                            </label>
                            <input type="email" value={notificationEmail} onChange={(e)=>setNotificationEmail(e.target.value)}
                            className={styles.inputField}
                            />
                        </div>
                        {message && (
                            <div className={message.type === 'error' ? styles.error : styles.success}>
                                {message.type === 'error' ? <TriangleAlert size={14} /> : <CheckCircle2 size={14} />}
                                <span>{message.text}</span>
                            </div>
                        )}
                        <button type='submit' disabled={saving} className={styles.saveBtn}>
                            {saving ? 'Saving...' :'Save Changes'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}