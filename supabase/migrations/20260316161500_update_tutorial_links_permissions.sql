ALTER TABLE public.tutorial_links ALTER COLUMN video_url DROP NOT NULL;

DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.tutorial_links;

CREATE POLICY "Enable all access for authenticated users" 
ON public.tutorial_links FOR ALL TO authenticated 
USING (true) WITH CHECK (true);
