
-- Student profiles for gamification
CREATE TABLE public.student_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT 'Estudante',
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak_days integer NOT NULL DEFAULT 0,
  last_study_date date,
  total_study_minutes integer NOT NULL DEFAULT 0,
  learning_style text DEFAULT 'mixed',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Topic-level progress tracking (brain map)
CREATE TABLE public.student_topic_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key text NOT NULL,
  grade text NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  correct_count integer NOT NULL DEFAULT 0,
  wrong_count integer NOT NULL DEFAULT 0,
  total_attempts integer NOT NULL DEFAULT 0,
  avg_response_time_ms integer DEFAULT 0,
  mastery_percent integer NOT NULL DEFAULT 0,
  last_practiced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_key, grade, subject, topic)
);

-- Error tracking (lab de erros)
CREATE TABLE public.student_errors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key text NOT NULL,
  grade text NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  question_text text NOT NULL,
  wrong_answer text,
  correct_answer text,
  error_count integer NOT NULL DEFAULT 1,
  last_error_at timestamptz NOT NULL DEFAULT now(),
  resolved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Daily missions
CREATE TABLE public.daily_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key text NOT NULL,
  mission_date date NOT NULL DEFAULT CURRENT_DATE,
  missions jsonb NOT NULL DEFAULT '[]'::jsonb,
  completed_count integer NOT NULL DEFAULT 0,
  total_count integer NOT NULL DEFAULT 0,
  xp_reward integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_key, mission_date)
);

-- Battle challenges
CREATE TABLE public.battle_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_key text NOT NULL,
  challenger_name text NOT NULL DEFAULT 'Desafiante',
  opponent_key text,
  opponent_name text,
  subject text NOT NULL,
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  challenger_score integer NOT NULL DEFAULT 0,
  opponent_score integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  winner_key text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- School collective missions
CREATE TABLE public.school_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  target_count integer NOT NULL,
  current_count integer NOT NULL DEFAULT 0,
  reward_xp integer NOT NULL DEFAULT 100,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Exam reports (inteligencia coletiva)
CREATE TABLE public.exam_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key text NOT NULL,
  grade text NOT NULL,
  subject text NOT NULL,
  topics_appeared jsonb NOT NULL DEFAULT '[]'::jsonb,
  difficulty integer NOT NULL DEFAULT 3,
  exam_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Question bank
CREATE TABLE public.question_bank (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade text NOT NULL,
  subject text NOT NULL,
  topic text NOT NULL,
  question_text text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  correct_answer text NOT NULL,
  source text DEFAULT 'ai',
  difficulty integer NOT NULL DEFAULT 3,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Study sessions tracking
CREATE TABLE public.study_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_key text NOT NULL,
  grade text,
  subject text,
  topic text,
  duration_minutes integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  session_type text NOT NULL DEFAULT 'lesson'
);

-- Enable RLS on all tables
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Public read policies (writes go through edge functions with service role)
CREATE POLICY "Public read student_profiles" ON public.student_profiles FOR SELECT USING (true);
CREATE POLICY "Public read student_topic_progress" ON public.student_topic_progress FOR SELECT USING (true);
CREATE POLICY "Public read student_errors" ON public.student_errors FOR SELECT USING (true);
CREATE POLICY "Public read daily_missions" ON public.daily_missions FOR SELECT USING (true);
CREATE POLICY "Public read battle_challenges" ON public.battle_challenges FOR SELECT USING (true);
CREATE POLICY "Public read school_missions" ON public.school_missions FOR SELECT USING (true);
CREATE POLICY "Public read exam_reports" ON public.exam_reports FOR SELECT USING (true);
CREATE POLICY "Public read question_bank" ON public.question_bank FOR SELECT USING (true);
CREATE POLICY "Public read study_sessions" ON public.study_sessions FOR SELECT USING (true);
