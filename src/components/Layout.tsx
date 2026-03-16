import { Outlet, Link, useLocation } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { LGPDConsentModal } from './LGPDConsentModal'
import { ChatWidget } from './ChatWidget'
import { useIsMobile } from '@/hooks/use-mobile'

export default function Layout() {
  const isMobile = useIsMobile()
  const location = useLocation()
  const isChat = location.pathname.includes('/chat')
  const hideFooter = isChat && isMobile

  return (
    <SidebarProvider>
      <div className="flex w-full h-[100dvh] overflow-hidden bg-background text-foreground">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 h-full relative">
          <Header />
          <div className="flex-1 overflow-hidden relative flex flex-col">
            <Outlet />
          </div>
          {!hideFooter && (
            <footer className="h-12 sm:h-10 border-t border-border bg-card/80 backdrop-blur-sm flex items-center justify-center shrink-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.02)] gap-4 sm:gap-6">
              <Link
                to="/settings"
                className="text-[13px] sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium px-2 py-2"
              >
                Configurações
              </Link>
              <div className="w-px h-4 bg-border" />
              <Link
                to="/politica-privacidade"
                className="text-[13px] sm:text-sm text-muted-foreground hover:text-primary transition-colors font-medium px-2 py-2"
              >
                Política de Privacidade e LGPD
              </Link>
            </footer>
          )}
          <LGPDConsentModal />
          <ChatWidget />
        </main>
      </div>
    </SidebarProvider>
  )
}
