import { KanbanBoard } from '@/components/KanbanBoard'
import { WhatsAppSidebar } from '@/components/WhatsAppSidebar'
import useWhatsAppStore from '@/stores/useWhatsAppStore'
import { cn } from '@/lib/utils'

const Index = () => {
  const { isOpen } = useWhatsAppStore()

  return (
    <div className="h-full w-full flex overflow-hidden animate-fade-in bg-[#F8FAFC] relative">
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <div className="px-6 py-5 hidden sm:block shrink-0">
          <h1 className="text-2xl font-bold text-slate-800">Funil de Atendimento</h1>
          <p className="text-slate-500 text-sm mt-1">
            Gerencie a jornada dos seus pacientes arrastando os cards.
          </p>
        </div>
        <KanbanBoard />
      </div>

      {/* WhatsApp Sidebar Container */}
      <div
        className={cn(
          'shrink-0 h-full bg-white transition-all duration-300 ease-in-out z-30 sm:relative absolute right-0 top-0 bottom-0 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] overflow-hidden',
          isOpen
            ? 'w-full sm:w-[380px] translate-x-0 border-l border-slate-200'
            : 'w-0 translate-x-full border-transparent shadow-none',
        )}
      >
        <div className="w-[100vw] sm:w-[380px] h-full flex flex-col">
          <WhatsAppSidebar />
        </div>
      </div>
    </div>
  )
}

export default Index
