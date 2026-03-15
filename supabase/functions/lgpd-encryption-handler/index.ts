import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Ensure 32 bytes for AES-256
const ENCRYPTION_KEY = Deno.env.get('LGPD_ENCRYPTION_KEY') || '0123456789abcdef0123456789abcdef'

async function getCryptoKey(secret: string) {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret.padEnd(32, '0').slice(0, 32))
  return await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, [
    'encrypt',
    'decrypt',
  ])
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function base64ToArrayBuffer(base64: string) {
  const binary_string = atob(base64)
  const len = binary_string.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i)
  }
  return bytes.buffer
}

async function encryptText(text: string, key: CryptoKey) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
  const combined = new Uint8Array(iv.length + encrypted.byteLength)
  combined.set(iv, 0)
  combined.set(new Uint8Array(encrypted), iv.length)
  return arrayBufferToBase64(combined.buffer)
}

async function decryptText(encryptedBase64: string, key: CryptoKey) {
  try {
    const combinedBuffer = base64ToArrayBuffer(encryptedBase64)
    const combined = new Uint8Array(combinedBuffer)
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (e) {
    return encryptedBase64 // Return original if decryption fails (e.g. not encrypted)
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, items } = await req.json()
    const key = await getCryptoKey(ENCRYPTION_KEY)

    const processed = await Promise.all(
      items.map(async (item: any) => {
        let email = item.email || ''
        let phone = item.phone || ''

        if (action === 'encrypt') {
          if (email) email = await encryptText(email, key)
          if (phone) phone = await encryptText(phone, key)
        } else if (action === 'decrypt') {
          if (email) email = await decryptText(email, key)
          if (phone) phone = await decryptText(phone, key)
        }

        return { ...item, email, phone }
      }),
    )

    return new Response(JSON.stringify({ result: processed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
