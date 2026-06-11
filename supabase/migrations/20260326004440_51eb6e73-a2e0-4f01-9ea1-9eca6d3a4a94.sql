
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'corretor', 'financeiro', 'gerente');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  creci TEXT DEFAULT '',
  avatar_url TEXT DEFAULT '',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create role_permissions table for granular module access
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  module TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (role, module)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 5. Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. Function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS SETOF app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

-- 7. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. RLS Policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admins can update all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 9. RLS Policies for user_roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 10. RLS Policies for role_permissions
CREATE POLICY "Anyone authenticated can view permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage permissions"
  ON public.role_permissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 11. Insert default permissions for all roles
INSERT INTO public.role_permissions (role, module, can_view, can_edit, can_delete) VALUES
  -- Admin: full access
  ('admin', 'dashboard', true, true, true),
  ('admin', 'imoveis', true, true, true),
  ('admin', 'usuarios', true, true, true),
  ('admin', 'condominios', true, true, true),
  ('admin', 'leads', true, true, true),
  ('admin', 'agenda', true, true, true),
  ('admin', 'relatorios', true, true, true),
  ('admin', 'configuracoes', true, true, true),
  ('admin', 'canal_pro', true, true, true),
  ('admin', 'corretores', true, true, true),
  ('admin', 'financeiro', true, true, true),
  -- Gerente: most access
  ('gerente', 'dashboard', true, true, false),
  ('gerente', 'imoveis', true, true, true),
  ('gerente', 'usuarios', true, false, false),
  ('gerente', 'condominios', true, true, false),
  ('gerente', 'leads', true, true, true),
  ('gerente', 'agenda', true, true, true),
  ('gerente', 'relatorios', true, true, false),
  ('gerente', 'configuracoes', false, false, false),
  ('gerente', 'canal_pro', true, true, false),
  ('gerente', 'corretores', true, true, false),
  ('gerente', 'financeiro', true, false, false),
  -- Corretor: limited
  ('corretor', 'dashboard', true, false, false),
  ('corretor', 'imoveis', true, true, false),
  ('corretor', 'usuarios', false, false, false),
  ('corretor', 'condominios', false, false, false),
  ('corretor', 'leads', true, true, false),
  ('corretor', 'agenda', true, true, true),
  ('corretor', 'relatorios', false, false, false),
  ('corretor', 'configuracoes', false, false, false),
  ('corretor', 'canal_pro', false, false, false),
  ('corretor', 'corretores', false, false, false),
  ('corretor', 'financeiro', false, false, false),
  -- Financeiro
  ('financeiro', 'dashboard', true, false, false),
  ('financeiro', 'imoveis', true, false, false),
  ('financeiro', 'usuarios', false, false, false),
  ('financeiro', 'condominios', true, false, false),
  ('financeiro', 'leads', false, false, false),
  ('financeiro', 'agenda', true, true, false),
  ('financeiro', 'relatorios', true, true, false),
  ('financeiro', 'configuracoes', false, false, false),
  ('financeiro', 'canal_pro', false, false, false),
  ('financeiro', 'corretores', false, false, false),
  ('financeiro', 'financeiro', true, true, true);
