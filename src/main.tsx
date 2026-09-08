import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { MenuCatalogProvider } from './context/MenuCatalogProvider'
import { StaffAuthProvider } from './context/StaffAuthProvider'
import { AppErrorBoundary } from './components/ui/AppErrorBoundary'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <BrowserRouter>
        <MenuCatalogProvider>
          <StaffAuthProvider>
            <App />
          </StaffAuthProvider>
        </MenuCatalogProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  </StrictMode>,
)
