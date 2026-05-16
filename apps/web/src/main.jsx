import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CopyProvider } from './lib/copy.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CopyProvider>
        <App />
      </CopyProvider>
    </BrowserRouter>
  </React.StrictMode>
)
