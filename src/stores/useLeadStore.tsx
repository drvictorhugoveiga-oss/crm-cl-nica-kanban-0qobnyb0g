import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { Lead, LeadStage, LeadOrigin } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/services/audit'
import { toast } from 'sonner'
import { fetchWithRetry } from '@/lib/fetch-with-retry'

interface LeadStore {
  leads: Lead[]
  origins: LeadOrigin[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  sourceFilter: string
  setSourceFilter: (source: string) => void
  fetchLeads: () => Promise<void>
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateLeadStage: (id: string, newStage: LeadStage) => Promise<void>
  deleteLead: (id: string) => Promise<void>
  isLoading: boolean
}

const LeadContext = createContext<LeadStore | undefined>(undefined)

const mapRowToLead = (row: any): Lead & { value?: number; cost?: number } => ({
  id: row.id,
  user_id: row.user_id || '',
  name: row.name,
  phone: row.phone || '',
  email: row.email || '',
  contact_date: row.created_at,
  origin: row.source,
  stage: row.status as LeadStage,
  created_at: row.created_at,
  updated_at: row.created_at,
  lgpd_consent: row.lgpd_consent,
  value: row.value,
  cost: row.cost,
})

export function LeadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [origins, setOrigins] = useState<LeadOrigin[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchLeads = useCallback(async () => {
    if (!user?.id) return

    if (abortControllerRef.current) {
      abortControllerRef.current.abort('New request initiated')
    }
    const controller = new AbortController()
    abortControllerRef.current = controller
    const signal = controller.signal

    const CACHE_KEY = `crm_leads_${user.id}`
    let hasCache = false

    const cachedStr = localStorage.getItem(CACHE_KEY)
    if (cachedStr) {
      try {
        const parsed = JSON.parse(cachedStr)
        if (Array.isArray(parsed)) {
          setLeads((prev) => (prev.length === 0 ? parsed : prev))
          hasCache = true
        }
      } catch (e) {
        // ignore cache parse error
      }
    }

    if (!hasCache) setIsLoading(true)

    try {
      const queryFn = async () => {
        const q = supabase
          .from('leads')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (signal) q.abortSignal(signal)
        return await q
      }

      const { data, error } = await fetchWithRetry(queryFn, 3, 1000, signal)
      if (signal.aborted) return

      if (error) {
        const name = error.name?.toLowerCase() || ''
        const msg = error.message?.toLowerCase() || ''
        const isAbortError =
          name === 'aborterror' ||
          msg.includes('aborted') ||
          msg.includes('abort') ||
          msg.includes('http n/a')

        if (!isAbortError) {
          toast.error('Erro ao carregar leads: ' + (error.message || 'Erro desconhecido'), {
            duration: 4000,
          })
        }
        return
      }

      if (data) {
        try {
          const { data: decryptedData, error: decryptError } = await supabase.functions.invoke(
            'lgpd-encryption-handler',
            {
              body: { action: 'decrypt', items: data },
            },
          )
          if (signal.aborted) return

          if (decryptError) {
            const msg = decryptError.message?.toLowerCase() || ''
            if (!msg.includes('abort') && decryptError.name !== 'AbortError') {
              console.error('Decryption error:', decryptError)
            }
          }

          const parsedLeads = (decryptedData?.result || data).map(mapRowToLead)
          setLeads(parsedLeads)
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(parsedLeads))
          } catch (e) {
            /* ignore */
          }
        } catch (invokeErr: any) {
          if (signal.aborted) return
          const msg = invokeErr?.message?.toLowerCase() || ''
          if (invokeErr?.name === 'AbortError' || msg.includes('abort')) {
            return
          }
          console.error('Decryption invoke failed:', invokeErr)
          const parsedLeads = data.map(mapRowToLead)
          setLeads(parsedLeads)
        }
      }

      if (!signal.aborted) {
        setOrigins([
          { id: '1', name: 'Google Ads', description: 'Google Ads' },
          { id: '2', name: 'Indicação', description: 'Referred' },
          { id: '3', name: 'Redes Sociais', description: 'Social' },
          { id: '4', name: 'Visita Presencial', description: 'Walk-ins' },
          { id: '5', name: 'WhatsApp', description: 'WhatsApp' },
        ])
      }
    } catch (err: any) {
      if (signal.aborted) return
      const msg = err?.message?.toLowerCase() || ''
      if (err?.name === 'AbortError' || msg.includes('abort') || msg.includes('http n/a')) {
        return
      }
      console.error('Unhandled error in fetchLeads:', err)
    } finally {
      if (!signal.aborted) setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user?.id) {
      fetchLeads()
    } else {
      setLeads([])
      setOrigins([])
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted')
      }
    }
  }, [user, fetchLeads])

  const addLead = async (newLead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user?.id) return
    const rowToInsert = {
      name: newLead.name,
      email: newLead.email,
      phone: newLead.phone,
      source: newLead.origin,
      status: newLead.stage,
      lgpd_consent: newLead.lgpd_consent || false,
      user_id: user.id,
    }
    const { data: encryptedData } = await supabase.functions.invoke('lgpd-encryption-handler', {
      body: { action: 'encrypt', items: [rowToInsert] },
    })
    const { data, error } = await supabase
      .from('leads')
      .insert(encryptedData?.result?.[0] || rowToInsert)
      .select()
      .single()

    if (error) {
      toast.error('Erro ao adicionar lead', { duration: 4000 })
      throw error
    }

    if (data) {
      const inserted = {
        ...newLead,
        id: data.id,
        created_at: data.created_at,
        updated_at: data.created_at,
      }
      const newLeads = [inserted, ...leads]
      setLeads(newLeads)
      try {
        localStorage.setItem(`crm_leads_${user.id}`, JSON.stringify(newLeads))
      } catch (e) {
        /* ignore */
      }
      toast.success('Lead adicionado com sucesso!', { duration: 3000 })
      await logAudit(user.id, 'Created Lead', { lead_id: data.id, source: newLead.origin })
    }
  }

  const updateLeadStage = async (id: string, newStage: LeadStage) => {
    if (!user?.id) return

    const leadToUpdate = leads.find((l) => l.id === id)
    if (!leadToUpdate || leadToUpdate.stage === newStage) return

    const prevLeads = [...leads]
    const newLeads = prevLeads.map((l) =>
      l.id === id ? { ...l, stage: newStage, updated_at: new Date().toISOString() } : l,
    )

    // Optimistically update UI
    setLeads(newLeads)
    try {
      localStorage.setItem(`crm_leads_${user.id}`, JSON.stringify(newLeads))
    } catch (e) {
      /* ignore */
    }

    const { error } = await supabase
      .from('leads')
      .update({ status: newStage })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      // Revert optimistic update
      setLeads(prevLeads)
      try {
        localStorage.setItem(`crm_leads_${user.id}`, JSON.stringify(prevLeads))
      } catch (e) {
        /* ignore */
      }
      toast.error('Erro ao atualizar status do lead', { duration: 4000 })
      return
    }

    toast.success('Status atualizado com sucesso!', { duration: 2500, position: 'bottom-right' })
    await logAudit(user.id, 'Updated Lead Stage', { lead_id: id, new_stage: newStage })
  }

  const deleteLead = async (id: string) => {
    if (!user?.id) return

    const prevLeads = [...leads]
    const newLeads = prevLeads.filter((l) => l.id !== id)

    // Optimistically update UI
    setLeads(newLeads)
    try {
      localStorage.setItem(`crm_leads_${user.id}`, JSON.stringify(newLeads))
    } catch (e) {
      /* ignore */
    }

    const { error } = await supabase.from('leads').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
      // Revert optimistic update
      setLeads(prevLeads)
      try {
        localStorage.setItem(`crm_leads_${user.id}`, JSON.stringify(prevLeads))
      } catch (e) {
        /* ignore */
      }
      toast.error('Erro ao excluir lead', { duration: 4000 })
      return
    }

    toast.success('Lead excluído com sucesso!', { duration: 3000 })
    await logAudit(user.id, 'Deleted Lead', { lead_id: id })
  }

  const value = React.useMemo(
    () => ({
      leads,
      origins,
      searchQuery,
      setSearchQuery,
      sourceFilter,
      setSourceFilter,
      fetchLeads,
      addLead,
      updateLeadStage,
      deleteLead,
      isLoading,
    }),
    [leads, origins, searchQuery, sourceFilter, fetchLeads, isLoading],
  )
  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>
}

export default function useLeadStore() {
  const context = useContext(LeadContext)
  if (!context) throw new Error('useLeadStore must be used within LeadProvider')
  return context
}
