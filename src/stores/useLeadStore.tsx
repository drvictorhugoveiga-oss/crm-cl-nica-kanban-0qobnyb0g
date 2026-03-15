import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react'
import { Lead, LeadStage, LeadOrigin } from '@/types'
import { db } from '@/lib/db'
import useAuthStore from './useAuthStore'

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

export function LeadProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()
  const [leads, setLeads] = useState<Lead[]>([])
  const [origins, setOrigins] = useState<LeadOrigin[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const fetchLeads = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await db.getLeads(user.id)
      setLeads(data)
      const originData = await db.getOrigins()
      setOrigins(originData)
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
    const lead = await db.createLead(newLead)
    setLeads((prev) => [lead, ...prev])
  }

  const updateLeadStage = async (id: string, newStage: LeadStage) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, stage: newStage, updated_at: new Date().toISOString() } : lead,
      ),
    )
    await db.updateLeadStage(id, newStage)
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
