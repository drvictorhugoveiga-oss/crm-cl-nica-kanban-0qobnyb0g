import { KanbanBoard } from '@/components/KanbanBoard'
import { WhatsAppSidebar } from '@/components/WhatsAppSidebar'
import useWhatsAppStore from '@/stores/useWhatsAppStore'
import useLeadStore from '@/stores/useLeadStore'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Download, Search, Filter } from 'lucide-react'
import { logAudit } from '@/services/audit'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const Index = () => {
  const { isOpen } = useWhatsAppStore()
  const { user } = useAuth()
  const { searchQuery, setSearchQuery, sourceFilter, setSourceFilter, origins } = useLeadStore()

  const handleExport = () => {
    if (user) {
      logAudit(user.id, 'Exported Leads Data', { page: 'KanbanBoard' })
      toast.success('Dados exportados e log de auditoria registrado.', { duration: 3000 })
    }
  }

  return (
    <div className="h-full w-full flex overflow-hidden animate-fade-in bg-[#F8FAFC] relative">
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out relative h-full">
        {/* Header Section with Filters */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 shrink-0 flex flex-col gap-4 shadow-sm z-10 transition-all duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Leads</h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Acompanhe e gerencie a jornada dos seus leads.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="gap-2 shrink-0 h-11 sm:h-9 w-full sm:w-auto rounded-xl sm:rounded-md hover:bg-slate-50 transition-all duration-300 ease-in-out"
            >
              <Download className="h-4 w-4" /> <span className="sm:inline">Exportar Dados</span>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors duration-300" />
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                className="pl-10 h-11 sm:h-10 bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-primary/50 transition-all duration-300 ease-in-out hover:bg-slate-100/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-64 shrink-0">
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="h-11 sm:h-10 bg-slate-50 border-slate-200 rounded-xl hover:bg-slate-100/50 transition-all duration-300 ease-in-out">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Filter className="h-4 w-4 shrink-0" />
                    <SelectValue placeholder="Todas as Origens" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Origens</SelectItem>
                  {origins.map((o) => (
                    <SelectItem key={o.id} value={o.name}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
          <KanbanBoard />
        </div>
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
