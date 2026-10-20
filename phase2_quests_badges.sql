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
