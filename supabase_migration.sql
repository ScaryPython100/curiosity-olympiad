-- ==============================================================================
-- AGASTYA CURIOSITY OLYMPIAD - FULL SUPABASE DATABASE MIGRATION SCRIPT
-- ==============================================================================
-- This script sets up all tables, foreign keys, constraints, indexes, triggers,
-- RPC functions, Row Level Security (RLS) policies, and system seed data required
-- to run the Curiosity Olympiad platform on a fresh Supabase project.
--
-- How to run:
-- 1. Open your new Supabase Project Dashboard.
-- 2. Go to SQL Editor -> New Query.
-- 3. Paste the entire content of this file and click "Run".
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------------------------

-- 1.1 student_profiles
-- Mirrors auth.users with public profile attributes (username, real_name).
CREATE TABLE IF NOT EXISTS public.student_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    real_name TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 1.2 user_gamification
-- Tracks player XP, levels, curiosity points, streaks, and reset cycles.
CREATE TABLE IF NOT EXISTS public.user_gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    curiosity_points INTEGER NOT NULL DEFAULT 0,
    streak_days INTEGER NOT NULL DEFAULT 1,
    last_login_date DATE,
    last_claimed_date TIMESTAMPTZ,
    daily_xp INTEGER NOT NULL DEFAULT 0,
    weekly_xp INTEGER NOT NULL DEFAULT 0,
    last_daily_reset TIMESTAMPTZ,
    last_weekly_reset TIMESTAMPTZ
);

-- 1.3 exams
-- Catalog of mock tests, olympiad exams, and interactive sandboxes.
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    difficulty TEXT,
    duration_minutes INTEGER DEFAULT 15,
    max_score INTEGER NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'published',
    is_results_published BOOLEAN NOT NULL DEFAULT false,
    results_release_date TIMESTAMPTZ NOT NULL
);

-- 1.4 exam_submissions
-- Records completed student attempts, scores, and rich telemetry payloads.
CREATE TABLE IF NOT EXISTS public.exam_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    score INTEGER NOT NULL DEFAULT 0,
    max_score INTEGER NOT NULL DEFAULT 0,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    telemetry_data JSONB,
    CONSTRAINT exam_submissions_user_exam_unique UNIQUE (user_id, exam_id)
);

-- 1.5 follows
-- Social follow relationships between students for the Friends leaderboard.
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT follows_user_pair_unique UNIQUE (follower_id, following_id)
);

-- 1.6 telemetry_logs (Optional / granular interaction logger)
CREATE TABLE IF NOT EXISTS public.telemetry_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL,
    base_score INTEGER DEFAULT 0,
    exploration_score INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    voluntary_trials INTEGER DEFAULT 0,
    continue_vs_leave TEXT,
    trigger_activated BOOLEAN DEFAULT FALSE,
    distinct_states_reached INTEGER DEFAULT 0,
    comparison_pattern_detected BOOLEAN DEFAULT FALSE,
    drag_entropy_score NUMERIC DEFAULT 0,
    total_time_seconds INTEGER DEFAULT 0,
    idle_time_seconds INTEGER DEFAULT 0,
    free_text_response TEXT,
    ml_score NUMERIC DEFAULT 0,
    epistemic_depth NUMERIC DEFAULT 0,
    inquiry_stage TEXT,
    ml_feedback TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW())
);

-- ------------------------------------------------------------------------------
-- 2. INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_student_profiles_username ON public.student_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON public.user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_xp ON public.user_gamification(xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_weekly_xp ON public.user_gamification(weekly_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_daily_xp ON public.user_gamification(daily_xp DESC);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_user_id ON public.exam_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_submissions_exam_id ON public.exam_submissions(exam_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON public.follows(following_id);

-- ------------------------------------------------------------------------------
-- 3. FUNCTIONS & TRIGGERS
-- ------------------------------------------------------------------------------

-- 3.1 Automatic Profile & Gamification Initialization on User Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the new user into student_profiles, extracting username and real_name from auth metadata
  INSERT INTO public.student_profiles (id, username, real_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Explorer'),
    COALESCE(NEW.raw_user_meta_data->>'real_name', 'Student')
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    real_name = EXCLUDED.real_name;

  -- Also initialize their gamification record
  INSERT INTO public.user_gamification (id, user_id, xp, curiosity_points, streak_days, daily_xp, weekly_xp)
  VALUES (NEW.id, NEW.id, 0, 0, 1, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3.2 RPC: Find User ID by Email (Security Definer for Forgot Password / Password Reset)
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(user_email TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM auth.users WHERE email = user_email LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.3 RPC: Find User ID by Phone (Security Definer)
CREATE OR REPLACE FUNCTION public.get_user_id_by_phone(user_phone TEXT)
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM auth.users WHERE phone = user_phone LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.4 RPC: Admin Test Account Cleanup (Optional maintenance function)
CREATE OR REPLACE FUNCTION public.wipe_test_accounts(admin_username TEXT DEFAULT 'ScaryPython692')
RETURNS JSONB AS $$
DECLARE
  deleted_count INTEGER := 0;
  target RECORD;
BEGIN
  FOR target IN 
    SELECT id, username FROM public.student_profiles 
    WHERE LOWER(username) != LOWER(admin_username)
  LOOP
    DELETE FROM public.exam_submissions WHERE user_id = target.id;
    DELETE FROM public.user_gamification WHERE user_id = target.id;
    DELETE FROM public.follows WHERE follower_id = target.id OR following_id = target.id;
    DELETE FROM public.student_profiles WHERE id = target.id;
    DELETE FROM auth.users WHERE id = target.id;
    deleted_count := deleted_count + 1;
  END LOOP;
  
  RETURN jsonb_build_object('deleted_count', deleted_count, 'admin_preserved', admin_username);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- 4.1 student_profiles
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view student profiles" ON public.student_profiles;
CREATE POLICY "Public can view student profiles"
  ON public.student_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.student_profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.student_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.student_profiles;
CREATE POLICY "Users can update their own profile"
  ON public.student_profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4.2 user_gamification
-- XP is written by server actions with the service-role key (src/utils/xpLedger.ts).
-- Once SUPABASE_SERVICE_ROLE_KEY is set in production, drop the student INSERT/UPDATE
-- policies below (see phase0_launch_fixes.sql, Part 2) so XP can't be edited from the browser.
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view leaderboard gamification" ON public.user_gamification;
CREATE POLICY "Public can view leaderboard gamification"
  ON public.user_gamification FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own gamification data" ON public.user_gamification;
CREATE POLICY "Users can insert their own gamification data"
  ON public.user_gamification FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own gamification data" ON public.user_gamification;
CREATE POLICY "Users can update their own gamification data"
  ON public.user_gamification FOR UPDATE
  USING (auth.uid() = user_id);

-- 4.3 exams
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published exams" ON public.exams;
CREATE POLICY "Public can view published exams"
  ON public.exams FOR SELECT
  USING (true);

-- 4.4 exam_submissions
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own exam submissions" ON public.exam_submissions;
CREATE POLICY "Users can view their own exam submissions"
  ON public.exam_submissions FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own exam submissions" ON public.exam_submissions;
CREATE POLICY "Users can insert their own exam submissions"
  ON public.exam_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own exam submissions" ON public.exam_submissions;
CREATE POLICY "Users can update their own exam submissions"
  ON public.exam_submissions FOR UPDATE
  USING (auth.uid() = user_id);

-- 4.5 follows
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view follow relationships" ON public.follows;
CREATE POLICY "Public can view follow relationships"
  ON public.follows FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can follow other users" ON public.follows;
CREATE POLICY "Users can follow other users"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow users" ON public.follows;
CREATE POLICY "Users can unfollow users"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- 4.6 telemetry_logs
ALTER TABLE public.telemetry_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own telemetry logs" ON public.telemetry_logs;
CREATE POLICY "Users can insert their own telemetry logs"
  ON public.telemetry_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own telemetry logs" ON public.telemetry_logs;
CREATE POLICY "Users can view their own telemetry logs"
  ON public.telemetry_logs FOR SELECT
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 5. SEED DATA - SANDBOX EXAM + 13 PRACTICE LAB MOCK TESTS
-- ------------------------------------------------------------------------------
INSERT INTO public.exams (id, title, description, category, difficulty, duration_minutes, max_score, status, is_results_published, results_release_date)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    'Curiosity Sandbox Mock Test',
    'An interactive sandbox to measure curiosity without academic boundaries.',
    'physics',
    'medium',
    90,
    100,
    'published',
    false,
    '2026-07-18 16:51:30.545+00'
  ),
  (
    '00000000-0000-0000-0000-000000000001',
    'Mock Test 1: Light & Sight',
    'Agastya Curiosity Practice Lab - Mock Test 1: Light & Sight (Optics & Reflections)',
    'Optics',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'Mock Test 2: Forces & Motion',
    'Agastya Curiosity Practice Lab - Mock Test 2: Forces & Motion (Gravity & Trajectory)',
    'Gravity',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'Mock Test 3: Heat & Fire',
    'Agastya Curiosity Practice Lab - Mock Test 3: Heat & Fire (Thermodynamics & Combustion)',
    'Chemistry',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    'Mock Test 4: Sensory Physics',
    'Agastya Curiosity Practice Lab - Mock Test 4: Sensory Physics',
    'Sensory',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    'Mock Test 5: Hypothesis Testing',
    'Agastya Curiosity Practice Lab - Mock Test 5: Hypothesis Testing',
    'Scientific Inquiry',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    'Mock Test 6: Sound & Vibration',
    'Agastya Curiosity Practice Lab - Mock Test 6: Sound & Vibration (Acoustics & Frequency)',
    'Sound',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000007',
    'Mock Test 7: Electricity & Magnetism',
    'Agastya Curiosity Practice Lab - Mock Test 7: Electricity & Magnetism (Circuits & Fields)',
    'Electricity',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000008',
    'Mock Test 8: Water & Buoyancy',
    'Agastya Curiosity Practice Lab - Mock Test 8: Water & Buoyancy (Fluids & Density)',
    'Buoyancy',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000009',
    'Mock Test 9: Kitchen Chemistry',
    'Agastya Curiosity Practice Lab - Mock Test 9: Kitchen Chemistry (Indicators & Solutions)',
    'Chemistry',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000010',
    'Mock Test 10: The Human Body',
    'Agastya Curiosity Practice Lab - Mock Test 10: The Human Body (Physiology & Reflexes)',
    'Sensory',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000011',
    'Mock Test 11: Plants & Growth',
    'Agastya Curiosity Practice Lab - Mock Test 11: Plants & Growth (Photosynthesis & Systems)',
    'Botany',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000012',
    'Mock Test 12: Day, Night & Earth''s Seasons',
    'Agastya Curiosity Practice Lab - Mock Test 12: Day, Night & Earth''s Seasons (Rotation, Tilt & Sundials)',
    'Astronomy',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  ),
  (
    '00000000-0000-0000-0000-000000000013',
    'Mock Test 13: The Solar System Scale',
    'Agastya Curiosity Practice Lab - Mock Test 13: The Solar System Scale (Distances & Orbits)',
    'Astronomy',
    'all-levels',
    15,
    9,
    'published',
    false,
    '2026-12-31 23:59:59+00'
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  difficulty = EXCLUDED.difficulty,
  duration_minutes = EXCLUDED.duration_minutes,
  max_score = EXCLUDED.max_score,
  status = EXCLUDED.status,
  is_results_published = EXCLUDED.is_results_published,
  results_release_date = EXCLUDED.results_release_date;

-- ------------------------------------------------------------------------------
-- 6. OPEN-INQUIRY RESPONSES (Quick Scientist's Thought) - see inquiry_responses.sql
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inquiry_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mock_test_id INTEGER NOT NULL CHECK (mock_test_id BETWEEN 1 AND 13),
    experiment_index INTEGER NOT NULL CHECK (experiment_index BETWEEN 0 AND 2),
    prompt_type TEXT NOT NULL CHECK (prompt_type IN ('common_anchor', 'next_investigation', 'after_anomaly')),
    prompt_text TEXT NOT NULL,
    response_text TEXT NOT NULL CHECK (char_length(response_text) BETWEEN 1 AND 600),
    anomaly_triggered BOOLEAN NOT NULL DEFAULT false,

    -- A. Epistemic depth (0-6) and B. Inquiry stage
    epistemic_depth SMALLINT CHECK (epistemic_depth BETWEEN 0 AND 6),
    inquiry_stage TEXT CHECK (inquiry_stage IN ('Notice', 'Wonder', 'Predict', 'Explore', 'Compare', 'Explain', 'Extend')),
    -- C. Analytic quality dimensions (0-2 each)
    evidence_grounding SMALLINT CHECK (evidence_grounding BETWEEN 0 AND 2),
    testability SMALLINT CHECK (testability BETWEEN 0 AND 2),
    causal_orientation SMALLINT CHECK (causal_orientation BETWEEN 0 AND 2),
    generativity SMALLINT CHECK (generativity BETWEEN 0 AND 2),
    transfer SMALLINT CHECK (transfer BETWEEN 0 AND 2),
    uncertainty_specificity SMALLINT CHECK (uncertainty_specificity BETWEEN 0 AND 2),

    coding_status TEXT NOT NULL DEFAULT 'pending' CHECK (coding_status IN ('pending', 'coded')),
    coding_model TEXT,
    coded_at TIMESTAMPTZ,
    human_codes JSONB, -- filled by trained raters for ML validation

    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    CONSTRAINT inquiry_responses_one_per_experiment UNIQUE (user_id, mock_test_id, experiment_index)
);

CREATE INDEX IF NOT EXISTS idx_inquiry_responses_user_id ON public.inquiry_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_inquiry_responses_pending ON public.inquiry_responses(coding_status) WHERE coding_status = 'pending';

ALTER TABLE public.inquiry_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Learners can view their own inquiry responses" ON public.inquiry_responses;
CREATE POLICY "Learners can view their own inquiry responses"
  ON public.inquiry_responses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can insert their own inquiry responses" ON public.inquiry_responses;
CREATE POLICY "Learners can insert their own inquiry responses"
  ON public.inquiry_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Learners can update their own inquiry responses" ON public.inquiry_responses;
CREATE POLICY "Learners can update their own inquiry responses"
  ON public.inquiry_responses FOR UPDATE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- STREAK FREEZES (Phase 1) - run once in the Supabase SQL Editor
-- ==============================================================================
-- A student earns 1 streak freeze each time their streak reaches 7, 14, 21...
-- days (they can hold up to 2). Each freeze covers one missed day, so a
-- missed day no longer resets the streak. Only the server changes this
-- column (through the service-role key in src/utils/xpLedger.ts).
--
-- Safe to run more than once. Until it is run, the app works as before
-- without freezes.
-- ==============================================================================

ALTER TABLE public.user_gamification
  ADD COLUMN IF NOT EXISTS streak_freezes SMALLINT NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_gamification_streak_freezes_range'
  ) THEN
    ALTER TABLE public.user_gamification
      ADD CONSTRAINT user_gamification_streak_freezes_range CHECK (streak_freezes BETWEEN 0 AND 2);
  END IF;
END $$;

-- ==============================================================================
-- TEACHER PORTAL - run once in the Supabase SQL Editor (safe to run again)
-- ==============================================================================
-- 1. schools:          one row per school, with a hashed teacher PIN.
-- 2. school_students:  which students belong to which school (from the school
--                      code they typed at sign-up).
-- 3. Backfill existing students and keep new sign-ups in sync (trigger).
--
-- Both tables have RLS on and NO policies: students and the browser can never
-- read them. Only the server (service-role key) does, after checking the
-- teacher's signed session cookie for that school.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.schools (
    code TEXT PRIMARY KEY CHECK (code = upper(code) AND code ~ '^[A-Z0-9][A-Z0-9-]{2,39}$'),
    name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
    teacher_pin_hash TEXT NOT NULL,
    failed_attempts SMALLINT NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.school_students (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    school_code TEXT NOT NULL,
    username TEXT,
    real_name TEXT,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW())
);
CREATE INDEX IF NOT EXISTS idx_school_students_code ON public.school_students(school_code);
ALTER TABLE public.school_students ENABLE ROW LEVEL SECURITY;

-- Existing students who typed a school code at sign-up
INSERT INTO public.school_students (user_id, school_code, username, real_name, joined_at)
SELECT
  u.id,
  upper(trim(u.raw_user_meta_data->>'school_code')),
  u.raw_user_meta_data->>'username',
  u.raw_user_meta_data->>'real_name',
  u.created_at
FROM auth.users u
WHERE coalesce(trim(u.raw_user_meta_data->>'school_code'), '') <> ''
ON CONFLICT (user_id) DO NOTHING;

-- New sign-ups: same as before, plus the school membership
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.student_profiles (id, username, real_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'Explorer'),
    COALESCE(NEW.raw_user_meta_data->>'real_name', 'Student')
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    real_name = EXCLUDED.real_name;

  INSERT INTO public.user_gamification (id, user_id, xp, curiosity_points, streak_days, daily_xp, weekly_xp)
  VALUES (NEW.id, NEW.id, 0, 0, 1, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  IF coalesce(trim(NEW.raw_user_meta_data->>'school_code'), '') <> '' THEN
    INSERT INTO public.school_students (user_id, school_code, username, real_name)
    VALUES (
      NEW.id,
      upper(trim(NEW.raw_user_meta_data->>'school_code')),
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'real_name'
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- DAILY QUESTS + BADGES - run once in the Supabase SQL Editor (safe to run again)
-- ==============================================================================
-- user_gamification.quest_chest_date: IST day the daily quest chest was opened
--   (one chest per day; the server checks this before giving XP).
-- user_gamification.quest_chests: how many chests a student has opened.
-- user_badges: badges a student has earned. Students can read their own;
--   only the server (service-role key) can add them.
-- ==============================================================================

ALTER TABLE public.user_gamification ADD COLUMN IF NOT EXISTS quest_chest_date DATE;
ALTER TABLE public.user_gamification ADD COLUMN IF NOT EXISTS quest_chests INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    badge_id TEXT NOT NULL CHECK (char_length(badge_id) BETWEEN 2 AND 40),
    earned_at TIMESTAMPTZ NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
    PRIMARY KEY (user_id, badge_id)
);
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Students can view their own badges" ON public.user_badges;
CREATE POLICY "Students can view their own badges"
  ON public.user_badges FOR SELECT
  USING (auth.uid() = user_id);
