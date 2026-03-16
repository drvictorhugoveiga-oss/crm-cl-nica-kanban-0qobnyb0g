CREATE TABLE public.chatbot_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL,
    session_id TEXT NOT NULL,
    user_message TEXT,
    bot_response TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    platform TEXT NOT NULL CHECK (platform IN ('website', 'whatsapp')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.chatbot_interactions ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
CREATE POLICY "Enable all access for authenticated users chatbot" 
    ON public.chatbot_interactions FOR ALL TO authenticated 
    USING (true) WITH CHECK (true);

CREATE POLICY "Enable insert for anon chatbot" 
    ON public.chatbot_interactions FOR INSERT TO anon 
    WITH CHECK (true);

CREATE POLICY "Enable select for anon chatbot session" 
    ON public.chatbot_interactions FOR SELECT TO anon 
    USING (true);
