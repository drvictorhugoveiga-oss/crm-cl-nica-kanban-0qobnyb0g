import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import useLeadStore from './useLeadStore'
import { fetchWithRetry } from '@/lib/fetch-with-retry'
import { toast } from 'sonner'

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
  isLoading: boolean
}

const WhatsAppContext = createContext<WhatsAppStore | undefined>(undefined)

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { leads } = useLeadStore()

  const phoneNumbersStr = useMemo(() => {
    return [...new Set(leads.map((l) => l.phone?.replace(/\D/g, '')).filter(Boolean))]
      .sort()
      .join(',')
  }, [leads])

  useEffect(() => {
    const controller = new AbortController()

    const fetchMessages = async () => {
      const phones = phoneNumbersStr ? phoneNumbersStr.split(',') : []
      if (phones.length === 0) {
        setMessages([])
        setIsLoading(false)
        return
      }

      const CACHE_KEY = 'crm_messages_cache'
      let hasCache = false
      const cachedStr = localStorage.getItem(CACHE_KEY)
      if (cachedStr) {
        try {
          const parsed = JSON.parse(cachedStr)
          if (Array.isArray(parsed)) {
            const cachedPhones = [...new Set(parsed.map((m: any) => m.phone))]
            const isSubset = cachedPhones.every((p) => typeof p === 'string' && phones.includes(p))
            if (isSubset) {
              setMessages((prev) => (prev.length === 0 ? parsed : prev))
              hasCache = true
            }
          }
        } catch (e) {
          // ignore cache parse error
        }
      }

      if (!hasCache) setIsLoading(true)

      try {
        const queryFn = async () => {
          const q = supabase
            .from('messages')
            .select('*')
            .in('phone', phones)
            .order('timestamp', { ascending: true })

          q.abortSignal(controller.signal)
          return await q
        }

        const { data, error } = await fetchWithRetry(queryFn, 3, 1000, controller.signal)
        if (controller.signal.aborted) return

        if (error) {
          const msg = error.message || ''
          if (
            error.name !== 'AbortError' &&
            !msg.includes('Aborted') &&
            !msg.includes('aborted without reason')
          ) {
            console.error('Error loading messages:', error)
          }
          return
        }

        if (data) {
          setMessages(data as Message[])
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data))
          } catch (e) {
            /* ignore */
          }
        }
      } catch (err: any) {
        const msg = err?.message || ''
        if (
          controller.signal.aborted ||
          err?.name === 'AbortError' ||
          msg.includes('Aborted') ||
          msg.includes('aborted without reason')
        ) {
          return
        }
        console.error('Unhandled error in fetchMessages:', err)
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
              fetchMessages()
              if (newMsg.direction === 'incoming') {
                const leadMatch = leads.find(
                  (l) => (l.phone?.replace(/\D/g, '') || l.phone) === newMsg.phone,
                )
                const senderName = leadMatch ? leadMatch.name : newMsg.phone
                const snippet =
                  newMsg.message_text.length > 40
                    ? newMsg.message_text.substring(0, 40) + '...'
                    : newMsg.message_text
                toast.info(`Nova mensagem de ${senderName}: ${snippet}`)
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
      toast.error('Erro ao enviar mensagem.')
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
    const phone = msg.phone
    const existing = chatsMap.get(phone)
    const leadMatch = leads.find((l) => (l.phone?.replace(/\D/g, '') || l.phone) === phone)
    const leadName = leadMatch ? leadMatch.name : phone
    const time = new Date(msg.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })

    if (existing) {
      existing.messages.push(msg)
      existing.lastMessage = msg.message_text
      existing.lastMessageTime = time
      if (msg.direction === 'incoming' && !msg.read) existing.unread += 1
      if (!existing.leadName || existing.leadName === phone) existing.leadName = leadName
    } else {
      chatsMap.set(phone, {
        id: phone,
        leadName,
        phone,
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
        chats,
        activeChatId,
        setActiveChatId,
        sendMessage,
        isLoading,
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
