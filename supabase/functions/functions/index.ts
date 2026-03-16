import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

Deno.serve(async () => {
  return new Response(JSON.stringify({ status: 'ok', message: 'Function executed successfully' }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
