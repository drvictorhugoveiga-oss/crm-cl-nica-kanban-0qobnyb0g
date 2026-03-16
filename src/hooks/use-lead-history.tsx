import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { toast } from '@/hooks/use-toast'
import { LeadHistoryItem } from '@/types'

export function useLeadHistory(leadId: string | undefined) {
  const [history, setHistory] = useState<LeadHistoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const fetchHistory = useCallback(async () => {
    if (!leadId) return
    setLoading(true)
    const { data, error } = await supabase
      .from('lead_history')
      .select('*')
      .eq('lead_id', leadId)
      .order('timestamp', { ascending: false })

    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar histórico.',
        variant: 'destructive',
      })
    } else {
      setHistory(data as LeadHistoryItem[])
    }
    setLoading(false)
  }, [leadId])

  useEffect(() => {
    fetchHistory()

    if (!leadId) return
    // Subscribe to realtime history updates for this specific lead
    const channel = supabase
      .channel(`lead_history_${leadId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'lead_history',
          filter: `lead_id=eq.${leadId}`,
        },
        (payload) => {
          setHistory((prev) => [payload.new as LeadHistoryItem, ...prev])
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchHistory, leadId])

  const addNote = async (content: string) => {
    if (!leadId || !user?.id || !content.trim()) return
    const { error } = await supabase.from('notes').insert({
      lead_id: leadId,
      content: content.trim(),
      user_id: user.id,
    })

    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar nota.',
        variant: 'destructive',
      })
    } else {
      toast({ title: 'Sucesso', description: 'Nota adicionada com sucesso!' })
      // History is updated automatically via DB trigger + Realtime subscription
    }
  }

  return { history, loading, addNote, refresh: fetchHistory }
}
