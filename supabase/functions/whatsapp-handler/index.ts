import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import makeWASocket, { DisconnectReason, useMultiFileAuthState } from 'npm:@whiskeysockets/baileys'
import { createClient } from 'npm:@supabase/supabase-js'
import pino from 'npm:pino'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

let sock: any = null

async function connectToWhatsApp() {
  if (sock) return sock

  const { state, saveCreds } = await useMultiFileAuthState('/tmp/baileys_auth_info')

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }) as any,
  })

  sock.ev.on('connection.update', (update: any) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) {
      console.log('QR Code received, please scan it in your function logs.')
    }
    if (connection === 'close') {
      const shouldReconnect =
        (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) {
        sock = null
        connectToWhatsApp()
      }
    } else if (connection === 'open') {
      console.log('Opened connection to WhatsApp')
    }
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async (m: any) => {
    const msg = m.messages[0]
    if (!msg.message || msg.key.fromMe) return

    const phone = msg.key.remoteJid?.split('@')[0]
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''

    if (phone && text) {
      await supabase.from('messages').insert({
        phone: phone,
        message_text: text,
        direction: 'incoming',
        read: false,
      })
    }
  })

  return sock
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, phone, message } = await req.json()

    if (action === 'start') {
      await connectToWhatsApp()
      return new Response(JSON.stringify({ status: 'started' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'send') {
      const socket = await connectToWhatsApp()
      const jid = `${phone}@s.whatsapp.net`

      await socket.sendMessage(jid, { text: message })

      await supabase.from('messages').insert({
        phone: phone,
        message_text: message,
        direction: 'outgoing',
        read: true,
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
