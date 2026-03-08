
-- Student badges/achievements table
CREATE TABLE IF NOT EXISTS public.student_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key text NOT NULL,
  badge_id text NOT NULL,
  badge_name text NOT NULL,
  badge_icon text NOT NULL DEFAULT '🏆',
  badge_description text NOT NULL DEFAULT '',
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_key, badge_id)
);

ALTER TABLE public.student_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read student_badges" ON public.student_badges
  AS RESTRICTIVE FOR SELECT TO anon, authenticated USING (true);
