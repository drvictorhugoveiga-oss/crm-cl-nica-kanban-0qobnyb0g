import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useLeadStore from '@/stores/useLeadStore'
import { toast } from 'sonner'

export function NewLeadDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addLead, origins } = useLeadStore()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    origin: '',
    lgpd_consent: false,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await addLead({
        user_id: '',
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        origin: formData.origin,
        stage: 'novo_contato',
        contact_date: new Date().toISOString().split('T')[0],
        lgpd_consent: formData.lgpd_consent,
      })
      toast.success('Lead criado com sucesso!')
      onOpenChange(false)
      setFormData({ name: '', phone: '', email: '', origin: '', lgpd_consent: false })
    } catch (err) {
      toast.error('Erro ao criar lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Lead</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label>Nome do Paciente</Label>
            <Input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Telefone (WhatsApp)</Label>
              <Input
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Origem do Lead</Label>
            <Select
              required
              value={formData.origin}
              onValueChange={(v) => setFormData({ ...formData, origin: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {origins.map((o) => (
                  <SelectItem key={o.id} value={o.name}>
                    {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-lg border border-slate-200 mt-2">
            <Checkbox
              id="lgpd"
              checked={formData.lgpd_consent}
              onCheckedChange={(c) => setFormData({ ...formData, lgpd_consent: c === true })}
              className="mt-0.5"
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="lgpd" className="text-sm font-medium">
                Consentimento LGPD
              </Label>
              <p className="text-xs text-slate-500">
                O paciente forneceu consentimento para o tratamento e armazenamento de seus dados
                pessoais.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Lead'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
