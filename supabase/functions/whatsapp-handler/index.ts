import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const bodyText = await req.text()
    const payload = bodyText ? JSON.parse(bodyText) : {}
    const { action, phone, message } = payload

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || anonKey
    const authHeader = req.headers.get('Authorization')

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader || '' } },
    })
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    if (action === 'start') {
      return new Response(JSON.stringify({ status: 'started', message: 'Connection active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'send') {
      if (!phone || !message) throw new Error('Phone and message parameters are required.')

      // A. Insert outgoing message
      const { error: insertError } = await userClient.from('messages').insert({
        phone,
        message_text: message,
        direction: 'outgoing',
        read: true,
      })

      if (insertError) {
        await adminClient.from('messages').insert({
          phone,
          message_text: message,
          direction: 'outgoing',
          read: true,
        })
      }

      // B. Simulate incoming reply interacting with Chatbot
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const simulatedUserMsg = 'Qual o horário de funcionamento?'

      await adminClient.from('messages').insert({
        phone,
        message_text: simulatedUserMsg,
        direction: 'incoming',
        read: false,
      })

      // Pass the simulated incoming message to the chatbot logic
      const { data: botRes } = await adminClient.functions.invoke('chatbot-handler', {
        body: { session_id: phone, message: simulatedUserMsg, platform: 'whatsapp' },
      })

      if (botRes && botRes.reply) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        await adminClient.from('messages').insert({
          phone,
          message_text: botRes.reply,
          direction: 'outgoing',
          read: true,
        })
      }

      return new Response(JSON.stringify({ status: 'sent', phone, message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Handles real webhooks from WhatsApp providers
    if (action === 'webhook_incoming') {
      if (!phone || !message) throw new Error('Phone and message required for webhook.')
      
      await adminClient.from('messages').insert({
        phone,
        message_text: message,
        direction: 'incoming',
        read: false,
      })

      const { data: botRes } = await adminClient.functions.invoke('chatbot-handler', {
        body: { session_id: phone, message, platform: 'whatsapp' },
      })

      if (botRes && botRes.reply) {
        await adminClient.from('messages').insert({
          phone,
          message_text: botRes.reply,
          direction: 'outgoing',
          read: true,
        })
      }

      return new Response(JSON.stringify({ status: 'processed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action provided.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
