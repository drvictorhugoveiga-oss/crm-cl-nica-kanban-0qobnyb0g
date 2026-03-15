import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Layout from './components/Layout'
import { LeadProvider } from './stores/useLeadStore'
import { AuthProvider } from './stores/useAuthStore'
import { WhatsAppProvider } from './stores/useWhatsAppStore'
import { ProtectedRoute } from './components/ProtectedRoute'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <LeadProvider>
        <WhatsAppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Index />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </WhatsAppProvider>
      </LeadProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
