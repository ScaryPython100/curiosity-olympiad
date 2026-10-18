-- ==============================================================================
-- PHASE 0 LAUNCH FIXES - run in Supabase SQL Editor on the EXISTING database
-- ==============================================================================
-- Part 1 is safe to run any time.
-- Part 2 must only be run AFTER SUPABASE_SERVICE_ROLE_KEY is set in the Vercel
-- project's environment variables and the new code is deployed. Otherwise XP
-- and streaks stop saving.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: Exam rows for Mock Tests 12 and 13
-- exam_submissions.exam_id has a foreign key to exams(id); without these rows,
-- every Test 12/13 submission fails.
-- ------------------------------------------------------------------------------
INSERT INTO public.exams (id, title, description, category, difficulty, duration_minutes, max_score, status, is_results_published, results_release_date)
VALUES
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
-- PART 2: Stop students editing their own XP from the browser
-- Today any signed-in student can update their own user_gamification row with
-- the public anon key and give themselves unlimited XP (and the Rank #1
-- certificate). After this, only the server (service role) can write XP;
-- everyone can still read it for the leaderboards. New rows keep coming from
-- the handle_new_user trigger (SECURITY DEFINER), which is not affected.
-- ------------------------------------------------------------------------------
-- DROP POLICY IF EXISTS "Users can update their own gamification data" ON public.user_gamification;
-- DROP POLICY IF EXISTS "Users can insert their own gamification data" ON public.user_gamification;
