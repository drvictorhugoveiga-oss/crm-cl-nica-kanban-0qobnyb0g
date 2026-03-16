import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

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

  try {
    const payload = await req.json()

    // Handle manual invocation or Webhook payload
    const type = payload.type || 'INSERT'
    const table = payload.table
    const record = payload.record

    if (type === 'INSERT' && record) {
      let action_type = ''
      let description = ''

      if (table === 'notes') {
        action_type = 'note_added'
        description = record.content
      } else if (table === 'tasks') {
        action_type = 'task_created'
        description = record.title
      }

      if (action_type) {
        await supabase.from('lead_history').insert({
          lead_id: record.lead_id,
          action_type,
          description,
          user_id: record.user_id || record.assigned_to,
        })
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
