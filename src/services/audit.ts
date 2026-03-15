import { supabase } from '@/lib/supabase/client'

export const logAudit = async (userId: string, action: string, details: any) => {
  if (!userId) return
  try {
    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      details,
    })
  } catch (err) {
    console.error('Audit log failed', err)
  }
}
