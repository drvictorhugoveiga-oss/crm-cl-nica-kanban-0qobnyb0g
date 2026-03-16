import { useKanbanStore } from '@/stores/useKanbanStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, GripVertical, Edit2, Trash2, LayoutDashboard } from 'lucide-react'
import { useState } from 'react'
import { ColumnDialog } from './ColumnDialog'
import { toast } from 'sonner'
import { KanbanColumnDef } from '@/types'

export function KanbanSettings() {
  const { columns, deleteColumn, reorderColumns } = useKanbanStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCol, setEditingCol] = useState<KanbanColumnDef | null>(null)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData('settingsColId', id)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    const sourceId = e.dataTransfer.getData('settingsColId')
    if (sourceId && sourceId !== targetId) {
      reorderColumns(sourceId, targetId)
    }
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
              Gerencie as etapas do seu funil. Arraste para reordenar.
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
        <div className="space-y-2">
          {columns.map((col) => (
            <div
              key={col.id}
              draggable
              onDragStart={(e) => handleDragStart(e, col.id)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col.id)}
              className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors p-1">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: col.color }}
                />
                <span className="font-medium text-slate-700">{col.title}</span>
              </div>
              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setEditingCol(col)
                    setDialogOpen(true)
                  }}
                >
                  <Edit2 className="w-4 h-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(col.id)}>
                  <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <ColumnDialog open={dialogOpen} onOpenChange={setDialogOpen} editingColumn={editingCol} />
    </Card>
  )
}
