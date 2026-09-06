import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { MenuCatalogProvider } from './context/MenuCatalogProvider'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <MenuCatalogProvider>
        <App />
      </MenuCatalogProvider>
    </BrowserRouter>
  </StrictMode>,
)
