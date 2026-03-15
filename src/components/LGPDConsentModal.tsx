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
    }
  }

  const handleDecline = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Termos de Privacidade e LGPD</DialogTitle>
          <DialogDescription>
            Para continuar usando o ClinicFlow, precisamos que você concorde com nossa Política de
            Privacidade e o tratamento de seus dados de acordo com a LGPD.
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-slate-600 mb-4">
          Nós criptografamos os dados sensíveis dos seus pacientes (e-mail, telefone) e registramos
          ações críticas no sistema para fins de auditoria, garantindo a total conformidade com a
          Lei Geral de Proteção de Dados.
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={handleDecline}>
            Recusar
          </Button>
          <Button onClick={handleAccept}>Aceitar Termos</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
