
-- Condomínios table
CREATE TABLE public.condominios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  endereco TEXT DEFAULT '',
  bairro TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  estado TEXT DEFAULT 'RS',
  cep TEXT DEFAULT '',
  sindico TEXT DEFAULT '',
  telefone_sindico TEXT DEFAULT '',
  administradora TEXT DEFAULT '',
  valor_condominio NUMERIC DEFAULT 0,
  qtd_unidades INTEGER DEFAULT 0,
  qtd_blocos INTEGER DEFAULT 0,
  tem_portaria BOOLEAN DEFAULT false,
  tem_elevador BOOLEAN DEFAULT false,
  tem_piscina BOOLEAN DEFAULT false,
  tem_salao_festas BOOLEAN DEFAULT false,
  tem_churrasqueira BOOLEAN DEFAULT false,
  tem_academia BOOLEAN DEFAULT false,
  observacoes TEXT DEFAULT '',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.condominios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view condominios"
  ON public.condominios FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and gerentes can manage condominios"
  ON public.condominios FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gerente'));

-- Leads table
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT DEFAULT '',
  telefone TEXT DEFAULT '',
  origem TEXT DEFAULT 'site',
  interesse TEXT DEFAULT '',
  tipo_interesse TEXT DEFAULT 'compra',
  faixa_preco_min NUMERIC DEFAULT 0,
  faixa_preco_max NUMERIC DEFAULT 0,
  bairros_interesse TEXT DEFAULT '',
  observacoes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'novo',
  corretor_id UUID REFERENCES auth.users(id),
  imovel_interesse_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view leads"
  ON public.leads FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins gerentes corretores can manage leads"
  ON public.leads FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'gerente')
    OR public.has_role(auth.uid(), 'corretor')
  );
