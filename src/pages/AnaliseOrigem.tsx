import { useMemo } from 'react'
import useLeadStore from '@/stores/useLeadStore'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react'

export default function AnaliseOrigem() {
  const { leads, isLoading } = useLeadStore()
  const { columns } = useKanbanStore()

  const stats = useMemo(() => {
    const total = leads.length
    const convertedCol = columns[columns.length - 1]?.title || 'Convertido'

    const converted = leads.filter(
      (l) => l.stage === convertedCol || l.stage === 'convertido',
    ).length
    const active = leads.filter((l) => l.stage !== convertedCol && l.stage !== 'Perdido').length

    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0'

    const totalValue = leads.reduce((acc, curr: any) => acc + (Number(curr.value) || 0), 0)
    const totalCost = leads.reduce((acc, curr: any) => acc + (Number(curr.cost) || 0), 0)
    const roi = totalCost > 0 ? (((totalValue - totalCost) / totalCost) * 100).toFixed(1) : '0.0'

    return { total, converted, active, conversionRate, totalValue, totalCost, roi }
  }, [leads, columns])

  return (
    <div className="p-4 sm:p-6 bg-[#F8FAFC] h-full overflow-y-auto w-full animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Dashboard de Análise</h1>
          <p className="text-slate-500 text-sm mt-1">
            Acompanhe o desempenho e retorno sobre investimento (ROI) dos seus leads.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading && leads.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="shadow-sm border-slate-200 animate-pulse">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <Card className="shadow-sm border-slate-200 transition-all hover:shadow-md animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total de Leads
                  </CardTitle>
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-full shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                  <p className="text-xs text-slate-500 mt-1">Leads registrados no sistema</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200 transition-all hover:shadow-md animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Leads Convertidos
                  </CardTitle>
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0">
                    <Activity className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{stats.converted}</div>
                  <p className="text-xs text-slate-500 mt-1">
                    Taxa de conversão: {stats.conversionRate}%
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200 transition-all hover:shadow-md animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Valor Estimado
                  </CardTitle>
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      stats.totalValue,
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Receita potencial total</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-slate-200 transition-all hover:shadow-md animate-fade-in">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">ROI Estimado</CardTitle>
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-full shrink-0">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-slate-800">{stats.roi}%</div>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    Retorno sobre os custos (
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                      stats.totalCost,
                    )}
                    )
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="shadow-sm border-slate-200 min-h-[300px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-base text-slate-800">Conversão por Origem</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              {isLoading && leads.length === 0 ? (
                <Skeleton className="h-48 w-48 rounded-full" />
              ) : (
                <p className="text-sm text-slate-400">Gráfico de distribuição (em breve)</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 min-h-[300px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-base text-slate-800">Evolução de Leads</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              {isLoading && leads.length === 0 ? (
                <div className="w-full space-y-4">
                  <Skeleton className="h-32 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400">Gráfico de linha do tempo (em breve)</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
