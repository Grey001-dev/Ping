import styles from './Footer.module.css'
export default function Footer(){
    const currentYear=2026;
    return(
        <footer className={styles.footerContainer}>
            <div className={styles.footerInner}>
                <div className={styles.brand}>
                    <span className={styles.logo}>Ping</span>
                    <span className={styles.copyright}>@{currentYear} Ping. All rights reserved</span>
                </div>

                <div className={styles.linkside}>
                    <button className={styles.footerLink}>Privacy Policy</button>
                    <button className={styles.footerLink}>Terms of Service</button>
                    <button className={styles.footerLink}>Contact Support</button>
                </div>
            </div>

        </footer>
    )
}