import styles from './Skeleton.module.css';
export default function SkeletonItem(){
    return(
        <div className={styles.skeletonItem}>
            <div className={styles.skeletonRow}>
                <div className={styles.skeletonDot}/>
                <div className={styles.skeletonName}/>
                <div className={styles.skeletonPct}/>
            </div>
            <div className={styles.skeletonBars}>
                {Array(15).fill(null).map((_,i)=>(
                    <div key={i} className={styles.skeletonBar}/>
                ))}
            </div>
        </div>
    )
}

