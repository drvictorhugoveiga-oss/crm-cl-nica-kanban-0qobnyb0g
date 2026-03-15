import { Lead } from '@/types'
import { Calendar, Mail, Phone } from 'lucide-react'
import useLeadStore from '@/stores/useLeadStore'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const ORIGIN_COLORS: Record<string, string> = {
  'Google Ads': 'bg-blue-100 text-blue-700',
  Indicação: 'bg-purple-100 text-purple-700',
  'Redes Sociais': 'bg-pink-100 text-pink-700',
  'Visita Presencial': 'bg-orange-100 text-orange-700',
  Outro: 'bg-gray-100 text-gray-700',
}

const STATUS_BORDER_COLORS: Record<string, string> = {
  novo_contato: 'border-l-blue-500',
  agendado: 'border-l-purple-500',
  em_atendimento: 'border-l-orange-500',
  convertido: 'border-l-emerald-500',
  perdido: 'border-l-red-500',
}

export function KanbanCard({ lead }: { lead: Lead }) {
  const { searchQuery } = useLeadStore()
  const [isDragging, setIsDragging] = useState(false)

  const isVisible =
    lead.name.toLowerCase().includes(searchQuery.toLowerCase()) || lead.phone.includes(searchQuery)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('leadId', lead.id)
    e.dataTransfer.effectAllowed = 'move'
    setTimeout(() => setIsDragging(true), 0)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-200 border-l-4 cursor-grab hover:shadow-md transition-all duration-200 hover:-translate-y-0.5',
        STATUS_BORDER_COLORS[lead.status],
        !isVisible && 'opacity-30 grayscale',
        isDragging && 'opacity-50 rotate-2 scale-95',
      )}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-semibold text-slate-800 text-base line-clamp-1">{lead.name}</h4>
      </div>

      <div className="flex flex-col gap-1.5 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{lead.phone}</span>
        </div>
        {lead.email && (
          <div className="flex items-center gap-2">
            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate" title={lead.email}>
              {lead.email}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100">
        <span
          className={cn(
            'px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap',
            ORIGIN_COLORS[lead.origin] || ORIGIN_COLORS['Outro'],
          )}
        >
          {lead.origin}
        </span>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <Calendar className="h-3 w-3" />
          {new Date(lead.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
        </div>
      </div>
    </div>
  )
}
