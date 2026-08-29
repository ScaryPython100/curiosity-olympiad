-- Run this in your Supabase SQL Editor to fix profile and mock test saving

-- 1. Enable RLS on student_profiles and allow inserts/updates
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.student_profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.student_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.student_profiles;
CREATE POLICY "Users can update their own profile" 
ON public.student_profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Enable RLS on user_gamification and allow inserts/updates
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own gamification data" ON public.user_gamification;
CREATE POLICY "Users can insert their own gamification data" 
ON public.user_gamification FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own gamification data" ON public.user_gamification;
CREATE POLICY "Users can update their own gamification data" 
ON public.user_gamification FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. Enable RLS on exam_submissions and allow inserts/updates
ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own exam submissions" ON public.exam_submissions;
CREATE POLICY "Users can insert their own exam submissions" 
ON public.exam_submissions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own exam submissions" ON public.exam_submissions;
CREATE POLICY "Users can view their own exam submissions" 
ON public.exam_submissions FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Create the dummy exam record to prevent foreign key errors for Mock Tests
-- We only include results_release_date as required by NOT NULL constraint
INSERT INTO public.exams (id, title, description, max_score, results_release_date)
VALUES (
  '00000000-0000-0000-0000-000000000000', 
  'Mock Test Playground', 
  'Dummy exam for sandbox/mock tests', 
  100, 
  NOW()
)
ON CONFLICT (id) DO NOTHING;
