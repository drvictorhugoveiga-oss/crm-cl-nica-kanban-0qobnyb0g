import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  content: string
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Generate or retrieve a persistent session ID for the widget
    let sid = sessionStorage.getItem('clinic_chat_session')
    if (!sid) {
      sid = 'web-' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('clinic_chat_session', sid)
    }
    setSessionId(sid)
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isOpen])

  const initializeChat = async () => {
    if (messages.length === 0 && !isLoading) {
      await sendMessage('', true)
    }
  }

  const sendMessage = async (text: string, isInit = false) => {
    if (!text.trim() && !isInit) return

    if (!isInit) {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text }])
      setInput('')
    }

    setIsLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('chatbot-handler', {
        body: { session_id: sessionId, message: isInit ? 'start' : text, platform: 'website' },
      })

      if (error) throw error

      if (data?.reply) {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: 'bot', content: data.reply },
        ])
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'bot',
          content: 'Desculpe, ocorreu um erro de conexão.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-[320px] sm:w-[380px] h-[500px] mb-4 shadow-xl border-border flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
          <CardHeader className="p-4 border-b border-border bg-primary/5 shrink-0 flex flex-row items-center justify-between rounded-t-lg">
            <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
              <MessageCircle className="h-5 w-5" />
              Atendimento Online
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full"
            >
              <X className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-0 overflow-hidden relative">
            <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex w-max max-w-[85%] flex-col gap-2 rounded-2xl px-4 py-2 text-sm',
                      msg.role === 'user'
                        ? 'ml-auto bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-muted text-foreground rounded-bl-none',
                    )}
                  >
                    {msg.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex w-max max-w-[85%] bg-muted text-muted-foreground rounded-2xl rounded-bl-none px-4 py-3 text-sm">
                    <span className="flex space-x-1">
                      <span className="animate-bounce inline-block h-1.5 w-1.5 bg-current rounded-full" />
                      <span className="animate-bounce inline-block h-1.5 w-1.5 bg-current rounded-full delay-75" />
                      <span className="animate-bounce inline-block h-1.5 w-1.5 bg-current rounded-full delay-150" />
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-3 border-t border-border bg-card shrink-0">
            <form
              className="flex w-full items-center space-x-2"
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
            >
              <Input
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                className="flex-1 h-10 border-muted bg-muted/50 focus-visible:ring-1"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="h-10 w-10 shrink-0 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      )}

      <Button
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) initializeChat()
        }}
        size="icon"
        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>
    </div>
  )
}
