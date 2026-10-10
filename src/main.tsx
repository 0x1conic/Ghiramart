import React from 'react'
import ReactDOM from 'react-dom/client'
import { MotionConfig } from 'framer-motion'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/inter/800.css'
import '@fontsource/bebas-neue/400.css'
import '@fontsource/space-grotesk/700.css'
import './styles.css'
import './brand.css'
import App from './App'
import './small-screens.css'
import { CartProvider } from './context/CartContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <CartProvider><App /></CartProvider>
      </MotionConfig>
    </BrowserRouter>
  </React.StrictMode>,
)
