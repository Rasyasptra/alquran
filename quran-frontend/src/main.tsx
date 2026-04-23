import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import AdminApp from './AdminApp.tsx'
import Login from './pages/Login.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'
import { BookmarkProvider } from './contexts/BookmarkContext.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'

const queryClient = new QueryClient()

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <ThemeProvider>
              <BookmarkProvider>
                <Routes>
                  <Route path="/admin/login" element={<Login />} />
                  <Route 
                    path="/admin/*" 
                    element={
                      <ProtectedRoute>
                        <AdminApp />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="/" element={<App />} />
                </Routes>
              </BookmarkProvider>
            </ThemeProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
}
