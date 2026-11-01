import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeLanguageProvider } from './context/ThemeLanguageContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ThemeLanguageProvider>
        <App />
      </ThemeLanguageProvider>
    </AuthProvider>
  </StrictMode>,
)
