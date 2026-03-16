import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

// Ensure 32 bytes for AES-256
const ENCRYPTION_KEY = Deno.env.get('LGPD_ENCRYPTION_KEY') || '0123456789abcdef0123456789abcdef'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

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
  if (!text) return text
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data)
    const combined = new Uint8Array(iv.length + encrypted.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encrypted), iv.length)
    return arrayBufferToBase64(combined.buffer)
  } catch (e) {
    console.error('[LGPD-Handler] Error encrypting text', e)
    throw new Error('Encryption failed')
  }
}

async function decryptText(encryptedBase64: string, key: CryptoKey) {
  if (!encryptedBase64) return encryptedBase64
  try {
    const combinedBuffer = base64ToArrayBuffer(encryptedBase64)
    const combined = new Uint8Array(combinedBuffer)
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (e) {
    // If decryption fails, it might not be encrypted (legacy data)
    console.warn('[LGPD-Handler] Decryption failed for a string, returning raw data.')
    return encryptedBase64
  }
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests universally
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const bodyText = await req.text()
    if (!bodyText) {
      throw new Error('Empty request body')
    }

    const payload = JSON.parse(bodyText)
    const { action, items } = payload

    if (!action || !['encrypt', 'decrypt'].includes(action)) {
      throw new Error('Invalid action. Must be "encrypt" or "decrypt".')
    }

    if (!items || !Array.isArray(items)) {
      throw new Error('Invalid items format. Must be an array.')
    }

    const key = await getCryptoKey(ENCRYPTION_KEY)

    const processed = await Promise.all(
      items.map(async (item: any) => {
        let email = item.email || ''
        let phone = item.phone || ''

        if (action === 'encrypt') {
          email = await encryptText(email, key)
          phone = await encryptText(phone, key)
        } else if (action === 'decrypt') {
          email = await decryptText(email, key)
          phone = await decryptText(phone, key)
        }

        return { ...item, email, phone }
      }),
    )

    return new Response(JSON.stringify({ result: processed }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error(`[LGPD-Handler] Error processing request:`, error.message || error)
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
