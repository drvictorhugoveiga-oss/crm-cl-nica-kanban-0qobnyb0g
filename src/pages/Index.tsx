import { KanbanBoard } from '@/components/KanbanBoard'
import { AIInsightsPanel } from '@/components/AIInsightsPanel'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { logAudit } from '@/services/audit'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

const Index = () => {
  const { user } = useAuth()

  const handleExport = () => {
    if (user) {
      logAudit(user.id, 'Exported Leads Data', { page: 'KanbanBoard' })
      toast.success('Dados exportados e log de auditoria registrado.', { duration: 3000 })
    }
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden animate-fade-in bg-background relative">
      {/* Header Section */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-4 shrink-0 flex flex-col shadow-sm z-10 transition-all duration-300">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Leads</h1>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              Acompanhe e gerencie a jornada dos seus leads.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2 shrink-0 h-11 sm:h-9 w-full sm:w-auto rounded-xl sm:rounded-md hover:bg-accent transition-all duration-300 ease-in-out"
            >
              <Download className="h-4 w-4" /> <span className="sm:inline">Exportar Dados</span>
            </Button>
          </div>
        </div>
      </div>

      <AIInsightsPanel />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <KanbanBoard />
      </div>
    </div>
  )
}

export default Index
