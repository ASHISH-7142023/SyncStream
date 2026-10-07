import { StrictMode } from 'react'
import { // Application entry point
createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Application entry point
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

