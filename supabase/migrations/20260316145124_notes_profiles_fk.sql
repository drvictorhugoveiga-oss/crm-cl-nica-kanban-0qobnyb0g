ALTER TABLE public.notes
ADD CONSTRAINT notes_user_id_profiles_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;
