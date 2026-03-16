-- Create lead_history table
CREATE TABLE public.lead_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('created', 'moved', 'message_received', 'note_added')),
    description TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create notes table
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lead_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Enable all access for authenticated users history" ON public.lead_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for authenticated users notes" ON public.notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trigger Function: Log Lead Created
CREATE OR REPLACE FUNCTION public.log_lead_created() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.lead_history (lead_id, action_type, description, user_id)
    VALUES (NEW.id, 'created', 'Lead criado', NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_lead_created
AFTER INSERT ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.log_lead_created();

-- Trigger Function: Log Lead Moved
CREATE OR REPLACE FUNCTION public.log_lead_moved() 
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Using current_setting to get auth.uid if available, fallback to NEW.user_id
        INSERT INTO public.lead_history (lead_id, action_type, description, user_id)
        VALUES (
            NEW.id, 
            'moved', 
            OLD.status || ' → ' || NEW.status, 
            COALESCE(NULLIF(current_setting('request.jwt.claim.sub', true), ''), NEW.user_id::text)::uuid
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_lead_moved
AFTER UPDATE OF status ON public.leads
FOR EACH ROW EXECUTE FUNCTION public.log_lead_moved();

-- Trigger Function: Log Message Received
CREATE OR REPLACE FUNCTION public.log_message_received() 
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.direction = 'incoming' AND NEW.lead_id IS NOT NULL THEN
        INSERT INTO public.lead_history (lead_id, action_type, description)
        VALUES (NEW.lead_id, 'message_received', NEW.message_text);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_message_received
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.log_message_received();

-- Trigger Function: Log Note Added
CREATE OR REPLACE FUNCTION public.log_note_added() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.lead_history (lead_id, action_type, description, user_id)
    VALUES (NEW.lead_id, 'note_added', NEW.content, NEW.user_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_note_added
AFTER INSERT ON public.notes
FOR EACH ROW EXECUTE FUNCTION public.log_note_added();
