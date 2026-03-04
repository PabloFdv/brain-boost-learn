
-- Access keys table for the key-based auth system
CREATE TABLE public.access_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  created_by text NOT NULL DEFAULT 'admin',
  used boolean NOT NULL DEFAULT false,
  used_by text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  used_at timestamp with time zone,
  blocked boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;

-- Public read for login verification (handled server-side via edge function)
-- No direct client access needed - all operations go through edge functions
CREATE POLICY "No direct client access" ON public.access_keys FOR SELECT TO anon USING (false);
