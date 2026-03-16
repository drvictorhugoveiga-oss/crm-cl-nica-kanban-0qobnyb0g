import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { User } from 'lucide-react'

export function ProfileSettings() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (data?.full_name) setFullName(data.full_name)
          else setFullName(user.user_metadata?.name || '')
        })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setIsLoading(true)
    const { error } = await supabase.from('profiles').upsert({ id: user.id, full_name: fullName })
    if (error) {
      toast.error('Erro ao salvar perfil')
    } else {
      toast.success('Perfil salvo com sucesso')
    }
    setIsLoading(false)
  }

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Dados do Perfil</CardTitle>
            <CardDescription>Atualize suas informações pessoais.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 max-w-md">
        <div className="space-y-2">
          <Label>Nome Completo</Label>
          <Input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome"
            className="bg-slate-50 focus-visible:ring-primary/50"
          />
        </div>
        <div className="space-y-2">
          <Label>
            Email <span className="text-xs text-slate-400 font-normal ml-2">(Somente leitura)</span>
          </Label>
          <Input
            value={user?.email || ''}
            disabled
            className="bg-slate-100 text-slate-500 cursor-not-allowed"
          />
        </div>
        <Button
          onClick={handleSave}
          disabled={isLoading || !fullName.trim()}
          className="w-full sm:w-auto"
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </CardContent>
    </Card>
  )
}
