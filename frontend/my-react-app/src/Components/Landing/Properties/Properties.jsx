import styles from './Properties.module.css'
export default function Properties(){
    return(
        <div className={styles.featuresSection}>
            <h2 className={styles.sectionTitle}>
                Features
            </h2>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        30+ second checks
                    </h3>
                    <p className={styles.cardDescription}>
                        High-frequency polling to verify your application availability ad detect downtime instantly
                    </p>
                </div>

                 <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        Email Alerts
                    </h3>
                    <p className={styles.cardDescription}>
                        Instant notification dispatched deliverered straight to  your inbox the exact moment your application is down
                    </p>
                </div>

                 <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        Response time graphs
                    </h3>
                    <p className={styles.cardDescription}>
                        Track ongoing latency trends,performance dips.
                    </p>
                </div>

                 <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        Public status page
                    </h3>
                    <p className={styles.cardDescription}>
                        Share your real-time performance and historical uprime metrics transparently
                    </p>
                </div>

                 <div className={styles.card}>
                    <h3 className={styles.cardTitle}>
                        TPC moitoring
                    </h3>
                    <p className={styles.cardDescription}>
                        Go beyond traditional HTTP(S) requests. Monitor raw ports,databases, and custom network protocols. 
                    </p>
                </div>
            </div>
        </div>
    )
}