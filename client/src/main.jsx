import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'
import { WishlistProvider } from './context/WishlistContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './styles/global.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <ThemeProvider>
          {/* SocketProvider must wrap AuthProvider so useSocket() works inside AuthContext */}
          <SocketProvider>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <App />
                  <Toaster
                    position="top-center"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'rgba(13, 23, 16, 0.9)',
                        color: '#EEF2EF',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                        padding: '12px 20px',
                        fontSize: '0.95rem',
                        maxWidth: '400px',
                      },
                      success: {
                        iconTheme: { primary: '#52B788', secondary: '#080D0A' },
                      },
                      error: {
                        iconTheme: { primary: '#E76F51', secondary: '#080D0A' },
                      },
                    }}
                  />
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </SocketProvider>
        </ThemeProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)

// ── Register Service Worker (production only) ─────────────────────────────────
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('[SW] Registered:', reg.scope))
      .catch((err) => console.warn('[SW] Registration failed:', err));
  });
}
