import { Outlet, Link } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { LGPDConsentModal } from './LGPDConsentModal'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 h-full relative">
          <Header />
          <div className="flex-1 overflow-hidden relative">
            <Outlet />
          </div>
          <footer className="h-12 sm:h-10 border-t bg-white/80 backdrop-blur-sm flex items-center justify-center shrink-0 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
            <Link
              to="/politica-privacidade"
              className="text-[13px] sm:text-sm text-slate-500 hover:text-primary transition-colors font-medium px-4 py-2"
            >
              Política de Privacidade e LGPD
            </Link>
          </footer>
          <LGPDConsentModal />
        </main>
      </div>
    </SidebarProvider>
  )
}
