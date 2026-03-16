import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, Send, CheckCheck, MoreVertical, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import useWhatsAppStore from '@/stores/useWhatsAppStore'
import { cn } from '@/lib/utils'

export function WhatsAppActiveChat() {
  const { chats, activeChatId, setActiveChatId, sendMessage } = useWhatsAppStore()
  const [inputText, setInputText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeChat = chats.find((c) => c.id === activeChatId)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [activeChat?.messages])

  const handleSend = () => {
    if (!inputText.trim() || !activeChatId) return
    sendMessage(activeChatId, inputText)
    setInputText('')
  }

  if (!activeChat) return null

  return (
    <div className="flex flex-col h-full w-full bg-[#EFEAE2] dark:bg-[#0b141a] animate-fade-in absolute inset-0 z-30 sm:relative">
      <div className="h-[72px] sm:h-16 bg-muted/60 dark:bg-secondary/80 px-2 sm:px-4 flex items-center justify-between border-b border-border shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-12 w-12 sm:h-10 sm:w-10 sm:-ml-2 text-muted-foreground hover:bg-accent rounded-full shrink-0 sm:hidden"
            onClick={() => setActiveChatId(null)}
          >
            <ChevronLeft className="h-6 w-6 sm:h-5 sm:w-5" />
          </Button>
          <Avatar className="h-11 w-11 sm:h-10 sm:w-10 cursor-pointer border border-border shrink-0">
            <AvatarImage src={`https://img.usecurling.com/ppl/thumbnail?seed=${activeChat.id}`} />
            <AvatarFallback className="bg-[#128C7E] text-white font-medium">
              {activeChat.leadName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col ml-1 min-w-0">
            <span className="font-semibold text-[15px] sm:text-sm text-foreground leading-tight truncate">
              {activeChat.leadName}
            </span>
            <span className="text-[13px] sm:text-xs text-muted-foreground leading-tight truncate">
              {activeChat.phone}
            </span>
          </div>
        </div>
        <div className="flex gap-0 sm:gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 sm:h-10 sm:w-10 text-muted-foreground hover:bg-accent rounded-full"
          >
            <Phone className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-11 w-11 sm:h-10 sm:w-10 text-muted-foreground hover:bg-accent rounded-full"
          >
            <MoreVertical className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-[#EFEAE2] dark:bg-[#0b141a]"
        ref={scrollRef}
      >
        <div className="absolute inset-0 opacity-40 dark:opacity-10 bg-[url('https://img.usecurling.com/p/800/800?q=pattern&color=gray')] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
        {activeChat.messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex relative z-10',
              msg.direction === 'outgoing' ? 'justify-end' : 'justify-start',
            )}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-xl p-2.5 sm:p-2 shadow-sm text-[15px] sm:text-sm relative group animate-fade-in-up',
                msg.direction === 'outgoing'
                  ? 'bg-[#D9FDD3] dark:bg-[#005c4b] rounded-tr-sm'
                  : 'bg-white dark:bg-slate-800 rounded-tl-sm',
              )}
            >
              <p className="text-[#111B21] dark:text-foreground pr-3 pb-1.5 leading-relaxed whitespace-pre-wrap">
                {msg.message_text}
              </p>
              <div className="flex items-center justify-end gap-1 -mt-1.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
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

      <div className="bg-muted/60 dark:bg-secondary/80 p-3 flex items-center gap-2 shrink-0 border-t border-border z-10 pb-6 sm:pb-3">
        <Input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Digite uma mensagem"
          className="flex-1 bg-card border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 rounded-full px-4 h-12 sm:h-11 text-[16px] sm:text-[15px] shadow-sm"
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
