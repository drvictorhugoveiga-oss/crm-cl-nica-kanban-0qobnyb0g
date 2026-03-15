import { useState, useRef, useEffect } from 'react'
import {
  Search,
  ChevronLeft,
  Send,
  CheckCheck,
  X,
  MoreVertical,
  Phone,
  MessageCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useWhatsAppStore from '@/stores/useWhatsAppStore'
import { cn } from '@/lib/utils'

export function WhatsAppSidebar() {
  const { chats, activeChatId, setActiveChatId, sendMessage, toggleSidebar } = useWhatsAppStore()
  const [inputText, setInputText] = useState('')
  const [search, setSearch] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find((c) => c.id === activeChatId)
  const filteredChats = chats.filter((c) => c.leadName.toLowerCase().includes(search.toLowerCase()))

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [activeChat?.messages])

  const handleSend = () => {
    if (!inputText.trim() || !activeChatId) return
    sendMessage(activeChatId, inputText)
    setInputText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend()
  }

  if (activeChat) {
    return (
      <div className="flex flex-col h-full bg-[#EFEAE2]">
        <div className="h-[72px] sm:h-16 bg-[#F0F2F5] px-2 sm:px-4 flex items-center justify-between border-b border-slate-200 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12 sm:h-10 sm:w-10 sm:-ml-2 text-slate-600 hover:bg-slate-200/60 rounded-full shrink-0"
              onClick={() => setActiveChatId(null)}
            >
              <ChevronLeft className="h-6 w-6 sm:h-5 sm:w-5" />
            </Button>
            <Avatar className="h-11 w-11 sm:h-10 sm:w-10 cursor-pointer border border-slate-200 shrink-0">
              <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${activeChat.id}`} />
              <AvatarFallback className="bg-[#128C7E] text-white font-medium">
                {activeChat.leadName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col ml-1 min-w-0">
              <span className="font-semibold text-[15px] sm:text-sm text-slate-800 leading-tight truncate">
                {activeChat.leadName}
              </span>
              <span className="text-[13px] sm:text-xs text-slate-500 leading-tight truncate">
                {activeChat.phone}
              </span>
            </div>
          </div>
          <div className="flex gap-0 sm:gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 sm:h-10 sm:w-10 text-slate-600 hover:bg-slate-200/60 rounded-full"
            >
              <Phone className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 sm:h-10 sm:w-10 text-slate-600 hover:bg-slate-200/60 rounded-full"
            >
              <MoreVertical className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-[#EFEAE2]" ref={scrollRef}>
          {activeChat.messages.map((msg) => (
            <div
              key={msg.id}
              className={cn('flex', msg.direction === 'outgoing' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-xl p-2.5 sm:p-2 shadow-sm text-[15px] sm:text-sm relative group animate-fade-in-up',
                  msg.direction === 'outgoing'
                    ? 'bg-[#D9FDD3] rounded-tr-sm'
                    : 'bg-white rounded-tl-sm',
                )}
              >
                <p className="text-[#111B21] pr-3 pb-1.5 leading-relaxed whitespace-pre-wrap">
                  {msg.message_text}
                </p>
                <div className="flex items-center justify-end gap-1 -mt-1.5">
                  <span className="text-[11px] text-slate-500">
                    {msg.timestamp
                      ? new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </span>
                  {msg.direction === 'outgoing' && (
                    <CheckCheck className="h-4 w-4 sm:h-3.5 sm:w-3.5 text-[#53BDEB]" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#F0F2F5] p-3 flex items-center gap-2 shrink-0 border-t border-slate-200 z-10 pb-6 sm:pb-3">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem"
            className="flex-1 bg-white border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full px-4 h-12 sm:h-11 text-[16px] sm:text-[15px] shadow-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!inputText.trim()}
            size="icon"
            className="rounded-full bg-[#00A884] hover:bg-[#018F6F] h-12 w-12 sm:h-11 sm:w-11 shadow-sm text-white shrink-0 transition-colors disabled:opacity-50"
          >
            <Send className="h-5 w-5 sm:h-4 sm:w-4 ml-1 sm:ml-0.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="h-[72px] sm:h-16 bg-[#F0F2F5] px-4 flex items-center justify-between shrink-0 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-lg sm:text-base">
          <div className="h-9 w-9 sm:h-8 sm:w-8 bg-[#25D366] rounded-full flex items-center justify-center shadow-sm shrink-0">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          Conversas WhatsApp
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
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-3 p-3 sm:p-3 hover:bg-[#F5F6F6] cursor-pointer border-b border-slate-50 transition-colors"
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
          ))}
          {filteredChats.length === 0 && (
            <div className="p-8 text-center text-[15px] sm:text-sm text-slate-500 mt-10">
              Nenhum contato encontrado com "{search}".
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
