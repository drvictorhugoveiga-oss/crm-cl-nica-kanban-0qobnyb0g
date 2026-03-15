import { LogOut, Bell, Plus, Search, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useLeadStore from '@/stores/useLeadStore'
import { useState } from 'react'
import { NewLeadDialog } from './NewLeadDialog'
import useAuthStore from '@/stores/useAuthStore'
import useWhatsAppStore from '@/stores/useWhatsAppStore'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { searchQuery, setSearchQuery } = useLeadStore()
  const { user, logout } = useAuthStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toggleSidebar, chats } = useWhatsAppStore()

  const unreadCount = chats.reduce((acc, chat) => acc + chat.unread, 0)

  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 sticky top-0 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="md:hidden" />
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads por nome ou telefone..."
            className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-primary rounded-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-full shadow-subtle hover:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Novo Lead</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-[#25D366] hover:bg-[#25D366]/10 relative ml-1 sm:ml-0"
          onClick={toggleSidebar}
        >
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          )}
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 border cursor-pointer hover:opacity-80 transition-opacity ml-1 sm:ml-0">
              <AvatarImage
                src={`https://img.usecurling.com/ppl/thumbnail?seed=${user?.id || '1'}`}
                alt={user?.name || 'User'}
              />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sair (Logout)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <NewLeadDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </header>
  )
}
