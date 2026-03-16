-- Ensure the profiles table exists and is correctly configured
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely insert the test user and profile to ensure data integrity
DO $$
DECLARE
  test_user_id uuid := '8d7ec039-e929-4216-866b-91610c60e127'::uuid;
BEGIN
  -- Insert the user into auth.users if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = test_user_id) THEN
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      test_user_id,
      '00000000-0000-0000-0000-000000000000',
      'test_profile_user@example.com',
      crypt('SecurePassword123!', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Usuário Teste"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  END IF;

  -- Insert the profile record
  INSERT INTO public.profiles (id, full_name, updated_at)
  VALUES (test_user_id, 'Usuário Teste', NOW())
  ON CONFLICT (id) DO NOTHING;
END $$;
