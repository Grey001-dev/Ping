import styles from './Properties.module.css'
export default function Properties(){
    const Property=[
        {title:'60+ second checks',
         description:'High-frequency polling to verify your application availability and detect downtime instantly'
        },
        {
            title:'Email alerts',
            description:'Instant notificationd dispatches delivered straight to your inbox the exact moment your application is down '
        },
        {
            title:'Response time graphs',
            description:'Track ongoing latency trends,performance dips,and global systematic degradation over time '
        },
        {
            title:'Public status page',
            description:'Share your real-time performance and historical uptime metrics transparently with your user base.'

        },
        {
        title: 'TCP monitoring',
        description: 'Go beyond traditional HTTP/S requests. Monitor raw ports, databases, and custom network protocols.'
        }
    ]
    return(
        <div className={styles.featuresSection}>
            <h2 className={styles.sectionTitle}>
                Features
            </h2>
            <div className={styles.grid}>
                {Property.map((property,id)=>{
                    return(<div key={id} className={styles.card}>
                        <h3 className={styles.cardTitle}>{property.title}</h3>
                        <p className={styles.cardDescription}>{property.description}</p>
                    </div>)
                })}
            </div>
            <div className={styles.pricingWrapper}>
                <h2 className={styles.pricingTitle}>Pricing</h2>
                <div className={styles.pricingCard}>
                    <h2>Free</h2>
                    <p>Basic features ,Basic monitors ,interval frequency</p>
                </div>
            </div>
        </div>
    )
}