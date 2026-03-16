import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Security Verification (only allow authorized requests, like pg_cron or dashboard testing)
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${supabaseServiceKey}`) {
    // Basic protection to prevent unauthorized triggering
    return new Response(JSON.stringify({ error: 'Unauthorized. Service Role Key required.' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, follow_up_enabled, follow_up_template')
      .eq('follow_up_enabled', true)

    if (profileError) throw profileError

    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No active automations configured.' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      )
    }

    let processedCount = 0
    const now = Date.now()
    const thresholdMs = 72 * 60 * 60 * 1000 // 72 hours

    for (const profile of profiles) {
      const { data: leads, error: leadsError } = await supabase
        .from('leads')
        .select('id, name, phone, created_at, status')
        .eq('user_id', profile.id)

      if (leadsError || !leads) continue

      for (const lead of leads) {
        if (!lead.phone) continue

        // Skip leads that seem closed based on generic status strings
        const s = lead.status.toLowerCase()
        if (s.includes('ganh') || s.includes('perdid') || s.includes('won') || s.includes('lost'))
          continue

        // Last outgoing message
        const { data: messages } = await supabase
          .from('messages')
          .select('timestamp')
          .eq('lead_id', lead.id)
          .eq('direction', 'outgoing')
          .order('timestamp', { ascending: false })
          .limit(1)

        // Last movement or previous follow up
        const { data: history } = await supabase
          .from('lead_history')
          .select('timestamp')
          .eq('lead_id', lead.id)
          .in('action_type', ['moved', 'follow_up_sent'])
          .order('timestamp', { ascending: false })
          .limit(1)

        const lastMsgTime = messages?.[0]?.timestamp ? new Date(messages[0].timestamp).getTime() : 0
        const lastHistTime = history?.[0]?.timestamp ? new Date(history[0].timestamp).getTime() : 0
        const createdTime = new Date(lead.created_at).getTime()

        const lastInteraction = Math.max(lastMsgTime, lastHistTime, createdTime)

        if (now - lastInteraction > thresholdMs) {
          const messageTemplate =
            profile.follow_up_template ||
            'Olá [Name], notei que não conversamos nos últimos dias. Gostaria de tirar alguma dúvida pendente?'
          const messageText = messageTemplate
            .replace(/\[Name\]/gi, lead.name)
            .replace(/{name}/gi, lead.name)

          // 1. Send Follow up message
          await supabase.from('messages').insert({
            lead_id: lead.id,
            phone: lead.phone,
            message_text: messageText,
            direction: 'outgoing',
            read: true,
          })

          // 2. Record history
          await supabase.from('lead_history').insert({
            lead_id: lead.id,
            action_type: 'follow_up_sent',
            description: `Lembrete automático enviado via WhatsApp: ${messageText}`,
            user_id: profile.id,
          })

          processedCount++
        }
      }
    }

    return new Response(JSON.stringify({ success: true, processed_leads: processedCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Follow-up automation error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
