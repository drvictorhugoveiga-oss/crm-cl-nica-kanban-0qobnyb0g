import { COLUMNS } from '@/types'
import { KanbanColumn } from './KanbanColumn'

export function KanbanBoard() {
  return (
    <div className="flex-1 h-full overflow-x-auto kanban-scroll p-4 sm:p-6 pb-8 flex gap-4 sm:gap-6 items-start snap-x snap-mandatory scroll-smooth">
      {COLUMNS.map((col) => (
        <KanbanColumn key={col.id} id={col.id} title={col.title} colorClass={col.color} />
      ))}
      {/* Invisible padding element to ensure proper scroll snapping at the end */}
      <div className="min-w-[1px] shrink-0 sm:hidden"></div>
    </div>
  )
}
