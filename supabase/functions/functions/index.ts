import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  return new Response(JSON.stringify({ status: 'ok', message: 'Function deployed successfully' }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
