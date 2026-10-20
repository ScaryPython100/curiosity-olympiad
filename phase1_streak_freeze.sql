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
