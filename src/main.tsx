import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SearchProvider } from './context/SearchContext.tsx'
import { AppDataProvider } from './context/AppDataContext.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppDataProvider>
        <SearchProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{ 
              duration: 4000, 
              style: { 
                background: 'rgba(255, 255, 255, 0.7)', 
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(90, 178, 178, 0.5)',
                color: '#000000', 
                fontWeight: 'bold',
                fontSize: '14px', 
                borderRadius: '12px',
                boxShadow: '0 8px 32px 0 rgba(90, 178, 178, 0.2)'
              },
              success: {
                iconTheme: { primary: '#cb1665', secondary: '#fff' }
              }
            }} 
          />
          <App />
        </SearchProvider>
      </AppDataProvider>
    </AuthProvider>
  </StrictMode>,
)
