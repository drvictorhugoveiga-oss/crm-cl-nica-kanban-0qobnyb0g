import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Index from './pages/Index'
import Chat from './pages/Chat'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Layout from './components/Layout'
import AnaliseOrigem from './pages/AnaliseOrigem'
import PrivacyPolicy from './pages/PrivacyPolicy'
import PrivacySettings from './pages/PrivacySettings'
import { LeadProvider } from './stores/useLeadStore'
import { AuthProvider } from './hooks/use-auth'
import { WhatsAppProvider } from './stores/useWhatsAppStore'
import { ProtectedRoute } from './components/ProtectedRoute'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <LeadProvider>
                  <WhatsAppProvider>
                    <Layout />
                  </WhatsAppProvider>
                </LeadProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<Index />} />
            <Route path="chat" element={<Chat />} />
            <Route path="analise-origem" element={<AnaliseOrigem />} />
            <Route path="politica-privacidade" element={<PrivacyPolicy />} />
            <Route path="configuracoes-privacidade" element={<PrivacySettings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
