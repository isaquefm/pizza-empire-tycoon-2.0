import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/global.css'
import { useGame } from './systems/store'
import { world } from './systems/world'
import { stepSimulation } from './systems/simulation'

// Gancho de depuração disponível apenas em desenvolvimento (npm run dev)
if (import.meta.env.DEV) window.__pizza = { useGame, world, stepSimulation }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
