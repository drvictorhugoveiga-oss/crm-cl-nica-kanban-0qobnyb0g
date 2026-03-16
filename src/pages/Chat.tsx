import { MessageCircle, Power } from 'lucide-react'
import { WhatsAppSidebar } from '@/components/WhatsAppSidebar'
import { WhatsAppActiveChat } from '@/components/WhatsAppActiveChat'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import useWhatsAppStore from '@/stores/useWhatsAppStore'
import { cn } from '@/lib/utils'

const Chat = () => {
  const { activeChatId } = useWhatsAppStore()

  const handleStartWhatsApp = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-handler', {
        body: { action: 'start' },
      })
      if (error) throw error
      toast.success('WhatsApp handler started! Check Edge Function logs for QR Code.')
    } catch (err) {
      toast.error('Failed to start WhatsApp handler')
    }
  }

  return (
    <div className="h-full w-full bg-[#EFEAE2] flex animate-fade-in relative overflow-hidden">
      <div
        className={cn(
          'h-full flex-shrink-0 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] z-20 bg-white transition-all duration-300',
          activeChatId ? 'hidden sm:flex w-full sm:max-w-[380px]' : 'w-full sm:max-w-[380px]',
        )}
      >
        <WhatsAppSidebar />
      </div>

      <div
        className={cn(
          'flex-1 h-full relative z-10 bg-[#EFEAE2]',
          activeChatId ? 'flex' : 'hidden sm:flex',
        )}
      >
        {activeChatId ? (
          <WhatsAppActiveChat />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center relative p-6">
            <div className="absolute inset-0 opacity-40 bg-[url('https://img.usecurling.com/p/800/800?q=pattern&color=gray')] pointer-events-none mix-blend-multiply" />

            <div className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-sm text-center max-w-md border border-white/60">
              <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_4px_14px_-4px_rgba(37,211,102,0.4)]">
                <MessageCircle className="h-10 w-10 text-[#25D366]" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">WhatsApp Web</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Selecione ou inicie uma conversa no painel lateral. As mensagens são sincronizadas
                automaticamente com o CRM do ClinicFlow.
              </p>
              <Button
                onClick={handleStartWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 rounded-full h-12"
              >
                <Power className="w-5 h-5" />
                Iniciar Conexão (Servidor)
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
