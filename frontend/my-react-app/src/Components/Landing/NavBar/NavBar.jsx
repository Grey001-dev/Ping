import styles from './NavBar.module.css'
function NavBar({ onScrollToFeatures, onScrollToPricing }){
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
                    <div className={styles.pricing}>
                        <button onClick={onScrollToPricing}>Pricing</button>
                    </div>
                </div>
                <div className={styles['log-sign']}>
                    <div className={styles.log}>
                        <button>
                            Login
                        </button>
                    </div>
                    <div className={styles.sign}>
                        <button>
                            Sign Up
                        </button>
                    </div>

                </div>
            </div>

        </div>
    )
}
export default NavBar