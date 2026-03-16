-- Add updated_at to notes
ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'pending',
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and add Policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all access for authenticated users tasks" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Update lead_history enum check to allow task_created
ALTER TABLE public.lead_history DROP CONSTRAINT IF EXISTS lead_history_action_type_check;
ALTER TABLE public.lead_history ADD CONSTRAINT lead_history_action_type_check CHECK (action_type IN ('created', 'moved', 'message_received', 'note_added', 'task_created'));

-- Create DB Trigger for task_created to history to ensure reliability
CREATE OR REPLACE FUNCTION public.log_task_created() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.lead_history (lead_id, action_type, description, user_id)
    VALUES (NEW.lead_id, 'task_created', NEW.title, NEW.assigned_to);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_task_created
AFTER INSERT ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.log_task_created();
