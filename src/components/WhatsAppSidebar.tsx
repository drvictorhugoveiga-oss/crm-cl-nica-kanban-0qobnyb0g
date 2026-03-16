import { useState } from 'react'
import { Search, X, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import useWhatsAppStore from '@/stores/useWhatsAppStore'
import { cn } from '@/lib/utils'

export function WhatsAppSidebar() {
  const { chats, setActiveChatId, toggleSidebar, isLoading } = useWhatsAppStore()
  const [search, setSearch] = useState('')

  const filteredChats = chats.filter((c) => c.leadName.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="h-[72px] sm:h-16 bg-[#F0F2F5] px-4 flex items-center justify-between shrink-0 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-lg sm:text-base">
          <div className="h-9 w-9 sm:h-8 sm:w-8 bg-[#25D366] rounded-full flex items-center justify-center shadow-sm shrink-0">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          Conversas
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 sm:h-10 sm:w-10 text-slate-500 hover:bg-slate-200/60 rounded-full shrink-0"
          onClick={toggleSidebar}
        >
          <X className="h-6 w-6 sm:h-5 sm:w-5" />
        </Button>
      </div>

      <div className="p-3 border-b border-slate-100 bg-white shrink-0">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 sm:h-4 sm:w-4 text-slate-400" />
          <Input
            placeholder="Pesquisar contatos..."
            className="pl-10 bg-[#F0F2F5] border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-xl h-11 sm:h-10 text-[15px] sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 bg-white">
        <div className="flex flex-col pb-6 sm:pb-0">
          {isLoading && filteredChats.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <Skeleton className="h-14 w-14 sm:h-12 sm:w-12 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center text-[15px] sm:text-sm text-slate-500 mt-10">
              Nenhum contato encontrado com "{search}".
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center gap-3 p-3 sm:p-3 hover:bg-[#F5F6F6] cursor-pointer border-b border-slate-50 transition-colors animate-fade-in"
                onClick={() => setActiveChatId(chat.id)}
              >
                <Avatar className="h-14 w-14 sm:h-12 sm:w-12 shrink-0 border border-slate-100">
                  <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${chat.id}`} />
                  <AvatarFallback className="bg-[#128C7E] text-white font-medium text-lg sm:text-base">
                    {chat.leadName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-semibold text-slate-800 text-[16px] sm:text-[15px] truncate">
                      {chat.leadName}
                    </span>
                    <span
                      className={cn(
                        'text-[13px] sm:text-xs whitespace-nowrap',
                        chat.unread > 0 ? 'text-[#25D366] font-semibold' : 'text-slate-500',
                      )}
                    >
                      {chat.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className="text-[15px] sm:text-sm text-slate-500 truncate">
                      {chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <span className="bg-[#25D366] text-white text-[11px] sm:text-[10px] font-bold h-6 w-6 sm:h-5 sm:w-5 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
