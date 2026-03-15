import { COLUMNS } from '@/types'
import { KanbanColumn } from './KanbanColumn'

export function KanbanBoard() {
  return (
    <div className="flex-1 h-full overflow-x-auto kanban-scroll p-4 sm:p-6 pb-8 flex gap-6 items-start">
      {COLUMNS.map((col) => (
        <KanbanColumn key={col.id} id={col.id} title={col.title} colorClass={col.color} />
      ))}
    </div>
  )
}
