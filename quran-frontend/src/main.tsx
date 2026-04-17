import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import AdminApp from './AdminApp.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { BookmarkProvider } from './contexts/BookmarkContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <BookmarkProvider>
          <Routes>
            <Route path="/admin" element={<AdminApp />} />
            <Route path="/" element={<App />} />
          </Routes>
        </BookmarkProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
