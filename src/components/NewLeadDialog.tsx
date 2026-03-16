import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import useLeadStore from '@/stores/useLeadStore'

const leadSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres.'),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{10,15}$/, 'Formato de telefone inválido. Ex: (11) 99999-9999'),
  email: z.string().email('E-mail inválido.').or(z.literal('')),
  origin: z.string().min(1, 'Selecione uma origem.'),
  lgpd_consent: z.boolean().default(false),
})

type LeadFormValues = z.infer<typeof leadSchema>

export function NewLeadDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { addLead, origins } = useLeadStore()
  const [loading, setLoading] = useState(false)

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      origin: '',
      lgpd_consent: false,
    },
  })

  const onSubmit = async (data: LeadFormValues) => {
    setLoading(true)
    try {
      await addLead({
        user_id: '',
        name: data.name,
        phone: data.phone,
        email: data.email,
        origin: data.origin,
        stage: 'novo_contato', // Note: this will be mapped to the first column if missing
        contact_date: new Date().toISOString().split('T')[0],
        lgpd_consent: data.lgpd_consent,
      })
      onOpenChange(false)
      form.reset()
    } catch (err) {
      // Error is handled in the store by showing toast
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) form.reset()
    onOpenChange(isOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[450px] transition-all duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 w-[95vw] p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Adicionar Novo Lead</DialogTitle>
          <DialogDescription>
            Insira os dados do paciente. Certifique-se de obter o consentimento LGPD.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Paciente</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ex: João da Silva"
                      className="h-11 sm:h-10 transition-all duration-300 ease-in-out focus-visible:ring-primary/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="animate-in fade-in slide-in-from-top-1" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp / Telefone</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="(11) 99999-9999"
                        className="h-11 sm:h-10 transition-all duration-300 ease-in-out focus-visible:ring-primary/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="animate-in fade-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="joao@email.com"
                        type="email"
                        className="h-11 sm:h-10 transition-all duration-300 ease-in-out focus-visible:ring-primary/50"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="animate-in fade-in slide-in-from-top-1" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origem do Lead</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-11 sm:h-10 transition-all duration-300 ease-in-out focus-visible:ring-primary/50">
                        <SelectValue placeholder="Selecione a origem" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {origins.map((o) => (
                        <SelectItem key={o.id} value={o.name}>
                          {o.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className="animate-in fade-in slide-in-from-top-1" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lgpd_consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-xl border border-slate-200 bg-slate-50/50 p-4 mt-2 hover:bg-slate-50 transition-all duration-300 ease-in-out cursor-pointer">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-0.5 h-5 w-5 sm:h-4 sm:w-4"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none flex-1 cursor-pointer">
                    <FormLabel className="text-[14px] sm:text-sm font-medium cursor-pointer">
                      Consentimento LGPD
                    </FormLabel>
                    <FormDescription className="text-xs">
                      O paciente forneceu consentimento para o tratamento e armazenamento de seus
                      dados pessoais.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter className="mt-6 pt-4 border-t border-slate-100 gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="h-11 sm:h-10 w-full sm:w-auto rounded-xl sm:rounded-md transition-all duration-300 ease-in-out hover:bg-slate-100"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
                className="h-11 sm:h-10 w-full sm:w-auto rounded-xl sm:rounded-md transition-all duration-300 ease-in-out"
              >
                {loading ? 'Salvando...' : 'Salvar Lead'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
