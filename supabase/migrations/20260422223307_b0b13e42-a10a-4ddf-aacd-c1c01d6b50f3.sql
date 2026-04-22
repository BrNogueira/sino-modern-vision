-- 1. Tabela de categorias
CREATE TABLE public.categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descricao TEXT DEFAULT '',
  foto_url TEXT DEFAULT '',
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categorias_ordem ON public.categorias(ordem);
CREATE INDEX idx_categorias_ativo ON public.categorias(ativo);

ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Trigger updated_at
CREATE TRIGGER update_categorias_updated_at
BEFORE UPDATE ON public.categorias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
CREATE POLICY "Anyone can view active categorias"
ON public.categorias FOR SELECT
TO public
USING (ativo = true);

CREATE POLICY "Authenticated can view all categorias"
ON public.categorias FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin gerente can manage categorias"
ON public.categorias FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role));

-- 2. Vínculo em imoveis
ALTER TABLE public.imoveis
ADD COLUMN categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL;

CREATE INDEX idx_imoveis_categoria_id ON public.imoveis(categoria_id);

-- 3. Storage bucket público para fotos das categorias
INSERT INTO storage.buckets (id, name, public)
VALUES ('categorias', 'categorias', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Categorias photos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'categorias');

CREATE POLICY "Admin gerente can upload categoria photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'categorias'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
);

CREATE POLICY "Admin gerente can update categoria photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'categorias'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
);

CREATE POLICY "Admin gerente can delete categoria photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'categorias'
  AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'gerente'::app_role))
);