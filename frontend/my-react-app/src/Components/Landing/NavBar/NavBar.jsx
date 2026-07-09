import styles from './NavBar.module.css'
import { useNavigate } from 'react-router-dom'
function NavBar({ onScrollToFeatures, onScrollToPricing }){
    const navigate=useNavigate()
    return(
        <div className={styles.Container} >
            <div className={styles.navInner}>
                <div className={styles.ping}>
                    <h1>Ping</h1>
                </div>
                <div className={styles.properties}>
                    <div className={styles.features}>
                        <button onClick={onScrollToFeatures}>Features</button>
                    </div>
                </div>
                <div className={styles['log-sign']}>
                    <div className={styles.log}>
                        <button onClick={()=>navigate('/auth')}>
                            Login
                        </button>
                    </div>
                    <div className={styles.sign} >
                        <button onClick={()=>navigate('/auth')}>
                            Sign Up
                        </button>
                    </div>

                </div>
            </div>

        </div>
    )
}
export default NavBar