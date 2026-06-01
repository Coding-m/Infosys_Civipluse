import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ✅ Fix for "global is not defined" in Vite — needed for SockJS/StompJS
import { Buffer } from "buffer";
window.global = window;
window.Buffer = Buffer;

// ✅ Remove console logs in production
if (import.meta.env.PROD) {
  console.log = () => {};
  console.debug = () => {};
  // Keep console.error and console.warn for production debugging
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)