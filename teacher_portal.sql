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
