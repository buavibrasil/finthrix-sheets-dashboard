import { Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from '@/pages/lazy'
import Login from '@/pages/Login/Login'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import EmailVerification from '@/pages/EmailVerification'
import { GoogleSheetsDemo } from '@/pages/GoogleSheetsDemo'
import { ProtectedRoute } from '@/components/Auth'
import { PWANotifications } from '@/components/PWA/PWANotifications'
import LazyRoute from '@/components/common/LazyRoute'
import PerformanceDebug from '@/components/Debug/PerformanceDebug'

// Configuração do QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Notificações PWA */}
        <PWANotifications />
        
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<EmailVerification />} />
          
          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <LazyRoute>
                  <Dashboard />
                </LazyRoute>
              </ProtectedRoute>
            }
          />
          <Route
            path="/google-sheets"
            element={
              <ProtectedRoute>
                <LazyRoute>
                  <GoogleSheetsDemo />
                </LazyRoute>
              </ProtectedRoute>
            }
          />
          
          {/* Redirecionar raiz para dashboard */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/dashboard" replace />
              </ProtectedRoute>
            }
          />
          
          {/* Rota 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
                  <p className="text-gray-600">Página não encontrada</p>
                </div>
              </div>
            }
          />
        </Routes>
        
        {/* Debug de Performance (apenas em desenvolvimento) */}
        <PerformanceDebug />
      </div>
    </QueryClientProvider>
  )
}

export default App