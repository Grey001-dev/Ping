import { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import styles from './NavBar.module.css'

export default function NavBar(){
    const navigate=useNavigate();
    const handleLogout=()=>{
        localStorage.removeItem("token");
        navigate('/auth');
    }
    
    return(
        <nav className={styles.navbar}>
            <NavLink to="/dashboard" className={styles.brand}>
                <div className={styles.logo}>
                    <span className={`${styles.logoBar} ${styles.bar1}`} styles={{animationDelay:'0s'}}></span>
                    <span className={`${styles.logoBar} ${styles.bar2}`} styles={{animationDelay:"0.15s"}}></span>
                    <span className={`${styles.logoBar} ${styles.bar3}`} styles={{animationDelay:"0.3s"}}></span>
                    <span className={`${styles.logoBar} ${styles.bar4}`} styles={{animationDelay:'0.45s'}}></span>
                </div>
                <span className={styles.brandsha}>Ping</span>
            </NavLink>
            <div className={styles.links}>
                <NavLink to="/dashboard" className={({isActive})=>isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}>
                Dashboard
                </NavLink>
                <NavLink to="/settings" className={({isActive})=>isActive?`${styles.navLink} ${styles.active}`:styles.navLink}>
                    Settings
                </NavLink>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
            </button>
        </nav>
    )
}