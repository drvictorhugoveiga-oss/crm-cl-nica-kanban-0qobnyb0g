import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useMemo,
  useCallback,
} from 'react'
import { supabase } from '@/lib/supabase/client'
import useLeadStore from './useLeadStore'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import { toast } from 'sonner'

export type ConnectionStatus = 'idle' | 'disconnected' | 'connecting' | 'qr' | 'connected'

export interface Message {
  id: string
  phone: string
  message_text: string
  direction: 'incoming' | 'outgoing'
  timestamp: string
  read: boolean
}

export interface Chat {
  id: string
  leadName: string
  phone: string
  lastMessage: string
  lastMessageTime: string
  unread: number
  messages: Message[]
}

interface WhatsAppStore {
  isOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void
  chats: Chat[]
  activeChatId: string | null
  setActiveChatId: (id: string | null) => void
  sendMessage: (phone: string, text: string) => Promise<void>
  isLoading: boolean
  connectionStatus: ConnectionStatus
  qrCode: string | null
  startConnection: () => Promise<void>
  checkConnection: () => Promise<void>
  logout: () => Promise<void>
}

const WhatsAppContext = createContext<WhatsAppStore | undefined>(undefined)

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const { leads } = useLeadStore()

  const phoneNumbersStr = useMemo(() => {
    return [...new Set(leads.map((l) => l.phone?.replace(/\D/g, '')).filter(Boolean))]
      .sort()
      .join(',')
  }, [leads])

  const checkConnection = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-handler', {
        body: { action: 'status' },
      })
      if (error) throw error
      if (data?.status) {
        setConnectionStatus(data.status)
        if (data.status === 'connected') setQrCode(null)
      }
    } catch (err) {
      console.error('Failed to check WhatsApp status', err)
    }
  }, [])

  const startConnection = async () => {
    setConnectionStatus('connecting')
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-handler', {
        body: { action: 'start' },
      })
      if (error) throw error

      if (data?.qr) {
        setQrCode(data.qr)
        setConnectionStatus('qr')
      } else if (data?.status === 'connected') {
        setConnectionStatus('connected')
        toast.success('WhatsApp conectado com sucesso!')
      } else {
        setConnectionStatus('disconnected')
      }
    } catch (err) {
      setConnectionStatus('disconnected')
      toast.error('Erro ao iniciar conexão com o WhatsApp.')
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.functions.invoke('whatsapp-handler', {
        body: { action: 'logout' },
      })
      if (error) throw error
      setConnectionStatus('disconnected')
      setQrCode(null)
      toast.success('Sessão do WhatsApp encerrada.')
    } catch (err) {
      toast.error('Erro ao desconectar.')
    }
  }

  // Poll connection status while connecting or showing QR
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>
    if (connectionStatus === 'qr' || connectionStatus === 'connecting') {
      interval = setInterval(() => checkConnection(), 4000)
    }
    return () => clearInterval(interval)
  }, [connectionStatus, checkConnection])

  // Initial status check
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  useEffect(() => {
    const controller = new AbortController()

    const fetchMessages = async () => {
      const phones = phoneNumbersStr ? phoneNumbersStr.split(',') : []
      if (phones.length === 0) {
        setMessages([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const { data, error } = await fetchWithRetry(
          async () =>
            supabase
              .from('messages')
              .select('*')
              .in('phone', phones)
              .order('timestamp', { ascending: true })
              .abortSignal(controller.signal),
          3,
          1000,
          controller.signal,
        )
        if (!controller.signal.aborted && !error && data) {
          setMessages(data as Message[])
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    fetchMessages()

    const phones = phoneNumbersStr ? phoneNumbersStr.split(',') : []
    const subscription = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message
          if (newMsg && phones.includes(newMsg.phone)) {
            if (!controller.signal.aborted) {
              setMessages((prev) => {
                if (prev.find((m) => m.id === newMsg.id)) return prev
                return [...prev, newMsg]
              })
              if (newMsg.direction === 'incoming') {
                const leadMatch = leads.find(
                  (l) => (l.phone?.replace(/\D/g, '') || l.phone) === newMsg.phone,
                )
                const senderName = leadMatch ? leadMatch.name : newMsg.phone
                toast.info(`Nova mensagem de ${senderName}`)
              }
            }
          }
        },
      )
      .subscribe()

    return () => {
      controller.abort()
      subscription.unsubscribe()
    }
  }, [phoneNumbersStr, leads])

  const toggleSidebar = () => setIsOpen((prev) => !prev)
  const closeSidebar = () => setIsOpen(false)

  const setActiveChatId = async (id: string | null) => {
    setActiveChatIdState(id)
    if (id) {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('phone', id)
        .eq('direction', 'incoming')
        .eq('read', false)
      setMessages((prev) =>
        prev.map((m) => (m.phone === id && m.direction === 'incoming' ? { ...m, read: true } : m)),
      )
    }
  }

  const sendMessage = async (phone: string, text: string) => {
    if (connectionStatus !== 'connected') {
      toast.error('WhatsApp não está conectado.')
      return
    }

    const tempId = Date.now().toString()
    const tempMsg: Message = {
      id: tempId,
      phone,
      message_text: text,
      direction: 'outgoing',
      timestamp: new Date().toISOString(),
      read: true,
    }

    setMessages((prev) => [...prev, tempMsg])

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-handler', {
        body: { action: 'send', phone, message: text },
      })
      if (error) throw error
      if (data?.error) throw new Error(data.error)
    } catch (err) {
      toast.error('Erro ao enviar mensagem.')
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    }
  }

  const chatsMap = new Map<string, Chat>()
  leads.forEach((lead) => {
    const digits = lead.phone?.replace(/\D/g, '') || lead.phone
    if (digits)
      chatsMap.set(digits, {
        id: digits,
        leadName: lead.name,
        phone: lead.phone || '',
        lastMessage: '',
        lastMessageTime: '',
        unread: 0,
        messages: [],
      })
  })

  messages.forEach((msg) => {
    const existing = chatsMap.get(msg.phone)
    const time = new Date(msg.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    if (existing) {
      existing.messages.push(msg)
      existing.lastMessage = msg.message_text
      existing.lastMessageTime = time
      if (msg.direction === 'incoming' && !msg.read) existing.unread += 1
    } else {
      const leadMatch = leads.find((l) => (l.phone?.replace(/\D/g, '') || l.phone) === msg.phone)
      chatsMap.set(msg.phone, {
        id: msg.phone,
        leadName: leadMatch ? leadMatch.name : msg.phone,
        phone: msg.phone,
        lastMessage: msg.message_text,
        lastMessageTime: time,
        unread: msg.direction === 'incoming' && !msg.read ? 1 : 0,
        messages: [msg],
      })
    }
  })

  const chats = Array.from(chatsMap.values()).sort((a, b) => {
    const aTime =
      a.messages.length > 0 ? new Date(a.messages[a.messages.length - 1].timestamp).getTime() : 0
    const bTime =
      b.messages.length > 0 ? new Date(b.messages[b.messages.length - 1].timestamp).getTime() : 0
    return bTime - aTime
  })

  return React.createElement(
    WhatsAppContext.Provider,
    {
      value: {
        isOpen,
        toggleSidebar,
        closeSidebar,
        chats,
        activeChatId,
        setActiveChatId,
        sendMessage,
        isLoading,
        connectionStatus,
        qrCode,
        startConnection,
        checkConnection,
        logout,
      },
    },
    children,
  )
}

export function useWhatsAppStore() {
  const context = useContext(WhatsAppContext)
  if (!context) throw new Error('useWhatsAppStore must be used within a WhatsAppProvider')
  return context
}

export default useWhatsAppStore
