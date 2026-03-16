import { useState } from 'react'
import { useLeadNotes } from '@/hooks/use-lead-notes'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Trash2, User } from 'lucide-react'

export function LeadNotesTab({ leadId }: { leadId: string }) {
  const { notes, loading, addNote, deleteNote } = useLeadNotes(leadId)
  const [content, setContent] = useState('')

  const handleAdd = async () => {
    if (!content.trim()) return
    await addNote(content)
    setContent('')
  }

  return (
    <div className="flex flex-col h-full space-y-6 pt-4 pb-6">
      <div className="flex flex-col gap-2">
        <Textarea
          placeholder="Adicione uma nota sobre este lead..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[80px] resize-none text-sm bg-muted/50 border-border"
        />
        <Button
          size="sm"
          className="self-end"
          onClick={handleAdd}
          disabled={!content.trim() || loading}
        >
          <Send className="h-3.5 w-3.5 mr-2" />
          Salvar Nota
        </Button>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-4">
          {notes.length === 0 && !loading && (
            <p className="text-sm text-muted-foreground/70 italic text-center py-4">
              Nenhuma nota registrada.
            </p>
          )}
          {notes.map((note) => (
            <div
              key={note.id}
              className="relative bg-card border border-border rounded-lg p-4 shadow-sm group"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                  <User className="w-3.5 h-3.5" />
                  {note.profiles?.full_name || 'Usuário'}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-muted-foreground/70">
                    {new Date(note.created_at).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
