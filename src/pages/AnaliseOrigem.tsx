import { useState, useEffect, useMemo } from 'react'
import { PieChart, Pie, Cell, Legend } from 'recharts'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface LeadData {
  id: string
  name: string
  source: string
  status: string
  value: number
  cost: number
  created_at: string
}

export default function AnaliseOrigem() {
  const { user } = useAuth()
  const [timeframe, setTimeframe] = useState('30')
  const [leads, setLeads] = useState<LeadData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLeads = async () => {
      if (!user) return
      setLoading(true)
      const date = new Date()
      date.setDate(date.getDate() - parseInt(timeframe))

      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', date.toISOString())

      if (!error && data) {
        setLeads(data as LeadData[])
      }
      setLoading(false)
    }

    fetchLeads()
  }, [timeframe, user])

  const chartConfig = {
    Google: { label: 'Google Ads', color: '#4285F4' },
    Instagram: { label: 'Instagram', color: '#E1306C' },
    Facebook: { label: 'Facebook', color: '#1877F2' },
    Referral: { label: 'Indicação', color: '#34A853' },
    WhatsApp: { label: 'WhatsApp', color: '#25D366' },
  }

  const processedData = useMemo(() => {
    const sourceMap: Record<
      string,
      { total: number; converted: number; value: number; cost: number }
    > = {}

    leads.forEach((lead) => {
      if (!sourceMap[lead.source]) {
        sourceMap[lead.source] = { total: 0, converted: 0, value: 0, cost: 0 }
      }
      sourceMap[lead.source].total += 1
      if (lead.status === 'converted') {
        sourceMap[lead.source].converted += 1
      }
      sourceMap[lead.source].value += Number(lead.value) || 0
      sourceMap[lead.source].cost += Number(lead.cost) || 0
    })

    const metrics = Object.entries(sourceMap)
      .map(([source, data]) => {
        const conversionRate = data.total > 0 ? (data.converted / data.total) * 100 : 0
        const roi =
          data.cost > 0
            ? ((data.value - data.cost) / data.cost) * 100
            : data.value > 0
              ? Infinity
              : 0
        return {
          source,
          total: data.total,
          conversionRate,
          roi,
          value: data.value,
          cost: data.cost,
        }
      })
      .sort((a, b) => b.total - a.total)

    const chart = metrics.map((m) => ({
      name: m.source,
      value: m.total,
      fill: chartConfig[m.source as keyof typeof chartConfig]?.color || '#8884d8',
    }))

    return { metrics, chart }
  }, [leads])

  return (
    <div className="h-full w-full overflow-y-auto bg-[#F8FAFC] p-4 sm:p-6 animate-fade-in relative">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Análise de Origem</h1>
            <p className="text-slate-500 text-sm mt-1">
              Acompanhe a performance dos canais de aquisição.
            </p>
          </div>
          <div className="w-[180px]">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="bg-white shadow-sm border-slate-200">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : leads.length === 0 ? (
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="h-[300px] flex flex-col items-center justify-center text-slate-500">
              <p>Nenhum lead encontrado para este período.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1 shadow-sm border-slate-200 flex flex-col">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Distribuição de Leads</CardTitle>
                <CardDescription>Percentual por canal</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                <ChartContainer config={chartConfig} className="w-full h-full aspect-square">
                  <PieChart>
                    <Pie
                      data={processedData.chart}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {processedData.chart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} stroke="transparent" />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">Métricas de Performance</CardTitle>
                <CardDescription>Detalhamento de conversão e ROI por origem</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Origem</TableHead>
                      <TableHead className="text-right">Quantidade</TableHead>
                      <TableHead className="text-right">Taxa de Conversão</TableHead>
                      <TableHead className="text-right">ROI Estimado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {processedData.metrics.map((row) => (
                      <TableRow key={row.source}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor:
                                  chartConfig[row.source as keyof typeof chartConfig]?.color ||
                                  '#8884d8',
                              }}
                            />
                            {chartConfig[row.source as keyof typeof chartConfig]?.label ||
                              row.source}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{row.total}</TableCell>
                        <TableCell className="text-right">
                          {row.conversionRate.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          <span
                            className={
                              row.roi > 0 ? 'text-emerald-600 font-medium' : 'text-slate-600'
                            }
                          >
                            {row.roi === Infinity ? '∞ (Custo Zero)' : `${row.roi.toFixed(1)}%`}
                          </span>
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
