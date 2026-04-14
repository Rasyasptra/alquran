import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { BookmarkProvider } from './contexts/BookmarkContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BookmarkProvider>
        <App />
      </BookmarkProvider>
    </ThemeProvider>
  </StrictMode>,
)
