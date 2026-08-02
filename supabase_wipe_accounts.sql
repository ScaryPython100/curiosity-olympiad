-- ==============================================================================
-- AGASTYA CURIOSITY OLYMPIAD: TEST ACCOUNT DATA WIPE SCRIPT
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- This will wipe out all accounts and their data while EXCLUDING ScaryPython692
-- ==============================================================================

-- 1. Delete gamification records first (using student_profiles lookup)
DELETE FROM public.user_gamification
WHERE id NOT IN (
  SELECT id FROM public.student_profiles WHERE LOWER(username) = 'scarypython692'
) AND user_id NOT IN (
  SELECT id FROM public.student_profiles WHERE LOWER(username) = 'scarypython692'
);

-- 2. Delete exam submissions
DELETE FROM public.exam_submissions
WHERE user_id NOT IN (
  SELECT id FROM public.student_profiles WHERE LOWER(username) = 'scarypython692'
);

-- 3. Delete student profile records
DELETE FROM public.student_profiles
WHERE LOWER(username) <> 'scarypython692';

-- 4. Remove auth users
DELETE FROM auth.users
WHERE email NOT IN (
  'scarypython692@phone.curiosityolympiad.org'
) AND email NOT LIKE '%scarypython692%';

-- ==============================================================================
-- 5. CREATE REUSABLE ADMIN RPC FUNCTION FOR WEBHOOKS & API ENDPOINTS
-- ==============================================================================
-- Installing this function allows your backend (/api/admin/wipe-accounts)
-- to wipe test accounts automatically anytime.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.wipe_test_accounts(admin_username TEXT DEFAULT 'ScaryPython692')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- 1. Delete gamification
  DELETE FROM public.user_gamification
  WHERE id NOT IN (
    SELECT id FROM public.student_profiles WHERE LOWER(username) = LOWER(admin_username)
  ) AND user_id NOT IN (
    SELECT id FROM public.student_profiles WHERE LOWER(username) = LOWER(admin_username)
  );

  -- 2. Delete exam submissions
  DELETE FROM public.exam_submissions
  WHERE user_id NOT IN (
    SELECT id FROM public.student_profiles WHERE LOWER(username) = LOWER(admin_username)
  );

  -- 3. Delete student profiles
  DELETE FROM public.student_profiles
  WHERE LOWER(username) <> LOWER(admin_username);

  -- 4. Delete auth users
  DELETE FROM auth.users
  WHERE email NOT IN (
    admin_username || '@phone.curiosityolympiad.org'
  ) AND email NOT LIKE '%' || admin_username || '%';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'deleted_profiles_count', deleted_count,
    'message', 'All accounts wiped except ' || admin_username
  );
END;
$$;


