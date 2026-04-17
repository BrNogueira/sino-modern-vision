-- 1. Tabela de imóveis
CREATE TABLE public.imoveis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_imovel text NOT NULL UNIQUE,
  titulo_imovel text NOT NULL,
  tipo_imovel text NOT NULL,
  sub_tipo_imovel text NOT NULL,
  categoria_imovel text NOT NULL DEFAULT 'Padrão',
  tipo_oferta integer NOT NULL DEFAULT 1,
  modalidade text[] NOT NULL DEFAULT '{}',
  cep text NOT NULL DEFAULT '',
  estado text NOT NULL DEFAULT 'Rio Grande do Sul',
  cidade text NOT NULL DEFAULT '',
  zona text DEFAULT '',
  bairro text DEFAULT '',
  endereco text DEFAULT '',
  numero text DEFAULT '',
  complemento text DEFAULT '',
  latitude text DEFAULT '',
  longitude text DEFAULT '',
  preco_venda numeric,
  preco_aluguel numeric,
  iptu numeric,
  valor_condominio numeric,
  area_total numeric,
  area_util numeric,
  qtd_dormitorios integer,
  qtd_suites integer,
  qtd_banheiros integer,
  qtd_vagas integer,
  observacao text DEFAULT '',
  descricao_curta text DEFAULT '',
  fotos jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text DEFAULT '',
  link_tour_virtual text DEFAULT '',
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  garantias jsonb NOT NULL DEFAULT '{}'::jsonb,
  ano_construcao integer,
  proprietario_nome text DEFAULT '',
  proprietario_telefone text DEFAULT '',
  proprietario_email text DEFAULT '',
  proprietario_documento text DEFAULT '',
  ativo boolean NOT NULL DEFAULT true,
  destaque boolean NOT NULL DEFAULT false,
  exclusivo boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_imoveis_codigo ON public.imoveis(codigo_imovel);
CREATE INDEX idx_imoveis_ativo ON public.imoveis(ativo);
CREATE INDEX idx_imoveis_cidade_bairro ON public.imoveis(cidade, bairro);

ALTER TABLE public.imoveis ENABLE ROW LEVEL SECURITY;

-- Visualização pública dos imóveis ativos (site público)
CREATE POLICY "Anyone can view active imoveis"
  ON public.imoveis FOR SELECT
  USING (ativo = true);

-- Equipe autenticada vê todos
CREATE POLICY "Authenticated can view all imoveis"
  ON public.imoveis FOR SELECT
  TO authenticated
  USING (true);

-- Admin/gerente/corretor podem inserir
CREATE POLICY "Staff can insert imoveis"
  ON public.imoveis FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'gerente'::app_role)
    OR has_role(auth.uid(), 'corretor'::app_role)
  );

-- Admin/gerente/corretor podem editar
CREATE POLICY "Staff can update imoveis"
  ON public.imoveis FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'gerente'::app_role)
    OR has_role(auth.uid(), 'corretor'::app_role)
  );

-- Apenas admin/gerente podem deletar
CREATE POLICY "Admin gerente can delete imoveis"
  ON public.imoveis FOR DELETE
  TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'gerente'::app_role)
  );

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_imoveis_updated_at
  BEFORE UPDATE ON public.imoveis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Bucket de fotos (público para exibição no site)
INSERT INTO storage.buckets (id, name, public)
VALUES ('imoveis-fotos', 'imoveis-fotos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view imovel photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'imoveis-fotos');

CREATE POLICY "Staff can upload imovel photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'imoveis-fotos'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'gerente'::app_role)
      OR has_role(auth.uid(), 'corretor'::app_role)
    )
  );

CREATE POLICY "Staff can update imovel photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'imoveis-fotos'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'gerente'::app_role)
      OR has_role(auth.uid(), 'corretor'::app_role)
    )
  );

CREATE POLICY "Staff can delete imovel photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'imoveis-fotos'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'gerente'::app_role)
    )
  );