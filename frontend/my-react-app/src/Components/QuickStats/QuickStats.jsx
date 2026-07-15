import React from 'react';
import styles from './QuickStats.module.css';

export default function QuickStats({ monitors }) {
  
    const pausedMonitors = monitors.filter(m => m.is_paused);
    
    const downMonitors = monitors.filter(m => !m.is_paused && m.is_down);
    const upMonitors = monitors.filter(m => !m.is_paused && !m.is_down);

    return (
        <div className={styles.statsContainer}>
            <div className={styles.statsBar}>
                <div className={`${styles.statItem} ${styles.upCard}`}>
                    <span className={styles.statLabel}>Up</span>
                    <span className={`${styles.statValue} ${styles.up}`}>{upMonitors.length}</span>
                    
                    <div className={styles.monitorList}>
                        {upMonitors.length === 0 ? (
                            <span className={styles.emptyText}>None active</span>
                        ) : (
                            upMonitors.map(m => (
                                <div key={m.id} className={styles.monitorBadge}>
                                    <span className={`${styles.indicator} ${styles.indicatorUp}`}></span>
                                    <span className={styles.monitorName}>{m.name}</span>
                                    {m.port && <span className={styles.portLabel}>:{m.port}</span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>


                <div className={`${styles.statItem} ${styles.downCard}`}>
                    <span className={styles.statLabel}>Down</span>
                    <span className={`${styles.statValue} ${styles.down}`}>{downMonitors.length}</span>
                    
                    <div className={styles.monitorList}>
                        {downMonitors.length === 0 ? (
                            <span className={styles.emptyText}>All systems operational</span>
                        ) : (
                            downMonitors.map(m => (
                                <div key={m.id} className={styles.monitorBadgeDown}>
                                    <span className={`${styles.indicator} ${styles.indicatorDown}`}></span>
                                    <span className={styles.monitorName}>{m.name}</span>
                                    {m.port && <span className={styles.portLabel}>:{m.port}</span>}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={`${styles.statItem} ${styles.pausedCard}`}>
                    <span className={styles.statLabel}>Paused</span>
                    <span className={styles.statValue}>{pausedMonitors.length}</span>
                    
                    <div className={styles.monitorList}>
                        {pausedMonitors.length === 0 ? (
                            <span className={styles.emptyText}>None paused</span>
                        ) : (
                            pausedMonitors.map(m => (
                                <div key={m.id} className={styles.monitorBadgePaused}>
                                    <span className={`${styles.indicator} ${styles.indicatorPaused}`}></span>
                                    <span className={styles.monitorName}>{m.name}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}