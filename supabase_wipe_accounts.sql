-- ==============================================================================
-- AGASTYA CURIOSITY OLYMPIAD: TEST ACCOUNT DATA WIPE SCRIPT
-- ==============================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- This will wipe out all accounts and their data while EXCLUDING ScaryPython692
-- ==============================================================================

-- Get the ID of the admin user to prevent deleting their data
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM auth.users 
  WHERE LOWER(email) = 'scarypython692@phone.curiosityolympiad.org' 
     OR LOWER(email) LIKE '%scarypython692%' 
  LIMIT 1;

  -- If no auth user found, try student_profiles
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM public.student_profiles 
    WHERE LOWER(username) = 'scarypython692' 
    LIMIT 1;
  END IF;

  -- 1. Delete gamification records first (using both ID and user_id fields)
  DELETE FROM public.user_gamification
  WHERE (id <> admin_id OR user_id <> admin_id) OR admin_id IS NULL;

  -- 2. Delete exam submissions
  DELETE FROM public.exam_submissions
  WHERE user_id <> admin_id OR admin_id IS NULL;

  -- 3. Delete student profile records
  DELETE FROM public.student_profiles
  WHERE id <> admin_id OR admin_id IS NULL;

  -- 4. Remove auth users
  DELETE FROM auth.users
  WHERE id <> admin_id OR admin_id IS NULL;
END $$;

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
  admin_id UUID;
  deleted_count INTEGER;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_id FROM public.student_profiles 
  WHERE LOWER(username) = LOWER(admin_username) 
  LIMIT 1;

  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM auth.users 
    WHERE LOWER(email) LIKE '%' || LOWER(admin_username) || '%'
    LIMIT 1;
  END IF;

  -- 1. Delete gamification
  DELETE FROM public.user_gamification
  WHERE (id <> admin_id OR user_id <> admin_id) OR admin_id IS NULL;

  -- 2. Delete exam submissions
  DELETE FROM public.exam_submissions
  WHERE user_id <> admin_id OR admin_id IS NULL;

  -- 3. Delete student profiles
  DELETE FROM public.student_profiles
  WHERE id <> admin_id OR admin_id IS NULL;

  -- 4. Delete auth users
  DELETE FROM auth.users
  WHERE id <> admin_id OR admin_id IS NULL;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN json_build_object(
    'success', true,
    'deleted_profiles_count', deleted_count,
    'message', 'All accounts wiped except ' || admin_username
  );
END;
$$;

