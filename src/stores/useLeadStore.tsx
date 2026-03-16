import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { Lead, LeadStage, LeadOrigin, SavedFilter } from '@/types'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { logAudit } from '@/services/audit'
import { toast } from '@/hooks/use-toast'
import { fetchWithRetry } from '@/lib/fetch-with-retry'

export type DateRange = { from?: Date; to?: Date }

interface LeadStore {
  leads: Lead[]
  origins: LeadOrigin[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  sourceFilter: string
  setSourceFilter: (source: string) => void
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
  selectedStages: string[]
  setSelectedStages: (stages: string[]) => void
  clearFilters: () => void
  fetchLeads: () => Promise<void>
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateLeadStage: (id: string, newStage: LeadStage) => Promise<void>
  deleteLead: (id: string) => Promise<void>
  isLoading: boolean
  savedFilters: SavedFilter[]
  fetchSavedFilters: () => Promise<void>
  saveCurrentFilter: (name: string) => Promise<void>
  deleteSavedFilter: (id: string) => Promise<void>
  applySavedFilter: (filters: any) => void
  getFilteredLeads: () => Lead[]
}

const LeadContext = createContext<LeadStore | undefined>(undefined)

const mapRowToLead = (row: any): Lead & { value?: number; cost?: number } => {
  let stage = row.status as LeadStage
  // Map old default statuses to proper UI formatting for backward compatibility
  if (stage === 'novo_contato') stage = 'Novo Contato'
  if (stage === 'agendado') stage = 'Agendado'
  if (stage === 'em_atendimento') stage = 'Em Atendimento'
  if (stage === 'convertido') stage = 'Convertido'
  if (stage === 'perdido') stage = 'Perdido'

  return {
    id: row.id,
    user_id: row.user_id || '',
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    contact_date: row.created_at,
    origin: row.source,
    stage,
    created_at: row.created_at,
    updated_at: row.created_at,
    lgpd_consent: row.lgpd_consent,
    value: row.value,
    cost: row.cost,
  }
}

export function LeadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [origins, setOrigins] = useState<LeadOrigin[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setSourceFilter('all')
    setSelectedStages([])
    setDateRange(undefined)
    toast({ description: 'Filtros limpos.' })
  }, [])

  const fetchSavedFilters = useCallback(async () => {
    if (!user?.id) return
    const { data, error } = await supabase
      .from('saved_filters')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (!error && data) {
      setSavedFilters(data)
    }
  }, [user])

  const saveCurrentFilter = async (name: string) => {
    if (!user?.id) return
    const filters = {
      searchQuery,
      sourceFilter,
      selectedStages,
      dateRange: dateRange
        ? {
            from: dateRange.from?.toISOString(),
            to: dateRange.to?.toISOString(),
          }
        : undefined,
    }
    const { data, error } = await supabase
      .from('saved_filters')
      .insert({
        user_id: user.id,
        name,
        filters,
      })
      .select()
      .single()

    if (error) {
      toast({ title: 'Erro', description: 'Erro ao salvar filtro.', variant: 'destructive' })
    } else if (data) {
      setSavedFilters((prev) => [data, ...prev])
      toast({ title: 'Sucesso', description: 'Filtro salvo com sucesso!' })
    }
  }

  const deleteSavedFilter = async (id: string) => {
    if (!user?.id) return
    const { error } = await supabase.from('saved_filters').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Erro ao excluir filtro.', variant: 'destructive' })
    } else {
      setSavedFilters((prev) => prev.filter((f) => f.id !== id))
      toast({ description: 'Filtro excluído.' })
    }
  }

  const applySavedFilter = (filters: any) => {
    setSearchQuery(filters.searchQuery || '')
    setSourceFilter(filters.sourceFilter || 'all')
    setSelectedStages(filters.selectedStages || [])
    if (filters.dateRange) {
      setDateRange({
        from: filters.dateRange.from ? new Date(filters.dateRange.from) : undefined,
        to: filters.dateRange.to ? new Date(filters.dateRange.to) : undefined,
      })
    } else {
      setDateRange(undefined)
    }
    toast({ description: 'Filtro aplicado.' })
  }

  const getFilteredLeads = useCallback(() => {
    return leads.filter((lead) => {
      if (selectedStages.length > 0 && !selectedStages.includes(lead.stage)) return false

      const query = searchQuery.toLowerCase()
      const matchesSearch =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        (lead.phone && lead.phone.includes(query)) ||
        (lead.email && lead.email.toLowerCase().includes(query))

      const matchesSource = sourceFilter === 'all' || lead.origin === sourceFilter

      let matchesDate = true
      if (dateRange?.from) {
        const leadDate = new Date(lead.created_at)
        const from = new Date(dateRange.from)
        from.setHours(0, 0, 0, 0)

        if (leadDate < from) {
          matchesDate = false
        } else if (dateRange.to) {
          const to = new Date(dateRange.to)
          to.setHours(23, 59, 59, 999)
          if (leadDate > to) {
            matchesDate = false
          }
        }
      }

      return matchesSearch && matchesSource && matchesDate
    })
  }, [leads, selectedStages, searchQuery, sourceFilter, dateRange])

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
          toast({
            title: 'Erro',
            description: 'Erro ao carregar leads: ' + (error.message || 'Erro desconhecido'),
            variant: 'destructive',
          })
        }
        return
      }

      if (data) {
        try {
          const res = await supabase.functions.invoke('lgpd-encryption-handler', {
            body: { action: 'decrypt', items: data },
          })
          if (signal.aborted) return

          if (res.error) {
            const msg = res.error.message?.toLowerCase() || ''
            if (!msg.includes('abort') && res.error.name !== 'AbortError') {
              console.warn('Decryption invoke error:', res.error)
              toast({
                title: 'Aviso de Segurança',
                description:
                  'Serviço de criptografia indisponível ou inacessível. Os dados de contato podem estar ofuscados.',
                variant: 'destructive',
              })
            }
          }

          const parsedLeads = (res.data?.result || data).map(mapRowToLead)
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
          console.warn('Decryption invoke failed globally:', invokeErr)
          toast({
            title: 'Aviso de Segurança',
            description: 'Não foi possível conectar ao serviço de criptografia (LGPD).',
            variant: 'destructive',
          })
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
      fetchSavedFilters()
    } else {
      setLeads([])
      setOrigins([])
      setSavedFilters([])
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted')
      }
    }
  }, [user, fetchLeads, fetchSavedFilters])

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

    let payloadToInsert = rowToInsert

    try {
      const res = await supabase.functions.invoke('lgpd-encryption-handler', {
        body: { action: 'encrypt', items: [rowToInsert] },
      })

      if (res.error) {
        console.error('Encryption function error:', res.error)
        toast({
          title: 'Erro de Segurança (LGPD)',
          description: 'Falha ao criptografar os dados do paciente. Ação bloqueada.',
          variant: 'destructive',
        })
        throw new Error('Encryption failed. Refusing to insert raw PII data.')
      }

      if (!res.data?.result || !res.data.result[0]) {
        toast({
          title: 'Erro de Segurança',
          description: 'A resposta do serviço de criptografia foi inválida.',
          variant: 'destructive',
        })
        throw new Error('Invalid encryption response.')
      }

      payloadToInsert = res.data.result[0]
    } catch (err) {
      console.error('Error in encryption pipeline:', err)
      throw err // Stop execution, do not save unencrypted data
    }

    const { data, error } = await supabase.from('leads').insert(payloadToInsert).select().single()

    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar lead ao banco de dados',
        variant: 'destructive',
      })
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
      toast({ title: 'Sucesso', description: 'Novo lead criado com sucesso e criptografado!' })
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
      setLeads(prevLeads)
      try {
        localStorage.setItem(`crm_leads_${user.id}`, JSON.stringify(prevLeads))
      } catch (e) {
        /* ignore */
      }
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar status do lead. Alterações revertidas.',
        variant: 'destructive',
      })
      return
    }

    toast({ description: `Lead movido para ${newStage}` })
    await logAudit(user.id, 'Updated Lead Stage', { lead_id: id, new_stage: newStage })
  }

  const deleteLead = async (id: string) => {
    if (!user?.id) return

    const prevLeads = [...leads]
    const newLeads = prevLeads.filter((l) => l.id !== id)

    setLeads(newLeads)
    try {
      localStorage.setItem(`crm_leads_${user.id}`, JSON.stringify(newLeads))
    } catch (e) {
      /* ignore */
    }

    const { error } = await supabase.from('leads').delete().eq('id', id).eq('user_id', user.id)

    if (error) {
      setLeads(prevLeads)
      try {
        localStorage.setItem(`crm_leads_${user.id}`, JSON.stringify(prevLeads))
      } catch (e) {
        /* ignore */
      }
      toast({ title: 'Erro', description: 'Erro ao excluir lead', variant: 'destructive' })
      return
    }

    toast({ title: 'Sucesso', description: 'Lead excluído com sucesso!' })
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
      dateRange,
      setDateRange,
      selectedStages,
      setSelectedStages,
      clearFilters,
      fetchLeads,
      addLead,
      updateLeadStage,
      deleteLead,
      isLoading,
      savedFilters,
      fetchSavedFilters,
      saveCurrentFilter,
      deleteSavedFilter,
      applySavedFilter,
      getFilteredLeads,
    }),
    [
      leads,
      origins,
      searchQuery,
      sourceFilter,
      dateRange,
      selectedStages,
      clearFilters,
      fetchLeads,
      isLoading,
      savedFilters,
      fetchSavedFilters,
      getFilteredLeads,
    ],
  )
  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>
}

export default function useLeadStore() {
  const context = useContext(LeadContext)
  if (!context) throw new Error('useLeadStore must be used within LeadProvider')
  return context
}
