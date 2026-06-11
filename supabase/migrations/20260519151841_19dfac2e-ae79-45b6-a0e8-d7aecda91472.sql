CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to site_settings" 
  ON public.site_settings FOR SELECT 
  TO public 
  USING (true);

CREATE POLICY "Allow authenticated update to site_settings" 
  ON public.site_settings FOR UPDATE 
  TO authenticated 
  USING (true);

-- Insert default value
INSERT INTO public.site_settings (key, value, description)
VALUES ('hero_banner', '/assets/hero-banner.png', 'URL da imagem do banner principal da home');

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();