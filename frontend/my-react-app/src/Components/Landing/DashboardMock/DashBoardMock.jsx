import styles from './DashBoardMock.module.css';
export default function DashBoardMock(){
  // Fake status dashboard , just like a representation of what i built
    const generateHistory=(outageIndices= [] )=>{
        return Array.from({length: 32},(_,i)=>!outageIndices.includes(i));
    }
    const monitors=[
        {name:'myWeb.ping.sh',interval:'60s check',history:generateHistory([12])},
        { name: 'bruh.ping.sh', interval: '60s check', history: generateHistory([]) },
    { name: 'web.ping.sh', interval: '60s check', history: generateHistory([5, 26]) }
    ]
    return(
        <div className={styles.mockupContainer}>
      <div className={styles.window}>
        
        <div className={styles.windowHeader}>
          <div className={styles.dotWrapper}>
            <div className={styles.windowDot}></div>
            <div className={styles.windowDot}></div>
            <div className={styles.windowDot}></div>
          </div>
          <div className={styles.urlBar}>ping.sh/dashboard</div>
        </div>
        
        <div className={styles.windowBody}>
          {monitors.map((monitor, idx) => (
            <div key={idx} className={styles.monitorRow}>
              
              <div className={styles.monitorMeta}>
                <span className={styles.monitorName}>{monitor.name}</span>
                <span className={styles.monitorInterval}>{monitor.interval}</span>
              </div>

              <div className={styles.uptimeGrid}>
                {monitor.history.map((isOperational, blockIdx) => (
                  <div
                    key={blockIdx}
                    className={`${styles.statusBar} ${
                      isOperational ? styles.operational : styles.outage
                    }`}
                  />
                ))}
              </div>
              <div className={styles.badge}>
                {monitor.history.includes(false) ? '99.94%' : '100.0%'} operational
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
    )
}