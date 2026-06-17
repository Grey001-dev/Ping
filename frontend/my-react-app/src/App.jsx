import { BrowserRouter,Routes,Route } from "react-router-dom";
import MainLanding from "./Components/Landing/MainLanding/MainLanding.jsx";
import Auth from "./Components/Auth/Auth.jsx";
import MonitorDashboard from "./Components/Dashboard/RenderDashBoard.jsx";

export default function App(){
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLanding/>}/>
                <Route path="/auth" element={<Auth/>}/>
                <Route path="/dashboard" element={<MonitorDashboard/>}/>
            </Routes>
        </BrowserRouter>
    )
}