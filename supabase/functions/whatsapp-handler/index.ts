import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, phone, message } = await req.json()

    if (action === 'start') {
      // Simulated connection for demo purposes
      return new Response(JSON.stringify({ status: 'started' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'send') {
      // 1. Insert the outgoing message
      const { error: insertError } = await supabase.from('messages').insert({
        phone: phone,
        message_text: message,
        direction: 'outgoing',
        read: true,
      })

      if (insertError) throw insertError

      // 2. Simulate an auto-reply after a 1.5s delay to mock WhatsApp behavior
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const replyText = `[Automated Reply]: Obrigado pela sua mensagem! Esta é uma resposta automática simulada para: "${message}".`

      await supabase.from('messages').insert({
        phone: phone,
        message_text: replyText,
        direction: 'incoming',
        read: false,
      })

      return new Response(JSON.stringify({ status: 'sent', phone, message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
