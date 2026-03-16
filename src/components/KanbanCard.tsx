import { Lead } from '@/types'
import { Calendar, Mail, Phone, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useKanbanStore } from '@/stores/useKanbanStore'

const ORIGIN_COLORS: Record<string, string> = {
  'Google Ads': 'bg-blue-100 text-blue-700',
  Indicação: 'bg-purple-100 text-purple-700',
  'Redes Sociais': 'bg-pink-100 text-pink-700',
  'Visita Presencial': 'bg-orange-100 text-orange-700',
  WhatsApp: 'bg-emerald-100 text-emerald-700',
  Outro: 'bg-gray-100 text-gray-700',
}

export function KanbanCard({ lead }: { lead: Lead }) {
  const [isDragging, setIsDragging] = useState(false)
  const { columns } = useKanbanStore()

  const colColor = columns.find((c) => c.title === lead.stage)?.color || '#cbd5e1'

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('type', 'card')
    e.dataTransfer.setData('leadId', lead.id)
    e.dataTransfer.effectAllowed = 'move'
    requestAnimationFrame(() => setIsDragging(true))
  }

  const handleDragEnd = () => setIsDragging(false)

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ borderLeftColor: colColor }}
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-200/60 border-l-4 cursor-grab transition-all duration-300 hover:shadow-md hover:-translate-y-1 active:cursor-grabbing animate-fade-in-up',
        isDragging && 'opacity-40 rotate-3 scale-95 shadow-lg z-50',
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-slate-800 text-[15px] leading-tight line-clamp-2">
          {lead.name}
        </h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mr-2 -mt-1 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity focus-visible:opacity-100"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-col gap-1.5 text-[13px] text-slate-600">
        <div className="flex items-center gap-2 group/contact">
          <Phone className="h-3.5 w-3.5 text-slate-400 group-hover/contact:text-primary transition-colors shrink-0" />
          <span className="truncate">{lead.phone}</span>
        </div>
        {lead.email && (
          <div className="flex items-center gap-2 group/contact">
            <Mail className="h-3.5 w-3.5 text-slate-400 group-hover/contact:text-primary transition-colors shrink-0" />
            <span className="truncate" title={lead.email}>
              {lead.email}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 pt-3 border-t border-slate-100/80">
        <span
          className={cn(
            'px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap tracking-wide',
            ORIGIN_COLORS[lead.origin] || ORIGIN_COLORS['Outro'],
          )}
        >
          {lead.origin}
        </span>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <Calendar className="h-3 w-3" />
          {new Date(lead.contact_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
        </div>
      </div>
    </div>
  )
}
