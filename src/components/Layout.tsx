import { Outlet } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'

export default function Layout() {
  return (
    <SidebarProvider>
      <div className="flex w-full h-screen overflow-hidden bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col min-w-0 h-full">
          <Header />
          <div className="flex-1 overflow-hidden relative">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}
