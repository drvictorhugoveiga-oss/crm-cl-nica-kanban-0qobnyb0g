import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import useLeadStore from './useLeadStore'

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
  chats: Chat[]
  activeChatId: string | null
  setActiveChatId: (id: string | null) => void
  sendMessage: (phone: string, text: string) => Promise<void>
}

const WhatsAppContext = createContext<WhatsAppStore | undefined>(undefined)

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null)

  const { leads } = useLeadStore()

  useEffect(() => {
    const controller = new AbortController()

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .order('timestamp', { ascending: true })
          .abortSignal(controller.signal)

        if (controller.signal.aborted) return

        if (error) {
          console.error('Error loading messages:', error)
          return
        }

        if (data) {
          setMessages(data as Message[])
        }
      } catch (err: any) {
        if (
          controller.signal.aborted ||
          err.name === 'AbortError' ||
          err.message?.includes('Failed to fetch')
        ) {
          return
        }
        console.error('Failed to fetch messages:', err)
      }
    }

    fetchMessages()

    const subscription = supabase
      .channel('messages_channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        if (!controller.signal.aborted) {
          fetchMessages()
        }
      })
      .subscribe()

    return () => {
      controller.abort()
      subscription.unsubscribe()
    }
  }, [])

  const toggleSidebar = () => setIsOpen((prev) => !prev)

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
    const tempMsg: Message = {
      id: Date.now().toString(),
      phone,
      message_text: text,
      direction: 'outgoing',
      timestamp: new Date().toISOString(),
      read: true,
    }
    setMessages((prev) => [...prev, tempMsg])

    const { error } = await supabase.functions.invoke('whatsapp-handler', {
      body: { action: 'send', phone, message: text },
    })

    if (error) {
      console.error('Failed to send message:', error)
    }
  }

  const chatsMap = new Map<string, Chat>()

  leads.forEach((lead) => {
    const digits = lead.phone.replace(/\D/g, '')
    if (digits) {
      chatsMap.set(digits, {
        id: digits,
        leadName: lead.name,
        phone: lead.phone,
        lastMessage: '',
        lastMessageTime: '',
        unread: 0,
        messages: [],
      })
    }
  })

  messages.forEach((msg) => {
    const phone = msg.phone
    const existing = chatsMap.get(phone)
    const leadMatch = leads.find((l) => l.phone.replace(/\D/g, '') === phone)
    const leadName = leadMatch ? leadMatch.name : phone
    const time = new Date(msg.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    if (existing) {
      existing.messages.push(msg)
      existing.lastMessage = msg.message_text
      existing.lastMessageTime = time
      if (msg.direction === 'incoming' && !msg.read) {
        existing.unread += 1
      }
      if (!existing.leadName || existing.leadName === phone) {
        existing.leadName = leadName
      }
    } else {
      chatsMap.set(phone, {
        id: phone,
        leadName: leadName,
        phone: phone,
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
    { value: { isOpen, toggleSidebar, chats, activeChatId, setActiveChatId, sendMessage } },
    children,
  )
}

export function useWhatsAppStore() {
  const context = useContext(WhatsAppContext)
  if (!context) {
    throw new Error('useWhatsAppStore must be used within a WhatsAppProvider')
  }
  return context
}

export default useWhatsAppStore
