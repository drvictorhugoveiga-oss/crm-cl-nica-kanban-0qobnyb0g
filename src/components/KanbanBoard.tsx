import { useKanbanStore } from '@/stores/useKanbanStore'
import { KanbanColumn } from './KanbanColumn'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { ColumnDialog } from './ColumnDialog'
import { Skeleton } from '@/components/ui/skeleton'

export function KanbanBoard() {
  const { columns, isLoading } = useKanbanStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="flex-1 h-full overflow-x-auto overflow-y-hidden kanban-scroll p-4 sm:p-6 pb-8 flex gap-4 sm:gap-6 items-start snap-x snap-mandatory scroll-smooth touch-pan-x">
      {isLoading && columns.length === 0 ? (
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="min-w-[280px] w-[85vw] sm:w-[320px] max-w-[350px] shrink-0 bg-slate-100/60 rounded-2xl h-full p-3 flex flex-col gap-3 snap-center"
          >
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
        ))
      ) : (
        <>
          {columns.map((col) => (
            <KanbanColumn key={col.id} column={col} />
          ))}
          <div className="min-w-[280px] w-[85vw] sm:w-[320px] max-w-[350px] shrink-0 snap-center pt-2">
            <Button
              variant="outline"
              className="w-full h-14 rounded-xl border-dashed border-2 border-slate-300 text-slate-500 hover:text-slate-700 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/50 transition-all shadow-sm"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-5 h-5 mr-2" /> Adicionar Coluna
            </Button>
          </div>
        </>
      )}
      <div className="min-w-[1px] shrink-0 sm:hidden"></div>
      <ColumnDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} editingColumn={null} />
    </div>
  )
}
