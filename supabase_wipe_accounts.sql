-- ==============================================================================
-- AGASTYA CURIOSITY OLYMPIAD: TEST ACCOUNT DATA WIPE SCRIPT
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- This will wipe out all accounts and their data while EXCLUDING ScaryPython692
-- ==============================================================================

-- 1. Delete Gamification & Points data for all users except ScaryPython692
DELETE FROM public.user_gamification
WHERE id IN (
  SELECT id FROM public.student_profiles
  WHERE LOWER(username) <> 'scarypython692'
);

-- 2. Delete Exam Submissions & Scores for all users except ScaryPython692
DELETE FROM public.exam_submissions
WHERE user_id IN (
  SELECT id FROM public.student_profiles
  WHERE LOWER(username) <> 'scarypython692'
);

-- 3. Delete Profile records for all users except ScaryPython692
DELETE FROM public.student_profiles
WHERE LOWER(username) <> 'scarypython692';

-- 4. (Optional) Remove test users from Supabase auth.users except ScaryPython692
DELETE FROM auth.users
WHERE id IN (
  SELECT id FROM auth.users
  WHERE LOWER(email) <> 'scarypython692@phone.curiosityolympiad.org'
    AND LOWER(email) NOT LIKE '%scarypython692%'
);

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
  -- Delete gamification records
  DELETE FROM public.user_gamification
  WHERE id IN (
    SELECT id FROM public.student_profiles
    WHERE LOWER(username) <> LOWER(admin_username)
  );

  -- Delete exam submissions
  DELETE FROM public.exam_submissions
  WHERE user_id IN (
    SELECT id FROM public.student_profiles
    WHERE LOWER(username) <> LOWER(admin_username)
  );

  -- Delete student profiles
  DELETE FROM public.student_profiles
  WHERE LOWER(username) <> LOWER(admin_username);
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'deleted_profiles_count', deleted_count,
    'message', 'All accounts wiped except ' || admin_username
  );
END;
$$;
