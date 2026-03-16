import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

// Evolution API Configuration
const EVOLUTION_API_URL = Deno.env.get('EVOLUTION_API_URL') || ''
const EVOLUTION_API_KEY = Deno.env.get('EVOLUTION_API_KEY') || ''
const INSTANCE_NAME = 'clinicflow_main'
const USE_MOCK = !EVOLUTION_API_URL || !EVOLUTION_API_KEY

// In-memory mock state for demo purposes when env vars are missing
let mockState = 'disconnected'

async function evFetch(path: string, method = 'GET', body?: any) {
  const url = `${EVOLUTION_API_URL.replace(/\/$/, '')}${path}`
  const headers: Record<string, string> = { apikey: EVOLUTION_API_KEY }
  if (body) headers['Content-Type'] = 'application/json'

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  let data = {}
  try {
    data = JSON.parse(text)
  } catch (e) {
    // text response
  }
  return { ok: res.ok, status: res.status, data: data as any }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const bodyText = await req.text()
    const payload = bodyText ? JSON.parse(bodyText) : {}

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || anonKey
    const authHeader = req.headers.get('Authorization')

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader || '' } },
    })
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Handle Evolution Webhooks
    if (payload.event === 'messages.upsert' || payload.event === 'messages.update') {
      const msgs = payload.data?.messages || (payload.data?.message ? [payload.data.message] : [])

      for (const msgData of msgs) {
        if (!msgData) continue
        const remoteJid = msgData.key?.remoteJid || ''
        const fromMe = msgData.key?.fromMe || false

        if (remoteJid === 'status@broadcast') continue

        const phone = remoteJid.replace('@s.whatsapp.net', '').replace(/\D/g, '')
        const text =
          msgData.message?.conversation || msgData.message?.extendedTextMessage?.text || ''

        if (!text) continue

        const { data: leads } = await adminClient
          .from('leads')
          .select('id')
          .ilike('phone', `%${phone}%`)
          .limit(1)

        const leadId = leads?.[0]?.id || null

        await adminClient.from('messages').insert({
          lead_id: leadId,
          phone,
          message_text: text,
          direction: fromMe ? 'outgoing' : 'incoming',
          read: fromMe,
        })
      }
      return new Response(JSON.stringify({ success: true }), { headers: corsHeaders })
    }

    // Handle App Actions
    const { action, phone, message } = payload

    if (action === 'status') {
      if (USE_MOCK)
        return new Response(JSON.stringify({ status: mockState }), { headers: corsHeaders })

      const res = await evFetch(`/instance/connectionState/${INSTANCE_NAME}`)
      const state = res.data?.instance?.state || res.data?.state || 'disconnected'
      let mappedStatus = 'disconnected'
      if (state === 'open') mappedStatus = 'connected'
      else if (state === 'connecting') mappedStatus = 'connecting'

      return new Response(JSON.stringify({ status: mappedStatus }), { headers: corsHeaders })
    }

    if (action === 'start') {
      if (USE_MOCK) {
        mockState = 'qr'
        setTimeout(() => {
          mockState = 'connected'
        }, 6000)
        return new Response(
          JSON.stringify({
            status: 'qr',
            qr: 'https://img.usecurling.com/p/300/300?q=qr%20code&color=black',
          }),
          { headers: corsHeaders },
        )
      }

      // 1. Check existing state
      const stateRes = await evFetch(`/instance/connectionState/${INSTANCE_NAME}`)
      if (!stateRes.ok || stateRes.data?.state === 'close') {
        const host = req.headers.get('host') || ''
        const proto = req.headers.get('x-forwarded-proto') || 'https'
        const webhookUrl = `${proto}://${host}/functions/v1/whatsapp-handler`

        // 2. Create Instance if not exists
        await evFetch('/instance/create', 'POST', {
          instanceName: INSTANCE_NAME,
          qrcode: true,
          integration: 'WHATSAPP-BAILEYS',
        })

        // 3. Set Webhook
        await evFetch(`/webhook/set/${INSTANCE_NAME}`, 'POST', {
          webhook: {
            enabled: true,
            url: webhookUrl,
            byEvents: false,
            events: ['MESSAGES_UPSERT', 'CONNECTION_UPDATE'],
          },
        })
      }

      // 4. Get QR Code
      const connectRes = await evFetch(`/instance/connect/${INSTANCE_NAME}`)
      if (connectRes.data?.base64) {
        return new Response(JSON.stringify({ status: 'qr', qr: connectRes.data.base64 }), {
          headers: corsHeaders,
        })
      } else if (connectRes.data?.instance?.state === 'open') {
        return new Response(JSON.stringify({ status: 'connected' }), { headers: corsHeaders })
      }
      return new Response(JSON.stringify({ status: 'connecting' }), { headers: corsHeaders })
    }

    if (action === 'logout') {
      if (USE_MOCK) {
        mockState = 'disconnected'
        return new Response(JSON.stringify({ status: 'disconnected' }), { headers: corsHeaders })
      }

      await evFetch(`/instance/logout/${INSTANCE_NAME}`, 'DELETE')
      return new Response(JSON.stringify({ status: 'disconnected' }), { headers: corsHeaders })
    }

    if (action === 'send') {
      if (!phone || !message) throw new Error('Phone and message required')

      // Insert locally
      const { error: insertError } = await userClient.from('messages').insert({
        phone,
        message_text: message,
        direction: 'outgoing',
        read: true,
      })
      if (insertError)
        await adminClient
          .from('messages')
          .insert({ phone, message_text: message, direction: 'outgoing', read: true })

      if (!USE_MOCK) {
        await evFetch(`/message/sendText/${INSTANCE_NAME}`, 'POST', {
          number: phone,
          text: message,
        })
      }

      return new Response(JSON.stringify({ status: 'sent' }), { headers: corsHeaders })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: corsHeaders,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: corsHeaders,
    })
  }
})
