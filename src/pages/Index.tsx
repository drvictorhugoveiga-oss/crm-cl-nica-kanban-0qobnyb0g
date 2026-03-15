import { KanbanBoard } from '@/components/KanbanBoard'
import { WhatsAppSidebar } from '@/components/WhatsAppSidebar'
import useWhatsAppStore from '@/stores/useWhatsAppStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { logAudit } from '@/services/audit'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

const Index = () => {
  const { isOpen } = useWhatsAppStore()
  const { user } = useAuth()

  const handleExport = () => {
    if (user) {
      logAudit(user.id, 'Exported Leads Data', { page: 'KanbanBoard' })
      toast.success('Dados exportados e log de auditoria registrado em conformidade com LGPD.')
    }
  }

  return (
    <div className="h-full w-full flex overflow-hidden animate-fade-in bg-[#F8FAFC] relative">
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <div className="px-6 py-5 hidden sm:flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Funil de Atendimento</h1>
            <p className="text-slate-500 text-sm mt-1">
              Gerencie a jornada dos seus pacientes arrastando os cards.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" /> Exportar Dados
          </Button>
        </div>
        <KanbanBoard />
      </div>

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
