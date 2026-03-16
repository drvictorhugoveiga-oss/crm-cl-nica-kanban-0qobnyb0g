import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, ExternalLink } from 'lucide-react'

export default function WhatsApp() {
  return (
    <div className="h-full w-full overflow-y-auto bg-background p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-3">
            <div className="p-2 bg-[#25D366]/10 rounded-xl shrink-0">
              <MessageSquare className="h-6 w-6 text-[#25D366]" />
            </div>
            Integração WhatsApp
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Conecte sua conta do WhatsApp para gerenciar comunicações diretamente com seus leads.
          </p>
        </div>

        <div className="flex flex-col items-center justify-center mt-12 w-full">
          <Card className="w-full max-w-md shadow-sm border-border animate-in zoom-in-95 duration-500">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto bg-muted p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-muted-foreground" />
              </div>
              <CardTitle className="text-xl">Conectar WhatsApp</CardTitle>
              <CardDescription className="text-base mt-2 leading-relaxed">
                Para sincronizar suas mensagens, clique no botão abaixo para abrir o WhatsApp Web e
                escaneie o código QR usando o seu celular.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8 pt-4">
              <Button
                asChild
                className="bg-[#25D366] hover:bg-[#128C7E] text-white gap-2 h-12 px-8 rounded-full shadow-md hover:shadow-lg transition-all w-full sm:w-auto text-base font-medium"
              >
                <a href="https://web.whatsapp.com" target="_blank" rel="noopener noreferrer">
                  Conectar <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
