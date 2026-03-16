import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import { LeadHistoryItem } from '@/types'

export function useLeadHistory(leadId: string | undefined) {
  const [history, setHistory] = useState<LeadHistoryItem[]>([])
  const [loading, setLoading] = useState(false)

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

  return { history, loading, refresh: fetchHistory }
}
