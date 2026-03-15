import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Lead, LeadStatus } from '@/types'

const INITIAL_LEADS: Lead[] = [
  {
    id: '1',
    name: 'Maria Silva',
    phone: '(11) 98765-4321',
    email: 'maria@email.com',
    date: '2023-10-25',
    origin: 'Google Ads',
    status: 'novo_contato',
  },
  {
    id: '2',
    name: 'João Santos',
    phone: '(11) 91234-5678',
    email: 'joao@email.com',
    date: '2023-10-26',
    origin: 'Indicação',
    status: 'agendado',
  },
  {
    id: '3',
    name: 'Ana Oliveira',
    phone: '(21) 99999-1111',
    email: 'ana@email.com',
    date: '2023-10-24',
    origin: 'Redes Sociais',
    status: 'em_atendimento',
  },
  {
    id: '4',
    name: 'Carlos Costa',
    phone: '(31) 98888-2222',
    email: 'carlos@email.com',
    date: '2023-10-20',
    origin: 'Visita Presencial',
    status: 'convertido',
  },
  {
    id: '5',
    name: 'Beatriz Souza',
    phone: '(41) 97777-3333',
    email: 'beatriz@email.com',
    date: '2023-10-21',
    origin: 'Outro',
    status: 'perdido',
  },
]

interface LeadStore {
  leads: Lead[]
  searchQuery: string
  setSearchQuery: (query: string) => void
  addLead: (lead: Omit<Lead, 'id' | 'status'>) => void
  updateLeadStatus: (id: string, newStatus: LeadStatus) => void
}

const LeadContext = createContext<LeadStore | undefined>(undefined)

export function LeadProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS)
  const [searchQuery, setSearchQuery] = useState('')

  const addLead = (newLead: Omit<Lead, 'id' | 'status'>) => {
    const lead: Lead = {
      ...newLead,
      id: Math.random().toString(36).substring(7),
      status: 'novo_contato',
    }
    setLeads((prev) => [lead, ...prev])
  }

  const updateLeadStatus = (id: string, newStatus: LeadStatus) => {
    setLeads((prev) => prev.map((lead) => (lead.id === id ? { ...lead, status: newStatus } : lead)))
  }

  const value = React.useMemo(
    () => ({ leads, searchQuery, setSearchQuery, addLead, updateLeadStatus }),
    [leads, searchQuery],
  )

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>
}

export default function useLeadStore() {
  const context = useContext(LeadContext)
  if (!context) throw new Error('useLeadStore must be used within LeadProvider')
  return context
}
