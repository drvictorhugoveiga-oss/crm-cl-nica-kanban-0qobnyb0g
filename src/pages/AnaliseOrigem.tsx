import { useMemo } from 'react'
import useLeadStore from '@/stores/useLeadStore'
import { useKanbanStore } from '@/stores/useKanbanStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts'

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

  const PIE_COLORS = ['#3b82f6', '#a855f7', '#f97316', '#10b981', '#ef4444', '#eab308']

  const originData = useMemo(() => {
    const counts: Record<string, number> = {}
    leads.forEach((l) => {
      counts[l.origin] = (counts[l.origin] || 0) + 1
    })
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      fill: PIE_COLORS[idx % PIE_COLORS.length],
    }))
  }, [leads])

  const timelineData = useMemo(() => {
    const dates = leads.reduce(
      (acc, l) => {
        const d = new Date(l.contact_date).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
        })
        acc[d] = (acc[d] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return Object.entries(dates)
      .slice(0, 7)
      .map(([date, count]) => ({ date, count }))
      .reverse()
  }, [leads])

  const barChartConfig: ChartConfig = {
    count: {
      label: 'Leads',
      color: 'hsl(var(--primary))',
    },
  }

  const pieChartConfig = originData.reduce((acc, curr) => {
    acc[curr.name] = { label: curr.name, color: curr.fill }
    return acc
  }, {} as ChartConfig)

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
            <CardContent className="flex-1 flex items-center justify-center p-0 pb-6 sm:p-6 sm:pt-0">
              {isLoading && leads.length === 0 ? (
                <Skeleton className="h-48 w-48 rounded-full" />
              ) : originData.length > 0 ? (
                <ChartContainer
                  config={pieChartConfig}
                  className="w-full h-full min-h-[250px] aspect-square sm:aspect-auto"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                      <Pie
                        data={originData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                      >
                        {originData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-sm text-slate-400">Sem dados suficientes</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm border-slate-200 min-h-[300px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-base text-slate-800">Evolução de Leads</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-0 pb-6 sm:p-6 sm:pt-0 pl-0 sm:pl-0 pr-4 sm:pr-6">
              {isLoading && leads.length === 0 ? (
                <div className="w-full space-y-4 px-6">
                  <Skeleton className="h-32 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
              ) : timelineData.length > 0 ? (
                <ChartContainer
                  config={barChartConfig}
                  className="w-full h-full min-h-[250px] aspect-video sm:aspect-auto"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={timelineData}>
                      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value.slice(0, 5)}
                        className="text-xs text-slate-500"
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        className="text-xs text-slate-500"
                        allowDecimals={false}
                      />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <p className="text-sm text-slate-400">Sem dados suficientes</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
