import { BrowserRouter,Routes,Route } from "react-router-dom";
import MainLanding from "./Components/Landing/MainLanding/MainLanding.jsx";
import Auth from "./pages/Auth/Auth.jsx";
import MonitorDashboard from "./pages/Dashboard/RenderDashBoard.jsx";
import ProtectedRoutes from "./hooks/ProtectedRoutes/ProtectedRoutes.jsx";
import { useState } from "react";
export default function App(){
    const [token,setToken]=useState(localStorage.getItem('token'))
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLanding/>}/>
                <Route path="/auth" element={<Auth setToken={setToken}/>} setToken={setToken}/>
                <Route element={<ProtectedRoutes/>} token={token}>
                    <Route path="/dashboard" element={<MonitorDashboard/>} token={token}/>
                </Route>
                
            </Routes>
        </BrowserRouter>
    )
}