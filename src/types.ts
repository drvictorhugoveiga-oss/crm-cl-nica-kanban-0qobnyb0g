export interface Lead {
  id: string
  user_id: string
  name: string
  phone: string
  email: string
  contact_date: string
  origin: string
  stage: string
  created_at: string
  updated_at: string
  lgpd_consent: boolean
  value?: number
  cost?: number
}

export interface LeadOrigin {
  id: string
  name: string
  description: string
}

export type LeadStage = string

export interface KanbanColumnDef {
  id: string
  user_id: string
  title: string
  color: string
  position: number
}

export interface LeadHistoryItem {
  id: string
  action_type: 'created' | 'moved' | 'message_received' | 'note_added'
  description: string
  timestamp: string
  user_id?: string
}
