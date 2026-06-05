import NavBar from "../NavBar/NavBar.jsx";
import Description from "../Description/Description.jsx";
import Properties from "../Properties/Properties.jsx";
import { useRef } from "react";
import Footer from "../Footer/Footer.jsx";
import DashBoardMock from "../DashboardMock/DashBoardMock.jsx";

export default function MainLanding(){
    const featuresRef=useRef(null);
    const pricingRef=useRef(null);
    const scrollToSection = (elementRef) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };
     return(
        <div style={{backgroundColor:'#0a0a0f',minHeight:'100vh',color:'#f3f4f6'}}>
            <NavBar
            onScrollToFeatures={()=>scrollToSection(featuresRef)}
            onScrolltoPricing={()=>scrollToSection(priceRef)}
            />
            <main>
                <Description/>
                <DashBoardMock/>
                <div ref={featuresRef}>
                    <div ref={pricingRef}>
                        <Properties />
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
     )
}