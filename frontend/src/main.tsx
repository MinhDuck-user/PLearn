import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css' // File này chứa màu nền và phông chữ của bạn

// Tìm thẻ <div id="root"> trong index.html và thắp sáng nó bằng App.tsx
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)