import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function LGPDConsentModal() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      const consented = localStorage.getItem(`lgpd_consent_${user.id}`)
      if (!consented) {
        setOpen(true)
      }
    }
  }, [user])

  const handleAccept = () => {
    if (user) {
      localStorage.setItem(`lgpd_consent_${user.id}`, 'true')
      setOpen(false)
      toast.success('Termos de LGPD aceitos.', { position: 'bottom-center' })
    }
  }

  const handleDecline = () => {
    setOpen(false)
    toast.error('Você recusou os termos. Funcionalidades podem ser limitadas.')
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[425px] transition-all duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] w-[90vw] p-5 sm:p-6"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">Termos de Privacidade e LGPD</DialogTitle>
          <DialogDescription className="text-[15px] pt-2">
            Para continuar usando o ClinicFlow, precisamos que você concorde com nossa Política de
            Privacidade e o tratamento de seus dados de acordo com a LGPD.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground mb-2 p-4 bg-muted/50 rounded-xl border border-border leading-relaxed mt-2">
          Nós criptografamos os dados sensíveis dos seus pacientes (e-mail, telefone) e registramos
          ações críticas no sistema para fins de auditoria, garantindo a total conformidade com a
          Lei Geral de Proteção de Dados.
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-3 mt-4 w-full border-t border-border pt-4">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="w-full sm:w-auto h-12 sm:h-10 rounded-xl font-medium"
          >
            Recusar
          </Button>
          <Button
            onClick={handleAccept}
            className="w-full sm:w-auto h-12 sm:h-10 rounded-xl font-medium"
          >
            Aceitar Termos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
