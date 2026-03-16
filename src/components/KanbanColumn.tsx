import { useState, useRef } from 'react'
import { KanbanCard } from './KanbanCard'
import useLeadStore from '@/stores/useLeadStore'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { KanbanColumnDef } from '@/types'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface KanbanColumnProps {
  column: KanbanColumnDef
}

export function KanbanColumn({ column }: KanbanColumnProps) {
  const { leads, updateLeadStage, searchQuery, sourceFilter, dateRange, isLoading } = useLeadStore()
  const { reorderColumns, columns } = useKanbanStore()
  const [isOver, setIsOver] = useState(false)
  const dragCounter = useRef(0)

  const columnLeads = leads.filter((lead) => {
    if (lead.stage !== column.title) return false

    const query = searchQuery.toLowerCase()
    const matchesSearch =
      !query ||
      lead.name.toLowerCase().includes(query) ||
      lead.phone.includes(query) ||
      (lead.email && lead.email.toLowerCase().includes(query))

    const matchesSource = sourceFilter === 'all' || lead.origin === sourceFilter

    let matchesDate = true
    if (dateRange?.from) {
      const leadDate = new Date(lead.created_at)
      const from = new Date(dateRange.from)
      from.setHours(0, 0, 0, 0)

      if (leadDate < from) {
        matchesDate = false
      } else if (dateRange.to) {
        const to = new Date(dateRange.to)
        to.setHours(23, 59, 59, 999)
        if (leadDate > to) {
          matchesDate = false
        }
      }
    }

    return matchesSearch && matchesSource && matchesDate
  })

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsOver(true)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    // Do not stop propagation here to allow KanbanBoard to scroll horizontally
    e.dataTransfer.dropEffect = 'move'
    if (!isOver) setIsOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current <= 0) {
      dragCounter.current = 0
      setIsOver(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current = 0
    setIsOver(false)

    const type = e.dataTransfer.getData('type')
    if (type === 'card') {
      const leadId = e.dataTransfer.getData('leadId')
      if (leadId) updateLeadStage(leadId, column.title)
    } else if (type === 'column') {
      const sourceColId = e.dataTransfer.getData('colId')
      if (sourceColId && sourceColId !== column.id) {
        const targetIndex = columns.findIndex((c) => c.id === column.id)
        if (targetIndex !== -1) {
          reorderColumns(sourceColId, targetIndex)
        }
      }
    }
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ outlineColor: isOver ? column.color : 'transparent' }}
      className={cn(
        'flex flex-col min-w-[280px] w-[85vw] sm:w-[320px] max-w-[350px] shrink-0 bg-slate-100/60 rounded-2xl h-full transition-all duration-300 snap-center border border-slate-200/50 ease-in-out relative',
        isOver && 'bg-slate-200/90 outline-dashed outline-2 outline-offset-2',
      )}
    >
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('type', 'column')
          e.dataTransfer.setData('colId', column.id)
        }}
        className="flex items-center justify-between p-4 mb-1 cursor-grab active:cursor-grabbing hover:bg-slate-200/50 rounded-t-2xl transition-colors duration-300 group touch-pan-x"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-3 h-3 rounded-full shadow-sm transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: column.color }}
          />
          <h3 className="font-semibold text-slate-800 text-[15px] select-none">{column.title}</h3>
        </div>
        <span className="bg-white text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm border border-slate-200/60 transition-all duration-300">
          {isLoading && leads.length === 0 ? <Skeleton className="h-3 w-3" /> : columnLeads.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto kanban-scroll p-3 pt-0 flex flex-col gap-3 min-h-[150px] touch-pan-y">
        {isLoading && leads.length === 0 && !searchQuery && sourceFilter === 'all' && !dateRange ? (
          <>
            <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm animate-pulse">
              <Skeleton className="h-5 w-3/4 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
            </div>
            <div className="rounded-xl border border-slate-200/60 bg-white p-4 shadow-sm animate-pulse opacity-70">
              <Skeleton className="h-5 w-2/3 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-2" />
            </div>
          </>
        ) : columnLeads.length === 0 ? (
          <div className="h-28 rounded-xl border-2 border-dashed border-slate-300/70 flex flex-col items-center justify-center text-center p-4 animate-fade-in bg-white/50 transition-all duration-300 ease-in-out pointer-events-none">
            {searchQuery || sourceFilter !== 'all' || dateRange ? (
              <>
                <span className="text-sm text-slate-500 font-medium">Nenhum lead encontrado</span>
                <span className="text-xs text-slate-400 mt-1">Verifique sua busca ou filtros</span>
              </>
            ) : (
              <span className="text-sm text-slate-500 font-medium">Nenhum lead nesta etapa</span>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-2 transition-all duration-300 ease-in-out">
            {columnLeads.map((lead) => (
              <KanbanCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
