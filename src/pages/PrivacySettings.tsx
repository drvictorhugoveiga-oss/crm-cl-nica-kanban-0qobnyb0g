import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { logAudit } from '@/services/audit'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { ShieldAlert, Trash2 } from 'lucide-react'

export default function PrivacySettings() {
  const { user, signOut } = useAuth()

  const handleDeleteData = async () => {
    if (!user) return

    await logAudit(user.id, 'User Data Deletion Requested', {
      reason: 'Right to be Forgotten',
      user_email: user.email,
    })

    toast.success('Solicitação de exclusão recebida. Seus dados serão removidos.')
    await signOut()
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-background">
      <div className="p-8 max-w-4xl mx-auto animate-fade-in my-4">
        <h1 className="text-3xl font-bold text-foreground mb-2">Configurações de Privacidade</h1>
        <p className="text-muted-foreground mb-8">
          Gerencie seus dados e preferências de privacidade de acordo com a LGPD.
        </p>

        <div className="bg-card rounded-2xl shadow-sm border border-border p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <ShieldAlert className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Seus Dados Pessoais</h2>
              <p className="text-sm text-muted-foreground">
                Informações atualmente vinculadas à sua conta de usuário no ClinicFlow.
              </p>
            </div>
          </div>

          <div className="space-y-4 ml-16 bg-muted/50 p-4 rounded-xl border border-border/50">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome Associado</label>
              <p className="text-foreground font-medium">
                {user?.user_metadata?.name || 'Não informado'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Autenticado</label>
              <p className="text-foreground">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                ID Único da Conta (Identificador do Sistema)
              </label>
              <p className="text-foreground font-mono text-xs bg-card px-2 py-1 rounded inline-block border border-border mt-1">
                {user?.id}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/50 p-8 shadow-sm">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-500 mb-3 flex items-center gap-2">
            Direito ao Esquecimento (Art. 18 LGPD)
          </h2>
          <p className="text-sm text-red-600/90 dark:text-red-400/90 mb-6 leading-relaxed max-w-3xl">
            De acordo com a Lei Geral de Proteção de Dados, você tem o direito de solicitar a
            exclusão permanente de todos os seus dados pessoais armazenados em nossos servidores.
            Esta ação é <strong>irreversível</strong> e resultará na perda total de acesso à sua
            conta, aos pacientes registrados e ao seu histórico.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2 shadow-sm font-medium">
                <Trash2 className="h-4 w-4" /> Solicitar Exclusão Definitiva
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription className="leading-relaxed">
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta, removerá
                  seus dados dos nossos servidores em conformidade com a LGPD e encerrará a sua
                  sessão imediatamente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel>Cancelar Ação</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteData}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-medium"
                >
                  Sim, Excluir Meus Dados
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
