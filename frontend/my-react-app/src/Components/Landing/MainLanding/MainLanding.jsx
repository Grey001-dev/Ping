import NavBar from "../NavBar/NavBar.jsx";
import Description from "../Description/Description.jsx";
import Properties from "../Properties/Properties.jsx";
import { useRef } from "react";
import Footer from "../Footer/Footer.jsx";
import DashBoardMock from "../DashboardMock/DashBoardMock.jsx";
import styles from './MainLanding.module.css'
export default function MainLanding(){
    const featuresRef=useRef(null);
    const scrollToSection = (elementRef) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };
     return(
        <div className={styles.header}>
            <NavBar
            onScrollToFeatures={()=>scrollToSection(featuresRef)}
            />
            <main style={{ width: '100%', maxWidth: '1280px', margin: '0 auto', padding: '0 2rem', boxSizing: 'border-box' }}>
                <Description/>
                <DashBoardMock/>
                <div ref={featuresRef}>
                    <Properties/>
                </div>
            </main>
            <Footer/>
        </div>
     )
}