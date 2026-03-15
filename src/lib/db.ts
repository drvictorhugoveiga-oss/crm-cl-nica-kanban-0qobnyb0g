import { Lead, LeadOrigin } from '@/types'

export interface User {
  id: string
  email: string
  name: string
  password?: string
  created_at: string
}

const INITIAL_ORIGINS: LeadOrigin[] = [
  { id: '1', name: 'Google Ads', description: 'Leads from Google Ads campaigns' },
  { id: '2', name: 'Indicação', description: 'Referred by other patients' },
  { id: '3', name: 'Redes Sociais', description: 'From Instagram, Facebook, etc' },
  { id: '4', name: 'Visita Presencial', description: 'Walk-ins' },
  { id: '5', name: 'Outro', description: 'Other sources' },
]

class LocalDB {
  private get<T>(key: string): T[] {
    const data = localStorage.getItem(`crm_${key}`)
    return data ? JSON.parse(data) : []
  }

  private set<T>(key: string, data: T[]) {
    localStorage.setItem(`crm_${key}`, JSON.stringify(data))
  }

  init() {
    if (this.get('origins').length === 0) {
      this.set('origins', INITIAL_ORIGINS)
    }
    if (!localStorage.getItem('crm_users')) this.set('users', [])
    if (!localStorage.getItem('crm_leads')) this.set('leads', [])

    const users = this.get<User>('users')
    if (!users.find((u) => u.email === 'drvictorhugoveiga@gmail.com')) {
      const defaultUser: User = {
        id: crypto.randomUUID(),
        name: 'Dr. Victor Hugo Veiga',
        email: 'drvictorhugoveiga@gmail.com',
        password: 'Geriatria@6d',
        created_at: new Date().toISOString(),
      }
      this.set('users', [...users, defaultUser])
    }
  }

  async signup(name: string, email: string, password: string): Promise<User> {
    await new Promise((r) => setTimeout(r, 600))
    const users = this.get<User>('users')
    if (users.find((u) => u.email === email)) throw new Error('E-mail já registrado.')
    const user: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      created_at: new Date().toISOString(),
    }
    this.set('users', [...users, user])

    const mockLeads: Omit<Lead, 'id'>[] = [
      {
        user_id: user.id,
        name: 'Maria Silva',
        phone: '(11) 98765-4321',
        email: 'maria@email.com',
        contact_date: new Date().toISOString().split('T')[0],
        origin: 'Google Ads',
        stage: 'novo_contato',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        user_id: user.id,
        name: 'João Santos',
        phone: '(11) 91234-5678',
        email: 'joao@email.com',
        contact_date: new Date().toISOString().split('T')[0],
        origin: 'Indicação',
        stage: 'agendado',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]
    const currentLeads = this.get<Lead>('leads')
    const seededLeads = mockLeads.map((l) => ({ ...l, id: crypto.randomUUID() }))
    this.set('leads', [...currentLeads, ...seededLeads])

    return { id: user.id, email: user.email, name: user.name, created_at: user.created_at }
  }

  async login(email: string, password: string): Promise<User> {
    await new Promise((r) => setTimeout(r, 600))
    const users = this.get<User>('users')
    const user = users.find((u) => u.email === email && u.password === password)
    if (!user) throw new Error('E-mail ou senha inválidos.')
    return { id: user.id, email: user.email, name: user.name, created_at: user.created_at }
  }

  async getOrigins(): Promise<LeadOrigin[]> {
    return this.get<LeadOrigin>('origins')
  }

  async getLeads(userId: string): Promise<Lead[]> {
    const leads = this.get<Lead>('leads')
    return leads.filter((l) => l.user_id === userId)
  }

  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>): Promise<Lead> {
    const leads = this.get<Lead>('leads')
    const newLead: Lead = {
      ...lead,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    this.set('leads', [...leads, newLead])
    return newLead
  }

  async updateLeadStage(id: string, stage: Lead['stage']): Promise<void> {
    const leads = this.get<Lead>('leads')
    const index = leads.findIndex((l) => l.id === id)
    if (index > -1) {
      leads[index] = { ...leads[index], stage, updated_at: new Date().toISOString() }
      this.set('leads', leads)
    }
  }
}

export const db = new LocalDB()
db.init()
