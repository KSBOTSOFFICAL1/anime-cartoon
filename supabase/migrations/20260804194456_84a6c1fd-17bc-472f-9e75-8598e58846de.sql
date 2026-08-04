CREATE TABLE public.admin_settings (
  id TEXT PRIMARY KEY DEFAULT 'admin',
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.admin_settings TO service_role;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;