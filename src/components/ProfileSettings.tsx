import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const profileSchema = z.object({
  fullName: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
})

export function ProfileSettings() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    mode: 'onChange',
    defaultValues: { fullName: '' },
  })

  useEffect(() => {
    if (user) {
      supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          form.reset({
            fullName: data?.full_name || user.user_metadata?.name || '',
          })
        })
    }
  }, [user, form])

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return
    setIsLoading(true)
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: values.fullName })
    if (error) {
      toast.error('Erro ao salvar perfil', { duration: 4000 })
    } else {
      toast.success('Perfil salvo com sucesso!', { duration: 3000 })
    }
    setIsLoading(false)
  }

  return (
    <Card className="shadow-sm border-slate-200 transition-all duration-300 hover:shadow-md">
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
      <CardContent className="max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome"
                      className="h-11 sm:h-10 bg-slate-50 focus-visible:ring-primary/50 transition-all duration-300 ease-in-out"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="animate-in fade-in slide-in-from-top-1" />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <Label>
                Email{' '}
                <span className="text-xs text-slate-400 font-normal ml-2">(Somente leitura)</span>
              </Label>
              <Input
                value={user?.email || ''}
                disabled
                className="h-11 sm:h-10 bg-slate-100 text-slate-500 cursor-not-allowed transition-all duration-300 ease-in-out"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading || !form.formState.isValid}
              className="w-full sm:w-auto h-11 sm:h-10 transition-all duration-300 ease-in-out"
            >
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
