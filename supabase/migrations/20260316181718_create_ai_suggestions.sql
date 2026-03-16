CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  suggestion_text TEXT NOT NULL,
  pattern_detected TEXT,
  priority TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all access for authenticated users ai_suggestions" 
ON public.ai_suggestions FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
