import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { session_id, message, platform = 'website', user_id } = await req.json()

    if (!session_id || message === undefined) {
      throw new Error('session_id and message are required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, serviceKey)

    // Ensure we have a user_id to assign leads to (default to first profile if none provided)
    let targetUserId = user_id
    if (!targetUserId) {
      const { data: profiles } = await supabase.from('profiles').select('id').limit(1)
      if (profiles && profiles.length > 0) targetUserId = profiles[0].id
    }

    // Fetch state from previous interaction
    const { data: lastInteractions } = await supabase
      .from('chatbot_interactions')
      .select('*')
      .eq('session_id', session_id)
      .order('created_at', { ascending: false })
      .limit(1)

    const lastInteraction = lastInteractions?.[0]
    let currentState = lastInteraction?.metadata?.state || 'GREETING'
    let collectedName = lastInteraction?.metadata?.name || ''
    let collectedPhone = lastInteraction?.metadata?.phone || ''
    let currentLeadId = lastInteraction?.lead_id || null

    let botResponse = ''
    let msgLower = message.toLowerCase()

    // 1. FAQ Check (Priority)
    const isFAQ =
      msgLower.includes('horário') ||
      msgLower.includes('hora') ||
      msgLower.includes('preço') ||
      msgLower.includes('valor') ||
      msgLower.includes('local') ||
      msgLower.includes('endereço')

    if (isFAQ) {
      if (msgLower.includes('horário') || msgLower.includes('hora')) {
        botResponse = 'Nosso horário de funcionamento é de Segunda a Sexta, das 08h às 18h.'
      } else if (msgLower.includes('preço') || msgLower.includes('valor')) {
        botResponse =
          'Os valores variam conforme a especialidade. Por favor, deixe seu contato se ainda não o fez, ou ligue para nossa recepção.'
      } else if (msgLower.includes('local') || msgLower.includes('endereço')) {
        botResponse = 'Estamos localizados no Centro Médico Empresarial, Sala 402, São Paulo - SP.'
      }
    } else {
      // 2. State Machine for Lead Capture
      if (currentState === 'GREETING') {
        botResponse = 'Olá! Bem-vindo ao nosso atendimento automatizado. Como posso chamar você?'
        currentState = 'ASK_NAME'
      } else if (currentState === 'ASK_NAME') {
        collectedName = message
        botResponse = `Prazer, ${collectedName}! Qual o seu telefone com DDD para contato?`
        currentState = 'ASK_PHONE'
      } else if (currentState === 'ASK_PHONE') {
        collectedPhone = message
        botResponse =
          'Obrigado! Um de nossos especialistas entrará em contato. Como posso ajudar agora?'
        currentState = 'READY'

        // Create or Update Lead
        if (targetUserId) {
          const { data: existingLeads } = await supabase
            .from('leads')
            .select('id')
            .eq('phone', collectedPhone)
            .eq('user_id', targetUserId)
            .limit(1)

          if (existingLeads && existingLeads.length > 0) {
            currentLeadId = existingLeads[0].id
            await supabase.from('lead_history').insert({
              lead_id: currentLeadId,
              action_type: 'message_received',
              description: 'Lead interagiu com o Chatbot Automatizado.',
              user_id: targetUserId,
            })
          } else {
            const { data: newLead } = await supabase
              .from('leads')
              .insert({
                name: collectedName,
                phone: collectedPhone,
                source: platform === 'website' ? 'Chatbot Website' : 'WhatsApp Chatbot',
                status: 'Novo Contato',
                user_id: targetUserId,
              })
              .select()
              .single()

            if (newLead) {
              currentLeadId = newLead.id
              await supabase.from('lead_history').insert({
                lead_id: currentLeadId,
                action_type: 'message_received',
                description: 'Novo lead capturado via Chatbot.',
                user_id: targetUserId,
              })
            }
          }
        }
      } else if (currentState === 'READY') {
        botResponse =
          'Mensagem recebida. Nossa equipe fará a triagem e retornará em breve. Tem mais alguma dúvida?'
      }
    }

    // 3. Store interaction
    const metadata = { state: currentState, name: collectedName, phone: collectedPhone }
    await supabase.from('chatbot_interactions').insert({
      session_id,
      lead_id: currentLeadId,
      user_message: message,
      bot_response: botResponse,
      platform,
      metadata,
    })

    return new Response(JSON.stringify({ reply: botResponse, state: currentState }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
