import { LogOut, Bell, Plus, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useState } from 'react'
import { NewLeadDialog } from './NewLeadDialog'
import { useAuth } from '@/hooks/use-auth'
import useWhatsAppStore from '@/stores/useWhatsAppStore'
import { ModeToggle } from './ModeToggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Header() {
  const { user, signOut } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toggleSidebar, chats } = useWhatsAppStore()

  const unreadCount = chats.reduce((acc, chat) => acc + chat.unread, 0)

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 sm:px-6 shrink-0 z-20 sticky top-0 shadow-sm transition-all duration-300">
      <div className="flex items-center gap-4 flex-1">
        <SidebarTrigger className="h-11 w-11 lg:hidden transition-all duration-300 ease-in-out text-muted-foreground hover:text-foreground" />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl shadow-subtle hover:scale-95 transition-all duration-300 ease-in-out h-11 px-4 sm:h-10 sm:px-4"
        >
          <Plus className="h-5 w-5 sm:mr-2" />
          <span className="hidden sm:inline">Novo Lead</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-[#25D366] hover:bg-[#25D366]/10 relative h-11 w-11 sm:h-10 sm:w-10 rounded-xl transition-all duration-300 ease-in-out"
          onClick={toggleSidebar}
        >
          <MessageCircle className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-card animate-in zoom-in" />
          )}
        </Button>

        <ModeToggle />

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground h-11 w-11 sm:h-10 sm:w-10 rounded-xl transition-all duration-300 ease-in-out"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-10 w-10 sm:h-9 sm:w-9 border border-border cursor-pointer hover:opacity-80 transition-all duration-300 ease-in-out">
              <AvatarImage
                src={`https://img.usecurling.com/ppl/thumbnail?seed=${user?.id || '1'}`}
                alt={user?.user_metadata?.name || 'User'}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.user_metadata?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 animate-in fade-in slide-in-from-top-2 border-border"
          >
            <DropdownMenuLabel>{user?.user_metadata?.name || 'Usuário'}</DropdownMenuLabel>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground truncate">
              {user?.email}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer h-10 sm:h-8 transition-colors duration-200"
              onClick={() => signOut()}
            >
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
