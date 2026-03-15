export type LeadStage = 'novo_contato' | 'agendado' | 'em_atendimento' | 'convertido' | 'perdido'

export interface Lead {
  id: string
  user_id: string
  name: string
  phone: string
  email: string
  contact_date: string
  origin: string
  stage: LeadStage
  created_at: string
  updated_at: string
}

export const COLUMNS: { id: LeadStage; title: string; color: string }[] = [
  { id: 'novo_contato', title: 'Novo Contato', color: 'border-blue-500' },
  { id: 'agendado', title: 'Agendado', color: 'border-purple-500' },
  { id: 'em_atendimento', title: 'Em Atendimento', color: 'border-orange-500' },
  { id: 'convertido', title: 'Convertido', color: 'border-emerald-500' },
  { id: 'perdido', title: 'Perdido', color: 'border-red-500' },
]

export interface LeadOrigin {
  id: string
  name: string
  description: string
}
