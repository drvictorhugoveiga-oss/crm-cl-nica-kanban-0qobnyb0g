import { MessageCircle } from 'lucide-react'
import { WhatsAppSidebar } from '@/components/WhatsAppSidebar'

const Chat = () => {
  return (
    <div className="h-full w-full bg-[#EFEAE2] flex animate-fade-in relative overflow-hidden">
      <div className="w-full sm:max-w-[380px] h-full flex-shrink-0 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.1)] z-10">
        <WhatsAppSidebar />
      </div>
      <div className="hidden sm:flex flex-1 flex-col items-center justify-center relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-40 bg-[url('https://img.usecurling.com/p/800/800?q=pattern&color=gray')] pointer-events-none mix-blend-multiply" />

        <div className="relative z-10 bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-sm text-center max-w-md border border-white/60">
          <div className="h-20 w-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_4px_14px_-4px_rgba(37,211,102,0.4)]">
            <MessageCircle className="h-10 w-10 text-[#25D366]" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-3">WhatsApp Web</h2>
          <p className="text-slate-600 leading-relaxed">
            Selecione ou inicie uma conversa no painel lateral. As mensagens são sincronizadas
            automaticamente com o CRM do ClinicFlow.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Chat
