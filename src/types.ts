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
  action_type:
    | 'created'
    | 'moved'
    | 'message_received'
    | 'note_added'
    | 'task_created'
    | 'follow_up_sent'
  description: string
  timestamp: string
  user_id?: string
}

export interface SavedFilter {
  id: string
  user_id: string
  name: string
  filters: any
  created_at: string
}

export interface Note {
  id: string
  lead_id: string
  content: string
  user_id: string
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string
  }
}

export interface Task {
  id: string
  lead_id: string
  title: string
  description: string
  due_date: string | null
  status: 'pending' | 'completed'
  assigned_to: string | null
  created_at: string
  updated_at: string
}
