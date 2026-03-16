import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { ThemeProvider } from '@/components/theme-provider'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Layout from './components/Layout'
import AnaliseOrigem from './pages/AnaliseOrigem'
import Relatorios from './pages/Relatorios'
import PrivacyPolicy from './pages/PrivacyPolicy'
import PrivacySettings from './pages/PrivacySettings'
import Settings from './pages/Settings'
import Ajuda from './pages/Ajuda'
import AdminContent from './pages/AdminContent'
import { LeadProvider } from './stores/useLeadStore'
import { AuthProvider } from './hooks/use-auth'
import { KanbanProvider } from './stores/useKanbanStore'
import { ProtectedRoute } from './components/ProtectedRoute'

const App = () => (
  <ThemeProvider defaultTheme="light" storageKey="crm-ui-theme">
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
                    <KanbanProvider>
                      <Layout />
                    </KanbanProvider>
                  </LeadProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Index />} />
              <Route path="analise-origem" element={<AnaliseOrigem />} />
              <Route path="relatorios" element={<Relatorios />} />
              <Route path="politica-privacidade" element={<PrivacyPolicy />} />
              <Route path="configuracoes-privacidade" element={<PrivacySettings />} />
              <Route path="settings" element={<Settings />} />
              <Route path="ajuda" element={<Ajuda />} />
              <Route path="admin/content" element={<AdminContent />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </ThemeProvider>
)

export default App
