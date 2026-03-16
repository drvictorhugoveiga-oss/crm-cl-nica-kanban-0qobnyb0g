import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
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
  fetchLeads: (signal?: AbortSignal) => Promise<void>
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateLeadStage: (id: string, newStage: LeadStage) => Promise<void>
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

  const fetchLeads = useCallback(
    async (signal?: AbortSignal) => {
      if (!user?.id) return
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
        if (signal?.aborted) return

        if (error) {
          const isAbortError =
            error.name === 'AbortError' ||
            error.message?.includes('Aborted') ||
            error.message?.includes('HTTP N/A')

          if (!isAbortError) {
            toast.error('Erro ao carregar leads: ' + error.message)
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
            if (signal?.aborted) return

            if (decryptError) {
              console.error('Decryption error:', decryptError)
            }

            const parsedLeads = (decryptedData?.result || data).map(mapRowToLead)
            setLeads(parsedLeads)
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(parsedLeads))
            } catch (e) {
              /* ignore */
            }
          } catch (invokeErr: any) {
            if (signal?.aborted || invokeErr.name === 'AbortError') return
            console.error('Decryption invoke failed:', invokeErr)
            const parsedLeads = data.map(mapRowToLead)
            setLeads(parsedLeads)
          }
        }

        setOrigins([
          { id: '1', name: 'Google Ads', description: 'Google Ads' },
          { id: '2', name: 'Indicação', description: 'Referred' },
          { id: '3', name: 'Redes Sociais', description: 'Social' },
          { id: '4', name: 'Visita Presencial', description: 'Walk-ins' },
          { id: '5', name: 'WhatsApp', description: 'WhatsApp' },
        ])
      } catch (err: any) {
        if (
          signal?.aborted ||
          err.name === 'AbortError' ||
          err.message?.includes('Aborted') ||
          err.message?.includes('HTTP N/A')
        ) {
          return
        }
        console.error('Unhandled error in fetchLeads:', err)
      } finally {
        if (!signal?.aborted) setIsLoading(false)
      }
    },
    [user],
  )

  useEffect(() => {
    const controller = new AbortController()
    if (user?.id) fetchLeads(controller.signal)
    else {
      setLeads([])
      setOrigins([])
    }
    return () => controller.abort()
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
    if (error) throw error
    if (data) {
      const inserted = {
        ...newLead,
        id: data.id,
        created_at: data.created_at,
        updated_at: data.created_at,
      }
      setLeads((prev) => [inserted, ...prev])
      toast.success('Lead adicionado com sucesso!')
      await logAudit(user.id, 'Created Lead', { lead_id: data.id, source: newLead.origin })
    }
  }

  const updateLeadStage = async (id: string, newStage: LeadStage) => {
    if (!user?.id) return

    const leadToUpdate = leads.find((l) => l.id === id)
    if (!leadToUpdate || leadToUpdate.stage === newStage) return

    const prevLeads = [...leads]

    setLeads((prev) =>
      prev.map((l) =>
        l.id === id ? { ...l, stage: newStage, updated_at: new Date().toISOString() } : l,
      ),
    )

    const { error } = await supabase
      .from('leads')
      .update({ status: newStage })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      setLeads(prevLeads)
      toast.error('Erro ao atualizar status do lead.')
      return
    }

    toast.success('Status atualizado!', { duration: 2500, position: 'bottom-right' })
    await logAudit(user.id, 'Updated Lead Stage', { lead_id: id, new_stage: newStage })
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
