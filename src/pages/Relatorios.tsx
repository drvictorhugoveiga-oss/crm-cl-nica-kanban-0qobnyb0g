import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

export default function Relatorios() {
  const { user } = useAuth()
  const [leads, setLeads] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<string>('30')

  useEffect(() => {
    if (!user) return

    const fetchReportData = async () => {
      setIsLoading(true)
      const days = parseInt(period)
      const dateFilter = new Date()
      dateFilter.setDate(dateFilter.getDate() - days)

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', dateFilter.toISOString())

      if (!error && data) {
        setLeads(data)
      }
      setIsLoading(false)
    }

    fetchReportData()
  }, [user, period])

  const stats = useMemo(() => {
    const sourceMap = new Map<
      string,
      { count: number; converted: number; revenue: number; cost: number }
    >()

    leads.forEach((lead) => {
      const source = lead.source || 'Desconhecido'
      const existing = sourceMap.get(source) || { count: 0, converted: 0, revenue: 0, cost: 0 }

      existing.count += 1
      if (lead.status === 'Convertido' || lead.status?.toLowerCase() === 'convertido') {
        existing.converted += 1
      }

      existing.revenue += Number(lead.value) || 0
      existing.cost += Number(lead.cost) || 0

      sourceMap.set(source, existing)
    })

    return Array.from(sourceMap.entries())
      .map(([source, data]) => {
        const conversionRate = data.count > 0 ? (data.converted / data.count) * 100 : 0
        return {
          source,
          ...data,
          conversionRate,
        }
      })
      .sort((a, b) => b.count - a.count)
  }, [leads])

  const pieChartConfig: ChartConfig = useMemo(() => {
    const config: any = {}
    stats.forEach((s, i) => {
      config[s.source] = {
        label: s.source,
        color: PIE_COLORS[i % PIE_COLORS.length],
      }
    })
    return config
  }, [stats])

  const pieData = stats.map((s, i) => ({
    name: s.source,
    value: s.count,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }))

  const renderROI = (revenue: number, cost: number) => {
    if (cost > 0) {
      const roi = ((revenue - cost) / cost) * 100
      return `${roi.toFixed(1)}%`
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      revenue - cost,
    )
  }

  return (
    <div className="p-4 sm:p-6 bg-background h-full overflow-y-auto w-full animate-fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              Relatórios de Desempenho
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Analise a distribuição de leads e o retorno sobre o investimento (ROI).
            </p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12 bg-muted/30 rounded-xl border border-border/50">
            <p className="text-muted-foreground">Nenhum lead encontrado neste período.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border flex flex-col">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Distribuição por Origem</CardTitle>
                <CardDescription>Volume de leads captados por canal</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex items-center justify-center min-h-[300px]">
                {pieData.length > 0 ? (
                  <ChartContainer
                    config={pieChartConfig}
                    className="w-full h-full aspect-square sm:aspect-auto"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={3}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">Sem dados suficientes</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border flex flex-col">
              <CardHeader>
                <CardTitle className="text-base text-foreground">Performance e ROI</CardTitle>
                <CardDescription>Métricas de conversão detalhadas por canal</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 sm:pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Origem</TableHead>
                      <TableHead className="text-center">Qtd. Leads</TableHead>
                      <TableHead className="text-center">Conversão</TableHead>
                      <TableHead className="text-right">ROI Estimado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.map((row) => (
                      <TableRow key={row.source}>
                        <TableCell className="font-medium">{row.source}</TableCell>
                        <TableCell className="text-center">{row.count}</TableCell>
                        <TableCell className="text-center">
                          {row.conversionRate.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-400">
                          {renderROI(row.revenue, row.cost)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
