import { MessageCircle, QrCode, Power, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import useWhatsAppStore from '@/stores/useWhatsAppStore'

export function WhatsAppConnectionScreen() {
  const { connectionStatus, qrCode, startConnection } = useWhatsAppStore()

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative p-6 h-full bg-muted/30 dark:bg-background">
      <div className="absolute inset-0 opacity-40 dark:opacity-10 bg-[url('https://img.usecurling.com/p/800/800?q=pattern&color=gray')] pointer-events-none mix-blend-multiply dark:mix-blend-screen" />

      <div className="relative z-10 bg-card/90 backdrop-blur-md p-8 rounded-3xl shadow-sm text-center max-w-md border border-border/60 w-full animate-fade-in-up">
        {connectionStatus === 'connecting' ? (
          <div className="flex flex-col items-center py-8">
            <RefreshCw className="h-12 w-12 text-[#25D366] animate-spin mb-6" />
            <h2 className="text-xl font-bold text-foreground mb-2">Conectando...</h2>
            <p className="text-muted-foreground">Gerando código QR para o seu WhatsApp.</p>
          </div>
        ) : connectionStatus === 'qr' && qrCode ? (
          <div className="flex flex-col items-center">
            <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_4px_14px_-4px_rgba(37,211,102,0.4)] border border-border/50">
              <QrCode className="h-8 w-8 text-[#25D366]" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Escaneie o QR Code</h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e aponte a câmera para a
              tela.
            </p>

            <div className="bg-white p-4 rounded-2xl shadow-sm border border-border/50 mb-6 flex justify-center w-full">
              {/* Ensure base64 is properly formatted for src, Evolution API might return it with or without the prefix */}
              <img
                src={qrCode.startsWith('data:image') ? qrCode : `data:image/png;base64,${qrCode}`}
                alt="WhatsApp QR Code"
                className="w-56 h-56 object-contain"
              />
            </div>

            <Button
              variant="outline"
              onClick={startConnection}
              className="w-full gap-2 rounded-full h-11"
            >
              <RefreshCw className="w-4 h-4" />
              Gerar Novo Código
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center py-4">
            <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_4px_14px_-4px_rgba(37,211,102,0.4)] dark:shadow-none border border-border/50">
              <MessageCircle className="h-10 w-10 text-[#25D366]" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-3">WhatsApp Oficial</h2>
            <p className="text-muted-foreground leading-relaxed mb-6 text-sm">
              Integre sua conta do WhatsApp ao ClinicFlow via Evolution API. As mensagens serão
              sincronizadas automaticamente em tempo real.
            </p>

            {connectionStatus === 'disconnected' && (
              <Alert
                variant="destructive"
                className="mb-6 text-left border-destructive/20 bg-destructive/5"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Desconectado</AlertTitle>
                <AlertDescription>
                  A sessão expirou ou foi desconectada. Por favor, conecte novamente.
                </AlertDescription>
              </Alert>
            )}

            <Button
              onClick={startConnection}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 rounded-full h-12 shadow-md hover:shadow-lg transition-all"
            >
              <Power className="w-5 h-5" />
              Iniciar Conexão
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
