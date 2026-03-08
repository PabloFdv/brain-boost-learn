
-- Global keys table: keys that can be used by multiple users with expiration
CREATE TABLE IF NOT EXISTS public.global_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL DEFAULT 'Key Global',
  created_by text NOT NULL DEFAULT 'admin',
  active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone,
  max_uses integer DEFAULT NULL,
  current_uses integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS for global_keys
ALTER TABLE public.global_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No direct client access global_keys" ON public.global_keys
  AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (false);
