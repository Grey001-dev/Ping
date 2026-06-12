import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Footer from './Components/Landing/Footer/Footer.jsx'
import MainLanding from './Components/Landing/MainLanding/MainLanding.jsx'
import Properties from './Components/Landing/Properties/Properties.jsx'
import Auth from './Components/Auth/Auth.jsx'
import App from './App.jsx'
import MonitorForm from './Components/Dashboard/MonitorForm.jsx'
import MonitorStats from './Components/Dashboard/MonitorStats/MonitorStats.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MonitorStats/>
  </StrictMode>,
)
