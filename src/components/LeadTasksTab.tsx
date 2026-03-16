import { useState } from 'react'
import { useLeadTasks } from '@/hooks/use-lead-tasks'
import { Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CalendarIcon, Clock, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function LeadTasksTab({ leadId }: { leadId: string }) {
  const { tasks, loading, addTask, toggleStatus } = useLeadTasks(leadId)
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [date, setDate] = useState<Date>()

  const handleAdd = async () => {
    if (!title.trim()) return
    await addTask(title, desc, date)
    setTitle('')
    setDesc('')
    setDate(undefined)
  }

  const getTaskColor = (task: Task) => {
    if (task.status === 'completed') return 'bg-emerald-50/60 border-emerald-200'
    if (!task.due_date) return 'bg-slate-50 border-slate-100'

    const now = new Date()
    const due = new Date(task.due_date)
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (diffHours < 0) return 'bg-rose-50/60 border-rose-200'
    if (diffHours <= 24) return 'bg-amber-50/60 border-amber-200'
    return 'bg-slate-50 border-slate-100'
  }

  return (
    <div className="flex flex-col h-full space-y-6 pt-4 pb-6">
      <div className="space-y-3 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título da tarefa..."
          className="bg-white"
        />
        <Textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Descrição (opcional)"
          className="min-h-[60px] bg-white resize-none"
        />
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'flex-1 justify-start font-normal bg-white',
                  !date && 'text-slate-500',
                )}
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {date ? date.toLocaleDateString('pt-BR') : 'Data de vencimento'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={date} onSelect={setDate} />
            </PopoverContent>
          </Popover>
          <Button onClick={handleAdd} disabled={!title.trim() || loading}>
            <Plus className="w-4 h-4 mr-1.5" /> Adicionar
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-3">
          {tasks.length === 0 && !loading && (
            <p className="text-sm text-slate-400 italic text-center py-4">
              Nenhuma tarefa registrada.
            </p>
          )}
          {tasks.map((t) => (
            <div
              key={t.id}
              className={cn('p-3.5 rounded-lg border shadow-sm transition-colors', getTaskColor(t))}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={t.status === 'completed'}
                  onCheckedChange={() => toggleStatus(t.id, t.status)}
                  className="mt-0.5"
                />
                <div className="flex-1 space-y-1">
                  <p
                    className={cn(
                      'text-sm font-semibold text-slate-800',
                      t.status === 'completed' && 'line-through text-slate-500',
                    )}
                  >
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{t.description}</p>
                  )}
                  {t.due_date && (
                    <div className="flex items-center text-[11px] font-medium text-slate-500 mt-2">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Vence em:{' '}
                      {new Date(t.due_date).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
