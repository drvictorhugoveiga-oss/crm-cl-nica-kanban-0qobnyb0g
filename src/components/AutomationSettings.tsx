import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Bot } from 'lucide-react'

export function AutomationSettings() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [template, setTemplate] = useState(
    'Olá [Name], notei que não conversamos nos últimos dias. Gostaria de tirar alguma dúvida pendente?',
  )

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('follow_up_enabled, follow_up_template')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) {
            console.error('Failed to load automation settings', error)
            return
          }
          if (data) {
            // @ts-expect-error - Supabase types might not have these columns yet on the frontend
            if (data.follow_up_enabled !== undefined && data.follow_up_enabled !== null)
              setEnabled(data.follow_up_enabled)
            // @ts-expect-error
            if (data.follow_up_template !== undefined && data.follow_up_template !== null)
              setTemplate(data.follow_up_template)
          }
        })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setIsLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({
        // @ts-expect-error - new columns
        follow_up_enabled: enabled,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Erro ao salvar automações', { duration: 4000 })
    } else {
      toast.success('Automações salvas com sucesso!', { duration: 3000 })
    }
    setIsLoading(false)
  }

  return (
    <Card className="shadow-sm border-slate-200 transition-all duration-300 hover:shadow-md">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 text-green-600 rounded-lg">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Automações</CardTitle>
            <CardDescription>Configure respostas e lembretes automáticos.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="max-w-2xl space-y-6">
        <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm bg-slate-50/50">
          <div className="space-y-0.5">
            <Label className="text-base font-medium">Follow-up de 3 dias</Label>
            <p className="text-sm text-muted-foreground pr-4">
              Envia uma mensagem automática no WhatsApp para leads sem interação há mais de 72
              horas.
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <div className="space-y-3 bg-white p-4 rounded-lg border shadow-sm">
          <Label className="text-sm font-medium">Template da Mensagem (Somente Leitura)</Label>
          <Textarea
            value={template}
            readOnly
            className="min-h-[100px] bg-slate-50 text-slate-600 resize-none cursor-not-allowed border-slate-200"
          />
          <p className="text-xs text-muted-foreground bg-blue-50 text-blue-700 p-2 rounded-md">
            A tag <strong className="font-semibold">[Name]</strong> será substituída automaticamente
            pelo nome do lead.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full sm:w-auto transition-all duration-300"
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardContent>
    </Card>
  )
}
