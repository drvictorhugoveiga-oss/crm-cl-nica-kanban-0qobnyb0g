import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useLeadStore from '@/stores/useLeadStore'

interface SaveFilterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SaveFilterDialog({ open, onOpenChange }: SaveFilterDialogProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { saveCurrentFilter } = useLeadStore()

  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    await saveCurrentFilter(name.trim())
    setLoading(false)
    setName('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] w-[95vw] p-5 sm:p-6 transition-all duration-300">
        <DialogHeader>
          <DialogTitle>Salvar Filtros Atuais</DialogTitle>
          <DialogDescription>
            Dê um nome para esta combinação de filtros para usá-la rapidamente depois.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <Label>Nome do Filtro</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Leads do Google Ads este mês"
            className="h-11 sm:h-10 focus-visible:ring-primary/50 transition-all duration-300"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0 mt-2 border-t border-slate-100 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 sm:h-10 w-full sm:w-auto rounded-xl sm:rounded-md transition-all duration-300"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="h-11 sm:h-10 w-full sm:w-auto rounded-xl sm:rounded-md transition-all duration-300"
          >
            {loading ? 'Salvando...' : 'Salvar Filtro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
