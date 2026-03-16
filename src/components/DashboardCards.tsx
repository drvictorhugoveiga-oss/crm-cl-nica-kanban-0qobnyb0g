import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, DollarSign, MessageCircle, Bell } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardCards() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState({
    totalLeads: 0,
    pipelineValue: 0,
    totalCost: 0,
    statusBreakdown: {} as Record<string, number>,
    totalMessages: 0,
    unreadMessages: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user?.id) return
    const controller = new AbortController()

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data: leads, error: leadsError } = await supabase
          .from('leads')
          .select('id, value, cost, status, phone')
          .eq('user_id', user.id)
          .abortSignal(controller.signal)

        if (leadsError) throw leadsError

        const totalLeads = leads.length
        const pipelineValue = leads.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0)
        const totalCost = leads.reduce((sum, lead) => sum + (Number(lead.cost) || 0), 0)

        const statusBreakdown = leads.reduce(
          (acc, lead) => {
            const status = lead.status || 'new'
            acc[status] = (acc[status] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        )

        let totalMessages = 0
        let unreadMessages = 0

        // Match phone filtering format exactly as useWhatsAppStore
        const phones = [...new Set(leads.map((l) => l.phone?.replace(/\D/g, '')).filter(Boolean))]

        if (phones.length > 0) {
          const chunkSize = 100
          for (let i = 0; i < phones.length; i += chunkSize) {
            const chunk = phones.slice(i, i + chunkSize)
            const { data: messages, error: msgsError } = await supabase
              .from('messages')
              .select('id, read')
              .in('phone', chunk)
              .abortSignal(controller.signal)

            if (msgsError) throw msgsError

            totalMessages += messages.length
            unreadMessages += messages.filter((m) => !m.read).length
          }
        }

        if (!controller.signal.aborted) {
          setMetrics({
            totalLeads,
            pipelineValue,
            totalCost,
            statusBreakdown,
            totalMessages,
            unreadMessages,
          })
        }
      } catch (err: any) {
        if (err.name !== 'AbortError' && !controller.signal.aborted) {
          console.error('Dashboard fetch error:', err)
          setError('Não foi possível carregar o resumo do dashboard.')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchDashboardData()

    return () => {
      controller.abort()
    }
  }, [user?.id])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
        {error}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total de Leads</CardTitle>
          <Users className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{metrics.totalLeads}</div>
          <div className="text-xs text-slate-500 mt-1 flex gap-2 flex-wrap">
            {Object.entries(metrics.statusBreakdown).map(([status, count]) => (
              <span key={status} className="bg-slate-100 px-1.5 py-0.5 rounded-md text-slate-600">
                {capitalize(status)}: <strong className="text-slate-800">{count}</strong>
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Performance (ROI)</CardTitle>
          <DollarSign className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              metrics.pipelineValue,
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            Custo:{' '}
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
              metrics.totalCost,
            )}
            {metrics.totalCost > 0 &&
              ` • ROI: ${(((metrics.pipelineValue - metrics.totalCost) / metrics.totalCost) * 100).toFixed(0)}%`}
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total de Mensagens</CardTitle>
          <MessageCircle className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-slate-800">{metrics.totalMessages}</div>
          <p className="text-xs text-slate-500 mt-1">Trocadas com seus leads</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-slate-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Não Lidas</CardTitle>
          <Bell
            className={
              metrics.unreadMessages > 0 ? 'h-4 w-4 text-orange-400' : 'h-4 w-4 text-slate-400'
            }
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${metrics.unreadMessages > 0 ? 'text-orange-600' : 'text-slate-800'}`}
          >
            {metrics.unreadMessages}
          </div>
          <p className="text-xs text-slate-500 mt-1">Aguardando resposta</p>
        </CardContent>
      </Card>
    </div>
  )
}
