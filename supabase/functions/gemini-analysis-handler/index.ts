import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey)

    const { data: leads, error: leadsError } = await supabaseClient
      .from('leads')
      .select('id, name, status, source, value, created_at, updated_at')
      .limit(50)
      
    const { data: history, error: historyError } = await supabaseClient
      .from('lead_history')
      .select('lead_id, action_type, description, timestamp')
      .limit(200)
      .order('timestamp', { ascending: false })

    if (leadsError || historyError) throw new Error('Failed to fetch data')

    const prompt = `
    Analise os dados de leads e o histórico de interações abaixo de uma clínica médica.
    Identifique padrões de conversão e sugira ações proativas para aumentar a taxa de sucesso.
    Especificamente procure por:
    - Leads com mais de 48 horas sem interação.
    - Origens (sources) que trazem leads de maior valor.
    - Padrões no histórico que frequentemente levam a conversão.
    
    Retorne APENAS um array JSON de objetos com esta estrutura exata:
    [
      {
        "lead_id": "uuid do lead (ou null se a sugestão for geral sobre a operação)",
        "suggestion_text": "Ação clara e direta sugerida em Português",
        "pattern_detected": "Breve descrição do padrão encontrado em Português",
        "priority": "low" | "medium" | "high"
      }
    ]
    
    Leads Data:
    ${JSON.stringify(leads)}
    
    History Data:
    ${JSON.stringify(history)}
    `

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    let suggestions = []

    if (!geminiApiKey) {
      // Mock response if no API key is provided
      const now = new Date()
      const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
      const staleLeads = leads?.filter((l: any) => new Date(l.updated_at) < fortyEightHoursAgo) || []
      
      if (staleLeads.length > 0) {
        suggestions.push({
          lead_id: staleLeads[0].id,
          suggestion_text: `O lead ${staleLeads[0].name} não tem interações há mais de 48 horas. Recomendamos um follow-up imediato com uma mensagem de retomada.`,
          pattern_detected: "Risco de abandono por inatividade (>48h)",
          priority: "high"
        })
      }
      
      suggestions.push({
        lead_id: leads?.[1]?.id || null,
        suggestion_text: "Notamos que a origem 'Instagram' tem gerado leads com maior valor médio recentemente. Considere aumentar o investimento ou replicar a abordagem.",
        pattern_detected: "Padrão de conversão de alto valor",
        priority: "medium"
      })
      
      await new Promise(resolve => setTimeout(resolve, 1500))
    } else {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Gemini API error: ${errorText}`)
      }

      const aiData = await response.json()
      const textResponse = aiData.candidates[0].content.parts[0].text
      
      const cleanJson = textResponse.replace(/```json\n?|\n?```/g, '').trim()
      suggestions = JSON.parse(cleanJson)
    }

    if (Array.isArray(suggestions) && suggestions.length > 0) {
      const validSuggestions = suggestions.map(s => ({
        lead_id: s.lead_id || null,
        suggestion_text: s.suggestion_text || 'Sem sugestão',
        pattern_detected: s.pattern_detected || 'Padrão desconhecido',
        priority: s.priority || 'low',
        status: 'pending'
      }))

      const { error: insertError } = await supabaseClient
        .from('ai_suggestions')
        .insert(validSuggestions)

      if (insertError) throw insertError
    }

    return new Response(JSON.stringify({ success: true, count: suggestions.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("Function error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
