import styles from './Description.module.css'
import { useNavigate } from 'react-router-dom'
function Description(){
    const navigate=useNavigate()
    return(
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.heading}>
                    Know the second your website goes down
                </h1>
                <p className={styles.subhead}>
                    Ping monitors your websites, APIs and servers every 60 seconds 
                    and alerts you instantly when something breaks.
                </p>
                <button className={styles.btn} onClick={()=>navigate("/auth")}>
                    Start Monitoring
                </button>
            </div>
        </div>
    )
}
export default Description