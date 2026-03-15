export type LeadStatus = 'novo_contato' | 'agendado' | 'em_atendimento' | 'convertido' | 'perdido'

export type LeadOrigin =
  | 'Google Ads'
  | 'Indicação'
  | 'Redes Sociais'
  | 'Visita Presencial'
  | 'Outro'

export interface Lead {
  id: string
  name: string
  phone: string
  email: string
  date: string
  origin: LeadOrigin
  status: LeadStatus
}

export const COLUMNS: { id: LeadStatus; title: string; color: string }[] = [
  { id: 'novo_contato', title: 'Novo Contato', color: 'border-blue-500' },
  { id: 'agendado', title: 'Agendado', color: 'border-purple-500' },
  { id: 'em_atendimento', title: 'Em Atendimento', color: 'border-orange-500' },
  { id: 'convertido', title: 'Convertido', color: 'border-emerald-500' },
  { id: 'perdido', title: 'Perdido', color: 'border-red-500' },
]
