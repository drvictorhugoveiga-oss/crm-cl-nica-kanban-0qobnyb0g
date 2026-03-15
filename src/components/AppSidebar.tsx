import { Link, useLocation } from 'react-router-dom'
import {
  Activity,
  LayoutDashboard,
  Settings,
  Users,
  MessageCircle,
  PieChart,
  ShieldAlert,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Leads Kanban', url: '/', icon: Users },
  { title: 'Análise de Origem', url: '/analise-origem', icon: PieChart },
  { title: 'WhatsApp Chat', url: '/chat', icon: MessageCircle },
  { title: 'Privacidade', url: '/configuracoes-privacidade', icon: ShieldAlert },
  { title: 'Configurações', url: '/settings', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50">
        <div className="flex items-center gap-2 px-2 overflow-hidden w-full">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg truncate group-data-[collapsible=icon]:hidden">
            ClinicFlow
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4 gap-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url} className="text-base font-medium">
                      <item.icon className="!size-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
