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

interface LeadStore {
  leads: Lead[]
  origins: LeadOrigin[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  fetchLeads: () => Promise<void>
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateLeadStage: (id: string, newStage: LeadStage) => Promise<void>
  isLoading: boolean
}

const LeadContext = createContext<LeadStore | undefined>(undefined)

const mapRowToLead = (row: any): Lead => ({
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
})

export function LeadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [leads, setLeads] = useState<Lead[]>([])
  const [origins, setOrigins] = useState<LeadOrigin[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchLeads = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (data && !error) {
        const { data: decryptedData } = await supabase.functions.invoke('lgpd-encryption-handler', {
          body: { action: 'decrypt', items: data },
        })
        const rows = decryptedData?.result || data
        setLeads(rows.map(mapRowToLead))
      }

      setOrigins([
        { id: '1', name: 'Google Ads', description: 'Leads from Google Ads campaigns' },
        { id: '2', name: 'Indicação', description: 'Referred by other patients' },
        { id: '3', name: 'Redes Sociais', description: 'From Instagram, Facebook, etc' },
        { id: '4', name: 'Visita Presencial', description: 'Walk-ins' },
        { id: '5', name: 'WhatsApp', description: 'Contato via WhatsApp' },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchLeads()
    } else {
      setLeads([])
      setOrigins([])
    }
  }, [user, fetchLeads])

  const addLead = async (newLead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return

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

    const encryptedLead = encryptedData?.result?.[0] || rowToInsert

    const { data, error } = await supabase.from('leads').insert(encryptedLead).select().single()
    if (data && !error) {
      const insertedLead = {
        ...newLead,
        id: data.id,
        created_at: data.created_at,
        updated_at: data.created_at,
      }
      setLeads((prev) => [insertedLead, ...prev])
      await logAudit(user.id, 'Created Lead', { lead_id: data.id, source: newLead.origin })
    }
  }

  const updateLeadStage = async (id: string, newStage: LeadStage) => {
    if (!user) return

    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, stage: newStage, updated_at: new Date().toISOString() } : lead,
      ),
    )

    await supabase.from('leads').update({ status: newStage }).eq('id', id)
    await logAudit(user.id, 'Updated Lead Stage', { lead_id: id, new_stage: newStage })
  }

  const value = React.useMemo(
    () => ({
      leads,
      origins,
      searchQuery,
      setSearchQuery,
      fetchLeads,
      addLead,
      updateLeadStage,
      isLoading,
    }),
    [leads, origins, searchQuery, fetchLeads, isLoading],
  )

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>
}

export default function useLeadStore() {
  const context = useContext(LeadContext)
  if (!context) throw new Error('useLeadStore must be used within LeadProvider')
  return context
}
