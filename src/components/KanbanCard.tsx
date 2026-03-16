import { Lead } from '@/types'
import {
  Calendar,
  Mail,
  Phone,
  MoreHorizontal,
  Trash2,
  MessageCircle,
  MoveRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useKanbanStore } from '@/stores/useKanbanStore'
import useLeadStore from '@/stores/useLeadStore'
import { supabase } from '@/lib/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

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
  const { deleteLead, updateLeadStage } = useLeadStore()

  const colColor = columns.find((c) => c.title === lead.stage)?.color || '#cbd5e1'

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('type', 'card')
    e.dataTransfer.setData('leadId', lead.id)
    e.dataTransfer.effectAllowed = 'move'
    requestAnimationFrame(() => setIsDragging(true))
  }

  const handleDragEnd = () => setIsDragging(false)

  const cleanPhone = (lead.phone || '').replace(/\D/g, '')
  const hasPhone = cleanPhone.length > 0

  const handleWhatsAppClick = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!hasPhone) return

    window.open(`https://wa.me/${cleanPhone}`, '_blank', 'noopener,noreferrer')

    try {
      await supabase.from('messages').insert({
        lead_id: lead.id,
        phone: cleanPhone,
        message_text: 'WhatsApp conversation initiated via Kanban',
        direction: 'outgoing',
        read: true,
      })
    } catch (error) {
      console.error('Error logging WhatsApp message:', error)
    }
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ borderLeftColor: colColor }}
      className={cn(
        'group relative flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-200/60 border-l-4 cursor-grab transition-all duration-300 ease-in-out hover:shadow-md hover:-translate-y-1 active:cursor-grabbing animate-fade-in-up',
        isDragging && 'opacity-40 rotate-3 scale-95 shadow-lg z-50',
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-semibold text-slate-800 text-[15px] leading-tight line-clamp-2 transition-colors duration-300 group-hover:text-primary">
          {lead.name}
        </h4>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-6 sm:w-6 -mr-2 -mt-1 text-slate-400 hover:text-slate-700 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 ease-in-out focus-visible:opacity-100 data-[state=open]:opacity-100 shrink-0"
            >
              <MoreHorizontal className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 animate-in fade-in-80 zoom-in-95">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="py-2.5 sm:py-1.5 cursor-pointer">
                <MoveRight className="h-4 w-4 mr-2" />
                Mover para
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-44">
                {columns.map(
                  (c) =>
                    c.title !== lead.stage && (
                      <DropdownMenuItem
                        key={c.id}
                        className="py-2.5 sm:py-1.5 cursor-pointer"
                        onClick={() => updateLeadStage(lead.id, c.title)}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-2"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.title}
                      </DropdownMenuItem>
                    ),
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer transition-colors duration-200 py-2.5 sm:py-1.5"
              onClick={() => deleteLead(lead.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-col gap-2 text-[13px] text-slate-600">
        <div className="flex items-center justify-between group/contact min-h-8">
          <div className="flex items-center gap-2 overflow-hidden">
            <Phone className="h-3.5 w-3.5 text-slate-400 group-hover/contact:text-primary transition-colors duration-300 shrink-0" />
            <span className="truncate">{lead.phone || 'Sem telefone'}</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className={cn(
                  'h-8 w-8 rounded-full shrink-0 transition-all duration-200 ml-2',
                  hasPhone
                    ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 bg-emerald-50/50 shadow-sm'
                    : 'text-slate-300 hover:bg-transparent hover:text-slate-300 cursor-not-allowed opacity-60',
                )}
                onClick={handleWhatsAppClick}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="px-2 py-1.5">
              <p className="text-xs font-medium">
                {hasPhone ? 'Iniciar conversa no WhatsApp' : 'Telefone não cadastrado'}
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        {lead.email && (
          <div className="flex items-center gap-2 group/contact min-h-8">
            <Mail className="h-3.5 w-3.5 text-slate-400 group-hover/contact:text-primary transition-colors duration-300 shrink-0" />
            <span className="truncate" title={lead.email}>
              {lead.email}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100/80">
        <span
          className={cn(
            'px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap tracking-wide transition-all duration-300',
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
