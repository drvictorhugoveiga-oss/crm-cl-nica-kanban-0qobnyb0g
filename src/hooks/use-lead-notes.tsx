import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { Note } from '@/types'

export function useLeadNotes(leadId: string | undefined) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const fetchNotes = useCallback(async () => {
    if (!leadId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('notes')
      .select('*, profiles(full_name)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao carregar notas.', variant: 'destructive' })
    } else {
      setNotes(data as any)
    }
    setLoading(false)
  }, [leadId])

  useEffect(() => {
    fetchNotes()
    if (!leadId) return
    const channel = supabase
      .channel(`notes_${leadId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notes', filter: `lead_id=eq.${leadId}` },
        () => {
          fetchNotes()
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchNotes, leadId])

  const addNote = async (content: string) => {
    if (!leadId || !user?.id || !content.trim()) return
    const { error } = await supabase.from('notes').insert({
      lead_id: leadId,
      content: content.trim(),
      user_id: user.id,
    })

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao adicionar nota.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Nota adicionada com sucesso!' })
    }
  }

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao deletar nota.', variant: 'destructive' })
    } else {
      toast({ title: 'Sucesso', description: 'Nota removida.' })
    }
  }

  return { notes, loading, addNote, deleteNote }
}
