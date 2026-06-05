import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Footer from './Components/Landing/Footer/Footer.jsx'
import MainLanding from './Components/Landing/MainLanding/MainLanding.jsx'
import Properties from './Components/Landing/Properties/Properties.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MainLanding/>
  </StrictMode>,
)
