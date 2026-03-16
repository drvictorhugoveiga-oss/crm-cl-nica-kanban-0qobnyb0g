import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  // 1. Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Parse request body safely
    const bodyText = await req.text()
    const payload = bodyText ? JSON.parse(bodyText) : {}
    const { action, phone, message } = payload

    // 3. Setup Supabase Clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || anonKey
    const authHeader = req.headers.get('Authorization')

    // Client running as the authenticated user (respects RLS)
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader || '' } },
    })

    // Client running as admin (bypasses RLS - needed for system auto-replies)
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    if (action === 'start') {
      return new Response(JSON.stringify({ status: 'started', message: 'Connection active' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'send') {
      if (!phone || !message) {
        throw new Error('Phone and message parameters are required.')
      }

      // A. Insert outgoing message (User Context)
      const { error: insertError } = await userClient.from('messages').insert({
        phone,
        message_text: message,
        direction: 'outgoing',
        read: true,
      })

      if (insertError) {
        console.warn('User insert failed, falling back to admin. Error:', insertError.message)
        // Fallback to admin client if user client fails but request is valid
        const { error: adminInsertError } = await adminClient.from('messages').insert({
          phone,
          message_text: message,
          direction: 'outgoing',
          read: true,
        })
        if (adminInsertError) throw new Error(`Database error: ${adminInsertError.message}`)
      }

      // B. Simulate incoming reply (Admin Context to bypass RLS for system actions)
      await new Promise((resolve) => setTimeout(resolve, 800))

      const replyText = `[Automated Reply]: Recebemos sua mensagem: "${message}". Esta é uma simulação de resposta.`

      const { error: replyError } = await adminClient.from('messages').insert({
        phone,
        message_text: replyText,
        direction: 'incoming',
        read: false,
      })

      if (replyError) {
        console.error('Failed to insert auto-reply:', replyError.message)
        // Non-fatal error, main action succeeded
      }

      return new Response(JSON.stringify({ status: 'sent', phone, message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action provided.' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Edge Function Exception:', error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
