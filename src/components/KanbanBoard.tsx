import { useKanbanStore } from '@/stores/useKanbanStore'
import useLeadStore from '@/stores/useLeadStore'
import { KanbanColumn } from './KanbanColumn'
import { KanbanFilters } from './KanbanFilters'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { ColumnDialog } from './ColumnDialog'
import { Skeleton } from '@/components/ui/skeleton'

export function KanbanBoard() {
  const { columns, isLoading } = useKanbanStore()
  const { selectedStages } = useLeadStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollInterval = useRef<number | null>(null)

  const visibleColumns =
    selectedStages.length > 0 ? columns.filter((c) => selectedStages.includes(c.title)) : columns

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!scrollRef.current) return

    const container = scrollRef.current
    const threshold = 120 // Pixels near edges to trigger auto-scroll
    const mouseX = e.clientX
    const { left, right, width } = container.getBoundingClientRect()

    if (scrollInterval.current) {
      window.clearInterval(scrollInterval.current)
      scrollInterval.current = null
    }

    if (mouseX < left + threshold) {
      scrollInterval.current = window.setInterval(() => {
        if (container.scrollLeft > 0) {
          container.scrollLeft -= 15
        }
      }, 16)
    } else if (mouseX > right - threshold) {
      scrollInterval.current = window.setInterval(() => {
        if (container.scrollLeft < container.scrollWidth - width) {
          container.scrollLeft += 15
        }
      }, 16)
    }
  }

  const handleDragLeave = () => {
    if (scrollInterval.current) {
      window.clearInterval(scrollInterval.current)
      scrollInterval.current = null
    }
  }

  const handleDrop = () => {
    if (scrollInterval.current) {
      window.clearInterval(scrollInterval.current)
      scrollInterval.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (scrollInterval.current) window.clearInterval(scrollInterval.current)
    }
  }, [])

  return (
    <div className="flex flex-col h-full w-full bg-background/50">
      <KanbanFilters />
      <div
        ref={scrollRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="flex-1 h-full overflow-x-auto overflow-y-hidden kanban-scroll p-4 sm:p-6 pb-8 flex gap-4 sm:gap-6 items-start snap-x snap-mandatory touch-pan-x"
      >
        {isLoading && columns.length === 0 ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[280px] w-[85vw] sm:w-[320px] max-w-[350px] shrink-0 bg-secondary/30 rounded-2xl h-full p-3 flex flex-col gap-3 snap-center border border-border/50"
            >
              <Skeleton className="h-12 w-full rounded-xl bg-muted/50" />
              <Skeleton className="h-28 w-full rounded-xl bg-muted/50" />
              <Skeleton className="h-28 w-full rounded-xl bg-muted/50" />
            </div>
          ))
        ) : (
          <>
            {visibleColumns.map((col) => (
              <KanbanColumn key={col.id} column={col} />
            ))}
            <div className="min-w-[280px] w-[85vw] sm:w-[320px] max-w-[350px] shrink-0 snap-center pt-2">
              <Button
                variant="outline"
                className="w-full h-14 rounded-xl border-dashed border-2 border-border/80 text-muted-foreground hover:text-foreground hover:border-border bg-background/50 hover:bg-accent/50 transition-all shadow-sm"
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
    </div>
  )
}
