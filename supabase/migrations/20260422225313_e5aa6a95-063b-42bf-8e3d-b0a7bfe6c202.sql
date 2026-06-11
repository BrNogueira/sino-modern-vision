ALTER TABLE public.condominios ADD COLUMN IF NOT EXISTS fotos jsonb NOT NULL DEFAULT '[]'::jsonb;

INSERT INTO storage.buckets (id, name, public)
VALUES ('condominios-fotos', 'condominios-fotos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view condominios fotos" ON storage.objects;
CREATE POLICY "Public can view condominios fotos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'condominios-fotos');

DROP POLICY IF EXISTS "Admin gerente can upload condominios fotos" ON storage.objects;
CREATE POLICY "Admin gerente can upload condominios fotos"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'condominios-fotos'
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'gerente'::app_role))
  );

DROP POLICY IF EXISTS "Admin gerente can update condominios fotos" ON storage.objects;
CREATE POLICY "Admin gerente can update condominios fotos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'condominios-fotos'
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'gerente'::app_role))
  );

DROP POLICY IF EXISTS "Admin gerente can delete condominios fotos" ON storage.objects;
CREATE POLICY "Admin gerente can delete condominios fotos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'condominios-fotos'
    AND (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'gerente'::app_role))
  );