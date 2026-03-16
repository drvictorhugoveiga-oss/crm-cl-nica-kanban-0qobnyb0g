import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { Task } from '@/types'

export function useLeadTasks(leadId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const fetchTasks = useCallback(async () => {
    if (!leadId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar tarefas.', variant: 'destructive' })
    } else {
      setTasks(data as Task[])
    }
    setLoading(false)
  }, [leadId])

  useEffect(() => {
    fetchTasks()
    if (!leadId) return
    const channel = supabase
      .channel(`tasks_${leadId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `lead_id=eq.${leadId}` },
        () => {
          fetchTasks()
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchTasks, leadId])

  const addTask = async (title: string, description: string, dueDate: Date | undefined) => {
    if (!leadId || !user?.id || !title.trim()) return
    const { error } = await supabase.from('tasks').insert({
      lead_id: leadId,
      title: title.trim(),
      description: description.trim(),
      due_date: dueDate ? dueDate.toISOString() : null,
      assigned_to: user.id,
      status: 'pending',
    })

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao criar tarefa.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Tarefa criada com sucesso!' })
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao atualizar tarefa.', variant: 'destructive' })
    }
  }

  return { tasks, loading, addTask, toggleStatus }
}
