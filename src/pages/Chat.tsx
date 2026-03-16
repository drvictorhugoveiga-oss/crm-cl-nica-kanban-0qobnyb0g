import { WhatsAppSidebar } from '@/components/WhatsAppSidebar'
import { WhatsAppActiveChat } from '@/components/WhatsAppActiveChat'
import { WhatsAppConnectionScreen } from '@/components/WhatsAppConnectionScreen'
import { MessageCircle } from 'lucide-react'
import useWhatsAppStore from '@/stores/useWhatsAppStore'
import { cn } from '@/lib/utils'

const Chat = () => {
  const { activeChatId, connectionStatus } = useWhatsAppStore()

  return (
    <div className="h-full w-full bg-muted/30 dark:bg-background flex animate-fade-in relative overflow-hidden">
      <div
        className={cn(
          'h-full flex-shrink-0 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] z-20 bg-card transition-all duration-300',
          activeChatId ? 'hidden sm:flex w-full sm:max-w-[380px]' : 'w-full sm:max-w-[380px]',
        )}
      >
        <WhatsAppSidebar />
      </div>

      <div
        className={cn(
          'flex-1 h-full relative z-10 bg-muted/30 dark:bg-background',
          activeChatId ? 'flex' : 'hidden sm:flex',
        )}
      >
        {connectionStatus === 'connected' ? (
          activeChatId ? (
            <WhatsAppActiveChat />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center relative p-6">
              <div className="absolute inset-0 opacity-40 dark:opacity-10 bg-[url('https://img.usecurling.com/p/800/800?q=pattern&color=gray')] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />
              <div className="relative z-10 text-center max-w-md animate-fade-in-up">
                <div className="h-24 w-24 bg-card/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-border/50 text-muted-foreground/30">
                  <MessageCircle className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground mb-2">WhatsApp Conectado</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Selecione uma conversa no painel lateral para começar a enviar e receber
                  mensagens.
                </p>
              </div>
            </div>
          )
        ) : (
          <WhatsAppConnectionScreen />
        )}
      </div>
    </div>
  )
}

export default Chat
