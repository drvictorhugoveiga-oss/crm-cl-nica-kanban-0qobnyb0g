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
        <div className="h-16 bg-[#F0F2F5] px-4 flex items-center justify-between border-b border-slate-200 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -ml-2 text-slate-600 hover:bg-slate-200 rounded-full"
              onClick={() => setActiveChatId(null)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Avatar className="h-10 w-10 cursor-pointer border border-slate-200">
              <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${activeChat.id}`} />
              <AvatarFallback className="bg-[#128C7E] text-white font-medium">
                {activeChat.leadName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-slate-800 leading-tight">
                {activeChat.leadName}
              </span>
              <span className="text-xs text-slate-500 leading-tight">{activeChat.phone}</span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-600 hover:bg-slate-200 rounded-full"
            >
              <Phone className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-600 hover:bg-slate-200 rounded-full"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-[#EFEAE2]" ref={scrollRef}>
          {activeChat.messages.map((msg) => (
            <div key={msg.id} className={cn('flex', msg.isSent ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-lg p-2.5 shadow-sm text-sm relative group animate-fade-in-up',
                  msg.isSent ? 'bg-[#D9FDD3] rounded-tr-sm' : 'bg-white rounded-tl-sm',
                )}
              >
                <p className="text-[#111B21] pr-2 pb-1.5 leading-relaxed">{msg.text}</p>
                <div className="flex items-center justify-end gap-1 -mt-1">
                  <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  {msg.isSent && <CheckCheck className="h-3.5 w-3.5 text-[#53BDEB]" />}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#F0F2F5] p-3 flex items-center gap-2 shrink-0 border-t border-slate-200 z-10">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite uma mensagem"
            className="flex-1 bg-white border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full px-4 h-11 text-[15px] shadow-sm"
          />
          <Button
            onClick={handleSend}
            disabled={!inputText.trim()}
            size="icon"
            className="rounded-full bg-[#00A884] hover:bg-[#018F6F] h-11 w-11 shadow-sm text-white shrink-0 transition-colors disabled:opacity-50"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="h-16 bg-[#F0F2F5] px-4 flex items-center justify-between shrink-0 border-b border-slate-200">
        <h2 className="font-semibold text-slate-800 flex items-center gap-2">
          <div className="h-8 w-8 bg-[#25D366] rounded-full flex items-center justify-center shadow-sm">
            <MessageCircle className="h-4 w-4 text-white" />
          </div>
          Conversas do WhatsApp
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-slate-500 hover:bg-slate-200 rounded-full"
          onClick={toggleSidebar}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-2 border-b border-slate-100 bg-white shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Pesquisar contatos..."
            className="pl-9 bg-[#F0F2F5] border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-lg h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScrollArea className="flex-1 bg-white">
        <div className="flex flex-col">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-3 p-3 hover:bg-[#F5F6F6] cursor-pointer border-b border-slate-50 transition-colors"
              onClick={() => setActiveChatId(chat.id)}
            >
              <Avatar className="h-12 w-12 shrink-0 border border-slate-100">
                <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${chat.id}`} />
                <AvatarFallback className="bg-[#128C7E] text-white font-medium">
                  {chat.leadName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-semibold text-slate-800 text-[15px] truncate">
                    {chat.leadName}
                  </span>
                  <span
                    className={cn(
                      'text-xs whitespace-nowrap',
                      chat.unread > 0 ? 'text-[#25D366] font-semibold' : 'text-slate-500',
                    )}
                  >
                    {chat.lastMessageTime}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <p className="text-sm text-slate-500 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="bg-[#25D366] text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shrink-0 shadow-sm">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filteredChats.length === 0 && (
            <div className="p-8 text-center text-sm text-slate-500">Nenhum contato encontrado.</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
