import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BrainCircuit, RefreshCw, Loader2, Sparkles, CheckCircle2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import useWhatsAppStore from '@/stores/useWhatsAppStore'
import { AISuggestion } from '@/types'

interface SuggestionWithLead extends AISuggestion {
  leads?: {
    name: string
    phone: string | null
  }
}

export function AIInsightsPanel() {
  const [suggestions, setSuggestions] = useState<SuggestionWithLead[]>([])
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const { setActiveChatId, isOpen, toggleSidebar } = useWhatsAppStore()

  const fetchSuggestions = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ai_suggestions' as any)
        .select('*, leads(name, phone)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.warn('Database error fetching suggestions:', error.message || error)
        return
      }

      if (data && Array.isArray(data)) {
        setSuggestions(data as SuggestionWithLead[])
      } else {
        setSuggestions([])
      }
    } catch (err: any) {
      console.warn('Failed to load AI insights:', err.message || err)
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const handleAnalyze = async () => {
    setAnalyzing(true)
    try {
      const { data, error } = await supabase.functions.invoke('gemini-analysis-handler')

      if (error) {
        console.warn('Edge Function Error (Gemini):', error.message || error)
        toast.error(
          'Serviço de IA temporariamente indisponível. A funcionalidade será restaurada em breve.',
        )
        return
      }

      if (data?.error) {
        console.warn('Gemini Analysis Error:', data.error)
        toast.error('Erro ao gerar insights. Verifique se há dados suficientes.')
        return
      }

      toast.success('Análise concluída com sucesso!')
      fetchSuggestions()
    } catch (err: any) {
      console.warn('Unexpected error during Gemini analysis:', err.message || err)
      toast.error('Erro de conexão ao solicitar insights da IA.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleApplyAction = async (suggestion: SuggestionWithLead) => {
    if (suggestion.lead_id && suggestion.leads?.phone) {
      const phoneDigits = suggestion.leads.phone.replace(/\D/g, '')
      setActiveChatId(phoneDigits)
      if (!isOpen) toggleSidebar()
    }

    try {
      const { error } = await supabase
        .from('ai_suggestions' as any)
        .update({ status: 'applied' })
        .eq('id', suggestion.id)

      if (error) {
        console.warn('Error applying AI action:', error.message || error)
        toast.error('Não foi possível arquivar o insight no momento.')
        return
      }

      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id))
      toast.success('Ação aplicada e insight arquivado!')
    } catch (e: any) {
      console.warn('Exception applying AI action:', e.message || e)
      toast.error('Erro ao aplicar ação.')
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive/15 text-destructive hover:bg-destructive/20 border-destructive/20'
      case 'medium':
        return 'bg-orange-500/15 text-orange-600 hover:bg-orange-500/20 border-orange-500/20'
      default:
        return 'bg-blue-500/15 text-blue-600 hover:bg-blue-500/20 border-blue-500/20'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Alta Prioridade'
      case 'medium':
        return 'Média Prioridade'
      default:
        return 'Baixa Prioridade'
    }
  }

  const hasSuggestions = Array.isArray(suggestions) && suggestions.length > 0

  return (
    <div className="w-full bg-accent/30 border-b border-border p-4 sm:p-6 shrink-0 flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              AI Intelligent Insights
            </h2>
            <p className="text-xs text-muted-foreground">
              Sugestões proativas baseadas em padrões de conversão
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAnalyze}
          disabled={analyzing}
          className="gap-2 rounded-xl h-10 w-full sm:w-auto shrink-0 bg-background hover:bg-accent"
        >
          {analyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>{analyzing ? 'Analisando Dados...' : 'Gerar Novos Insights'}</span>
        </Button>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-2 kanban-scroll">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="min-w-[320px] w-[320px] shrink-0 animate-pulse border-border/50 shadow-sm h-[180px]"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-full pr-4">
                    <div className="h-4 w-2/3 bg-muted rounded"></div>
                    <div className="h-3 w-1/2 bg-muted rounded"></div>
                  </div>
                  <div className="h-5 w-16 bg-muted rounded-full shrink-0"></div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <div className="h-16 w-full bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !hasSuggestions ? (
        <div className="text-sm text-muted-foreground bg-card border border-dashed border-border/60 rounded-xl p-8 text-center flex flex-col items-center gap-3 shadow-sm">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <BrainCircuit className="h-6 w-6 text-muted-foreground/70" />
          </div>
          <div className="max-w-md">
            <p className="font-medium text-foreground mb-1">Nenhum insight pendente</p>
            <p>
              A IA analisa seus leads e histórico para sugerir as melhores ações de conversão.
              Clique em "Gerar Novos Insights" para iniciar uma análise.
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="w-full whitespace-nowrap pb-2">
          <div className="flex gap-4 w-max">
            {suggestions.map((suggestion) => (
              <Card
                key={suggestion.id}
                className="w-[320px] sm:w-[360px] shrink-0 border-border/60 shadow-sm flex flex-col bg-card hover:bg-accent/10 transition-colors"
              >
                <CardHeader className="p-4 pb-3 flex flex-row items-start justify-between space-y-0 gap-2">
                  <div className="space-y-1 overflow-hidden">
                    <CardTitle className="text-[15px] font-semibold truncate text-foreground">
                      {suggestion.leads?.name || 'Insight Estratégico'}
                    </CardTitle>
                    <CardDescription className="text-[13px] truncate font-medium text-muted-foreground">
                      {suggestion.pattern_detected}
                    </CardDescription>
                  </div>
                  <Badge
                    className={cn(
                      'shrink-0 whitespace-nowrap font-semibold border',
                      getPriorityColor(suggestion.priority),
                    )}
                    variant="secondary"
                  >
                    {getPriorityLabel(suggestion.priority)}
                  </Badge>
                </CardHeader>
                <CardContent className="p-4 py-2 flex-1 whitespace-normal">
                  <p className="text-[14px] text-muted-foreground leading-relaxed line-clamp-3">
                    {suggestion.suggestion_text}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-3 flex justify-between items-center border-t border-border/40 mt-auto bg-muted/20">
                  <span className="text-[11px] text-muted-foreground font-medium">
                    {new Date(suggestion.created_at).toLocaleDateString('pt-BR')}
                  </span>
                  <Button
                    size="sm"
                    className="gap-1.5 h-8 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors rounded-lg font-semibold"
                    onClick={() => handleApplyAction(suggestion)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Aplicar Ação
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2.5 hidden sm:flex" />
        </ScrollArea>
      )}
    </div>
  )
}
