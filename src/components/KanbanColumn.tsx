import { useState, useRef } from 'react'
import { LeadStage } from '@/types'
import { KanbanCard } from './KanbanCard'
import useLeadStore from '@/stores/useLeadStore'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface KanbanColumnProps {
  id: LeadStage
  title: string
  colorClass: string
}

export function KanbanColumn({ id, title, colorClass }: KanbanColumnProps) {
  const { leads, updateLeadStage, searchQuery, sourceFilter, isLoading } = useLeadStore()
  const [isOver, setIsOver] = useState(false)
  const dragCounter = useRef(0)

  const columnLeads = leads.filter((lead) => {
    if (lead.stage !== id) return false

    const query = searchQuery.toLowerCase()
    const matchesSearch =
      !query ||
      lead.name.toLowerCase().includes(query) ||
      lead.phone.includes(query) ||
      (lead.email && lead.email.toLowerCase().includes(query))

    const matchesSource = sourceFilter === 'all' || lead.origin === sourceFilter

    return matchesSearch && matchesSource
  })

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsOver(true)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (!isOver) setIsOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounter.current--
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    dragCounter.current = 0
    setIsOver(false)

    const leadId = e.dataTransfer.getData('leadId')
    if (leadId) {
      updateLeadStage(leadId, id)
    }
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col min-w-[300px] w-[85vw] sm:w-[320px] max-w-[350px] shrink-0 bg-slate-100/60 rounded-2xl h-full transition-colors duration-300 snap-center border border-slate-200/50',
        isOver && 'bg-slate-200/90 outline-dashed outline-2 outline-primary/40 outline-offset-2',
      )}
    >
      <div className="flex items-center justify-between p-4 mb-1">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              'w-3 h-3 rounded-full shadow-sm',
              colorClass.replace('border-', 'bg-').replace('border-l-', 'bg-'),
            )}
          />
          <h3 className="font-semibold text-slate-800 text-[15px]">{title}</h3>
        </div>
        <span className="bg-white text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm border border-slate-200/60 transition-all">
          {isLoading && leads.length === 0 ? (
            <Skeleton className="h-3 w-3 bg-slate-200" />
          ) : (
            columnLeads.length
          )}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto kanban-scroll p-3 pt-0 flex flex-col gap-3 min-h-[150px]">
        {isLoading && leads.length === 0 && !searchQuery && sourceFilter === 'all' ? (
          <>
            <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm animate-pulse">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm animate-pulse opacity-70">
              <Skeleton className="h-5 w-2/3 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-3/4 mb-4" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </>
        ) : columnLeads.length === 0 ? (
          <div className="h-28 rounded-xl border-2 border-dashed border-slate-300/70 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
            <span className="text-sm text-slate-500 font-medium">Nenhum lead nesta etapa</span>
            {(searchQuery || sourceFilter !== 'all') && (
              <span className="text-xs text-slate-400 mt-1">Ajuste os filtros de busca</span>
            )}
          </div>
        ) : (
          columnLeads.map((lead) => <KanbanCard key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  )
}
