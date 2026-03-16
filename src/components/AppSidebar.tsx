import { Link, useLocation } from 'react-router-dom'
import {
  Activity,
  Settings,
  Users,
  MessageCircle,
  PieChart,
  ShieldAlert,
  BarChart,
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
import { cn } from '@/lib/utils'

const items = [
  { title: 'Leads Kanban', url: '/', icon: Users },
  { title: 'Análise de Origem', url: '/analise-origem', icon: PieChart },
  { title: 'Relatórios', url: '/relatorios', icon: BarChart },
  { title: 'WhatsApp Chat', url: '/chat', icon: MessageCircle },
  { title: 'Privacidade', url: '/configuracoes-privacidade', icon: ShieldAlert },
  { title: 'Configurações', url: '/settings', icon: Settings },
]

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon" className="border-r border-border shadow-sm">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-border/50 bg-card">
        <div className="flex items-center gap-2 px-2 overflow-hidden w-full">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <Activity className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-foreground truncate group-data-[collapsible=icon]:hidden">
            ClinicFlow
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="mt-4 gap-1.5 px-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className={cn(
                      'h-11 sm:h-10 rounded-xl transition-all duration-200',
                      location.pathname === item.url
                        ? 'bg-primary/10 text-primary hover:bg-primary/15 font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50',
                    )}
                  >
                    <Link to={item.url} className="text-[15px] sm:text-sm flex items-center gap-3">
                      <item.icon className="!size-5 sm:!size-4" />
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
