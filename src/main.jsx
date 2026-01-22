import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from './context/CartContext';
import React from 'react';
import './index.css'
import './App.css'
import 'swiper/css';
import 'swiper/css/pagination';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import { PreloaderProvider } from './context/PreloaderContext';

import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';

function AOSInitializer({ children }) {
  useEffect(() => {
    // Check if device is mobile
    const isMobile = window.innerWidth <= 768;
    
    if (!isMobile) {
      // Initialize AOS with balanced performance settings
      AOS.init({ 
        once: true,
        duration: 700, // Balanced duration
        easing: 'ease-out-cubic', // Smooth easing
        offset: 80, // Balanced offset
        delay: 0,
        anchorPlacement: 'top-bottom',
        disable: 'mobile' // Explicitly disable on mobile
      });
    }
    
    // Debounced resize handler for better performance
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newIsMobile = window.innerWidth <= 768;
        if (newIsMobile && !isMobile) {
          AOS.refresh();
        } else if (!newIsMobile && isMobile) {
          AOS.init({ 
            once: true,
            duration: 600,
            easing: 'ease-out',
            offset: 50,
            delay: 0,
            anchorPlacement: 'top-bottom',
            disable: 'mobile'
          });
        }
      }, 100); // 100ms debounce
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);
  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <PreloaderProvider>
        <AOSInitializer>
      <App />
        </AOSInitializer>
      </PreloaderProvider>
    </CartProvider>
  </StrictMode>,
)
