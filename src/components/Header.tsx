import { Bell, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SidebarTrigger } from '@/components/ui/sidebar'
import useLeadStore from '@/stores/useLeadStore'
import { useState } from 'react'
import { NewLeadDialog } from './NewLeadDialog'

export function Header() {
  const { searchQuery, setSearchQuery } = useLeadStore()
  const [isModalOpen, setIsModalOpen] = useState(false)

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

      <div className="flex items-center gap-3 sm:gap-4">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-full shadow-subtle hover:scale-95 transition-transform"
        >
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Novo Lead</span>
        </Button>

        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Bell className="h-5 w-5" />
        </Button>

        <Avatar className="h-9 w-9 border cursor-pointer hover:opacity-80 transition-opacity">
          <AvatarImage
            src="https://img.usecurling.com/ppl/thumbnail?gender=female&seed=1"
            alt="Dr. User"
          />
          <AvatarFallback>DR</AvatarFallback>
        </Avatar>
      </div>

      <NewLeadDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </header>
  )
}
