import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { HashRouter } from 'react-router-dom'

console.log('appp calll v =========> 0.02')

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <App />
  </HashRouter>
)
