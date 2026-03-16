-- Add follow-up settings to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS follow_up_enabled BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS follow_up_template TEXT DEFAULT 'Olá [Name], notei que não conversamos nos últimos dias. Gostaria de tirar alguma dúvida pendente?';

-- Update lead_history check constraint to include 'follow_up_sent'
ALTER TABLE public.lead_history DROP CONSTRAINT IF EXISTS lead_history_action_type_check;
ALTER TABLE public.lead_history ADD CONSTRAINT lead_history_action_type_check 
CHECK (action_type IN ('created', 'moved', 'message_received', 'note_added', 'task_created', 'follow_up_sent'));
