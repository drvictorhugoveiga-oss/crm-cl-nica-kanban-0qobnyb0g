import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface Message {
  id: string
  text: string
  timestamp: string
  isSent: boolean
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
  sendMessage: (chatId: string, text: string) => void
}

const initialChats: Chat[] = [
  {
    id: '1',
    leadName: 'Maria Silva',
    phone: '+55 11 99999-1111',
    lastMessage: 'Vou confirmar o horário sim, obrigada!',
    lastMessageTime: '10:30',
    unread: 2,
    messages: [
      {
        id: 'm1',
        text: 'Olá Maria, seu retorno está agendado para amanhã às 14h.',
        timestamp: '10:00',
        isSent: true,
      },
      { id: 'm2', text: 'Bom dia! Tudo bem?', timestamp: '10:15', isSent: false },
      {
        id: 'm3',
        text: 'Vou confirmar o horário sim, obrigada!',
        timestamp: '10:30',
        isSent: false,
      },
    ],
  },
  {
    id: '2',
    leadName: 'João Santos',
    phone: '+55 11 99999-2222',
    lastMessage: 'Qual o valor da consulta?',
    lastMessageTime: 'Ontem',
    unread: 1,
    messages: [
      {
        id: 'm1',
        text: 'Boa tarde, João. Vi que você tem interesse em agendar uma avaliação.',
        timestamp: '14:00',
        isSent: true,
      },
      { id: 'm2', text: 'Qual o valor da consulta?', timestamp: '14:30', isSent: false },
    ],
  },
  {
    id: '3',
    leadName: 'Ana Oliveira',
    phone: '+55 11 99999-3333',
    lastMessage: 'Ok, combinado.',
    lastMessageTime: 'Segunda',
    unread: 0,
    messages: [
      {
        id: 'm1',
        text: 'Ana, os resultados dos seus exames já estão disponíveis.',
        timestamp: '09:00',
        isSent: true,
      },
      { id: 'm2', text: 'Ok, combinado.', timestamp: '09:15', isSent: false },
    ],
  },
]

const WhatsAppContext = createContext<WhatsAppStore | undefined>(undefined)

export function WhatsAppProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null)

  const toggleSidebar = () => setIsOpen((prev) => !prev)

  const setActiveChatId = (id: string | null) => {
    setActiveChatIdState(id)
    if (id) {
      setChats((prev) => prev.map((chat) => (chat.id === id ? { ...chat, unread: 0 } : chat)))
    }
  }

  const sendMessage = (chatId: string, text: string) => {
    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          const newMessage: Message = {
            id: Date.now().toString(),
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSent: true,
          }
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: text,
            lastMessageTime: newMessage.timestamp,
          }
        }
        return chat
      }),
    )
  }

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
