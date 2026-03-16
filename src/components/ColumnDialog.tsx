import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { KanbanColumnDef } from '@/types'

const COLORS = [
  '#3b82f6',
  '#a855f7',
  '#f97316',
  '#10b981',
  '#ef4444',
  '#64748b',
  '#ec4899',
  '#eab308',
  '#14b8a6',
  '#f43f5e',
]

interface ColumnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingColumn: KanbanColumnDef | null
}

export function ColumnDialog({ open, onOpenChange, editingColumn }: ColumnDialogProps) {
  const { addColumn, updateColumn, columns } = useKanbanStore()
  const [title, setTitle] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingColumn) {
      setTitle(editingColumn.title)
      setColor(editingColumn.color)
    } else {
      setTitle('')
      setColor(COLORS[0])
    }
  }, [editingColumn, open])

  const titleExists = columns.some(
    (c) =>
      c.title.trim().toLowerCase() === title.trim().toLowerCase() && c.id !== editingColumn?.id,
  )

  const handleSave = async () => {
    if (!title.trim() || titleExists) return
    setLoading(true)
    if (editingColumn) {
      await updateColumn(editingColumn.id, title, color)
    } else {
      await addColumn(title, color)
    }
    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingColumn ? 'Editar Coluna' : 'Nova Coluna'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Nome da Coluna</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Em Negociação"
              className={`focus-visible:ring-primary/50 ${titleExists ? 'border-red-500 focus-visible:ring-red-500/50' : ''}`}
            />
            {titleExists && (
              <p className="text-[13px] text-red-500 font-medium">
                Já existe uma coluna com este nome.
              </p>
            )}
          </div>
          <div className="space-y-3">
            <Label>Cor de Destaque</Label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 shadow-sm ${color === c ? 'border-slate-800 scale-110 ring-2 ring-offset-2 ring-slate-200' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !title.trim() || titleExists}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
