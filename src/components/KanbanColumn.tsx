import { useState } from 'react'
import { LeadStatus } from '@/types'
import { KanbanCard } from './KanbanCard'
import useLeadStore from '@/stores/useLeadStore'
import { cn } from '@/lib/utils'

interface KanbanColumnProps {
  id: LeadStatus
  title: string
  colorClass: string
}

export function KanbanColumn({ id, title, colorClass }: KanbanColumnProps) {
  const { leads, updateLeadStatus } = useLeadStore()
  const [isOver, setIsOver] = useState(false)

  const columnLeads = leads.filter((lead) => lead.status === id)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!isOver) setIsOver(true)
  }

  const handleDragLeave = () => {
    setIsOver(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsOver(false)
    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) {
      updateLeadStatus(leadId, id)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col min-w-[280px] sm:min-w-[300px] max-w-[320px] shrink-0 bg-slate-100/50 rounded-2xl h-full transition-colors duration-200',
        isOver && 'bg-slate-200/80 outline-dashed outline-2 outline-primary/30 outline-offset-2',
      )}
    >
      <div className="flex items-center justify-between p-4 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              'w-2.5 h-2.5 rounded-full',
              colorClass.replace('border-', 'bg-').replace('border-l-', 'bg-'),
            )}
          />
          <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
        </div>
        <span className="bg-white text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm border border-slate-200">
          {columnLeads.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto kanban-scroll p-4 pt-0 flex flex-col gap-3">
        {columnLeads.length === 0 ? (
          <div className="h-24 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center">
            <span className="text-sm text-slate-400 font-medium">Nenhum lead nesta etapa</span>
          </div>
        ) : (
          columnLeads.map((lead) => <KanbanCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  )
}
