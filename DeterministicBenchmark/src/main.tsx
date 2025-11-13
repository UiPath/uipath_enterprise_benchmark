import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './HumanEval' // Initialize human evaluation tracking
import { initConsoleFilter } from './ConsoleFilter' // Console filtering for [Test] and [Cheat]

// Initialize console filter before rendering
initConsoleFilter()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 