import { useKanbanStore } from '@/stores/useKanbanStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  LayoutDashboard,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { useState } from 'react'
import { ColumnDialog } from './ColumnDialog'
import { toast } from 'sonner'
import { KanbanColumnDef } from '@/types'
import { cn } from '@/lib/utils'

export function KanbanSettings() {
  const { columns, deleteColumn, reorderColumns } = useKanbanStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCol, setEditingCol] = useState<KanbanColumnDef | null>(null)

  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('settingsColId', id)
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault()
    if (draggedId && draggedId !== id) {
      setDragOverId(id)
    }
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData('settingsColId')
    if (sourceId && sourceId !== targetId) {
      const targetIndex = columns.findIndex((c) => c.id === targetId)
      if (targetIndex !== -1) {
        reorderColumns(sourceId, targetIndex)
      }
    }
    setDraggedId(null)
    setDragOverId(null)
  }

  const handleDelete = (id: string) => {
    if (columns.length <= 1) {
      toast.error('Você precisa ter pelo menos uma coluna no funil.')
      return
    }
    if (
      confirm(
        'Tem certeza que deseja excluir esta coluna? Os leads nela contidos serão movidos para a primeira coluna disponível.',
      )
    ) {
      deleteColumn(id)
    }
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderColumns(columns[index].id, index - 1)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < columns.length - 1) {
      reorderColumns(columns[index].id, index + 1)
    }
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Colunas do Kanban</CardTitle>
            <CardDescription>
              Gerencie as etapas do seu funil. Arraste para reordenar ou use as setas.
            </CardDescription>
          </div>
        </div>
        <Button
          onClick={() => {
            setEditingCol(null)
            setDialogOpen(true)
          }}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Coluna
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {columns.map((col, index) => (
            <div
              key={col.id}
              draggable
              onDragStart={(e) => handleDragStart(e, col.id)}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, col.id)}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border rounded-xl transition-all duration-200 group',
                draggedId === col.id
                  ? 'opacity-50 scale-[0.98] border-dashed border-slate-300'
                  : 'border-slate-200 shadow-sm hover:border-slate-300',
                dragOverId === col.id && draggedId !== col.id
                  ? 'border-primary border-dashed bg-primary/5 shadow-md -translate-y-0.5'
                  : '',
              )}
            >
              <div className="flex items-center gap-3 mb-3 sm:mb-0">
                <div
                  className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors p-1"
                  aria-label="Arraste para reordenar"
                >
                  <GripVertical className="w-5 h-5" />
                </div>
                <div
                  className="w-4 h-4 rounded-full shadow-sm shrink-0"
                  style={{ backgroundColor: col.color }}
                />
                <span className="font-medium text-slate-700">{col.title}</span>
                <Badge variant="outline" className="ml-2 text-[10px] text-slate-500 font-medium">
                  Posição {index + 1}
                </Badge>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-1 w-full sm:w-auto pl-10 sm:pl-0">
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity mr-4 sm:mr-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    title="Mover para cima"
                    className="h-8 w-8 text-slate-500 disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === columns.length - 1}
                    title="Mover para baixo"
                    className="h-8 w-8 text-slate-500 disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingCol(col)
                      setDialogOpen(true)
                    }}
                    className="h-8 w-8"
                  >
                    <Edit2 className="w-4 h-4 text-slate-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(col.id)}
                    className="h-8 w-8"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <ColumnDialog open={dialogOpen} onOpenChange={setDialogOpen} editingColumn={editingCol} />
    </Card>
  )
}
