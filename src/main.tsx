import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tailwind.css'
import './styles/global.css'
import App from './App.tsx'
// Depois dos componentes: redesenha a borda na diagonal dos cantos cortados
import './styles/cutCorners.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
