import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Lead } from '@/types'
import { useLeadHistory } from '@/hooks/use-lead-history'
import { useState } from 'react'
import {
  Sparkles,
  ArrowRightLeft,
  MessageSquare,
  StickyNote,
  Send,
  Calendar,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react'

interface LeadDetailsSheetProps {
  lead: Lead
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeadDetailsSheet({ lead, open, onOpenChange }: LeadDetailsSheetProps) {
  const { history, loading, addNote } = useLeadHistory(open ? lead.id : undefined)
  const [note, setNote] = useState('')

  const handleAddNote = async () => {
    if (!note.trim()) return
    await addNote(note)
    setNote('')
  }

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'created':
        return <Sparkles className="h-4 w-4 text-blue-500" />
      case 'moved':
        return <ArrowRightLeft className="h-4 w-4 text-orange-500" />
      case 'message_received':
        return <MessageSquare className="h-4 w-4 text-emerald-500" />
      case 'note_added':
        return <StickyNote className="h-4 w-4 text-purple-500" />
      default:
        return <Sparkles className="h-4 w-4 text-slate-400" />
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full p-0 flex flex-col bg-slate-50/50">
        <div className="p-6 pb-4 bg-white border-b border-slate-100">
          <SheetHeader>
            <SheetTitle className="text-xl text-slate-800">{lead.name}</SheetTitle>
            <SheetDescription className="flex flex-col gap-1 mt-1.5">
              <span className="flex items-center gap-1.5 text-slate-600">
                <Phone className="h-3.5 w-3.5" /> {lead.phone || 'Sem telefone'}
              </span>
              {lead.email && (
                <span className="flex items-center gap-1.5 text-slate-600">
                  <Mail className="h-3.5 w-3.5" /> {lead.email}
                </span>
              )}
            </SheetDescription>
          </SheetHeader>
        </div>

        <Tabs defaultValue="history" className="flex-1 flex flex-col w-full">
          <div className="px-6 pt-4 bg-white">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="details">Detalhes</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent
            value="details"
            className="flex-1 mt-0 h-full p-6 bg-white border-t border-slate-100/50"
          >
            <ScrollArea className="h-[calc(100vh-220px)] pr-4 -mr-4">
              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> Origem
                  </span>
                  <p className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
                    {lead.origin}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <ArrowRightLeft className="h-3.5 w-3.5" /> Estágio Atual
                  </span>
                  <p className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
                    {lead.stage}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> Data de Contato
                  </span>
                  <p className="text-sm font-medium text-slate-700 bg-slate-50 px-3 py-2 rounded-md border border-slate-100">
                    {new Date(lead.contact_date).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent
            value="history"
            className="flex-1 flex flex-col mt-0 h-full px-6 bg-white border-t border-slate-100/50"
          >
            <div className="flex flex-col gap-2 mb-6 pt-6">
              <Textarea
                placeholder="Adicione uma nota sobre este lead..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[80px] resize-none text-sm bg-slate-50/50 border-slate-200"
              />
              <Button
                size="sm"
                className="self-end"
                onClick={handleAddNote}
                disabled={!note.trim() || loading}
              >
                <Send className="h-3.5 w-3.5 mr-2" />
                Salvar Nota
              </Button>
            </div>

            <ScrollArea className="flex-1 -mx-2 px-2 pb-6">
              <div className="relative border-l-2 border-slate-100 ml-4 py-2 space-y-8">
                {loading && history.length === 0 && (
                  <p className="text-sm text-muted-foreground ml-6">Carregando...</p>
                )}

                {history.map((item) => (
                  <div key={item.id} className="relative pl-6">
                    <span className="absolute -left-[17px] top-0.5 bg-white border-2 border-slate-100 p-1.5 rounded-full shadow-sm">
                      {getHistoryIcon(item.action_type)}
                    </span>
                    <div className="flex flex-col gap-1 mt-0.5">
                      <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                        {new Date(item.timestamp).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                      <div className="text-sm text-slate-700 bg-slate-50/80 rounded-lg p-3 border border-slate-100 shadow-sm">
                        {item.action_type === 'created' && (
                          <strong className="font-medium text-slate-900 block mb-1">
                            Lead criado
                          </strong>
                        )}
                        {item.action_type === 'moved' && (
                          <strong className="font-medium text-slate-900 block mb-1">
                            Movido no funil
                          </strong>
                        )}
                        {item.action_type === 'message_received' && (
                          <strong className="font-medium text-slate-900 block mb-1">
                            Mensagem recebida
                          </strong>
                        )}
                        {item.action_type === 'note_added' && (
                          <strong className="font-medium text-slate-900 block mb-1">
                            Nota adicionada
                          </strong>
                        )}
                        <p className="whitespace-pre-wrap leading-relaxed text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {history.length === 0 && !loading && (
                  <p className="text-sm text-slate-400 ml-6 italic">Nenhum histórico registrado.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
