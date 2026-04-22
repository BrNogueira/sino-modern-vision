-- Cria o usuário 4kconsultoriadigital@gmail.com diretamente no auth com senha temporária
-- O trigger handle_new_user (caso exista) cuidaria do profile/role; mas como não há trigger ativo, fazemos manualmente
DO $$
DECLARE
  new_user_id UUID;
  existing_id UUID;
BEGIN
  -- Verifica se já existe
  SELECT id INTO existing_id FROM auth.users WHERE email = '4kconsultoriadigital@gmail.com';
  
  IF existing_id IS NOT NULL THEN
    new_user_id := existing_id;
    -- Atualiza senha
    UPDATE auth.users
    SET encrypted_password = crypt('Admin@2026', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = existing_id;
  ELSE
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      '4kconsultoriadigital@gmail.com',
      crypt('Admin@2026', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"4K Consultoria Digital"}'::jsonb,
      now(), now(), '', '', '', ''
    );
  END IF;

  -- Garante profile
  INSERT INTO public.profiles (id, full_name, email, active)
  VALUES (new_user_id, '4K Consultoria Digital', '4kconsultoriadigital@gmail.com', true)
  ON CONFLICT (id) DO UPDATE SET active = true, email = EXCLUDED.email;

  -- Garante role admin
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'admin')
  ON CONFLICT DO NOTHING;
END $$;