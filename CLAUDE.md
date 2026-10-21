@AGENTS.md

# CLAUDE.md - Agastya Curiosity Olympiad Project Master Guide

## Platform Overview
- **Project**: Agastya Curiosity Olympiad (curiosity-olympiad)
- **Organization**: Agastya International Foundation (Kuppam, Andhra Pradesh, rural science education)
- **Mission**: Convert science testing from passive rote recall into experiential, inquiry-based simulation labs ("Aah! Aha! Ha-ha!" philosophy).
- **Core Innovation**: 5-Axis Curiosity Quotient (CQ) behavioral telemetry tracking (Voluntary Seeking, Uncertainty Response, Directed Inquiry, Generative Inquiry, Exploration Range).

## Who This Is For (read before any UI work)
- Users are **rural government-school students** (grades 6–10), not private city-school students. Many barely read English.
- Keep it **light**: budget Android phones, 2G/3G, shared school lab devices. No heavy libraries, WebGL, or large assets.
- Keep it **playful** like Duolingo / Khan Academy / CodeDex: short steps, instant feedback, rewards, sounds.
- Use **very simple words** and short sentences; prefer icons and visuals over text. No technical or academic jargon in UI copy. All UI text should go through the 9-language i18n (`locales/*.json`: en, hi, te, ta, kn, ml, mr, bn, gu).

## Tech Stack & Commands
- **Framework**: Next.js 16.2.9 (App Router, Server Actions)
- **Build / Dev**: 
  - Dev: `npm run dev` (runs `next dev --webpack`)
  - Build: `npm run build` (runs `next build --webpack`)
  - Test: `npm test` (runs `node --test tests/**/*.test.mjs`)
  - Lint: `npm run lint` (runs `eslint`)
- **Important**: Next.js 16 requires the `--webpack` flag in this repo. `next.config.ts` sets `typescript.ignoreBuildErrors: true`, so a passing build does not mean the types check.
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`, `@theme` variables in `src/app/globals.css`).
- **Database**: Supabase (PostgreSQL 15, RLS policies, RPC functions, triggers).
- **Audio**: Procedural Web Audio API (`src/utils/webAudio.ts`) — zero downloaded audio assets.
- **Open inquiry / ML coding ("Quick Scientist's Thought")**: follows Agastya's "Measuring Curiosity in Digital Platform Environments" framework. Prompts and the Question Matrix live in `src/config/inquiryMatrix.ts` (document wording, do not edit without the Impact team). `submitInquiryResponse` in `src/app/actions/inquiry.ts` codes the answer via AI SDK 7 `generateText` + `Output.object` through the AI Gateway (`THOUGHT_CODING_MODEL`, default `google/gemini-2.5-flash-lite` because the Gateway free tier blocks Anthropic models; needs `AI_GATEWAY_API_KEY` locally or OIDC on Vercel) and saves it to `inquiry_responses` (`inquiry_responses.sql`). The model returns codes only, never a score or feedback; codes are not shown to students and do not affect XP or rank. Without a key, answers are saved with `coding_status = 'pending'`.
- **Fairness rule**: never score open-inquiry text by length, keywords or English wording. The CQ Generative Inquiry axis uses only the framework's Question generation and Generative extension rates from the codes.
- **Anomalies**: each experiment reports its built-in surprise with `useAnomalySignal(condition, recordAction)` (`src/components/SandboxEngine/useAnomalySignal.ts`); this switches the thought prompt to the "after anomaly" wording.
- **Practice feedback**: each question allows one try; the first tap locks the answer, plays `playCorrect`/`playWrong` (`src/utils/webAudio.ts`) and shows the right answer plus the question's `explanation`. The end-of-test screen is `src/components/Celebration.tsx` and only shows XP the server actually awarded (`xpAwarded`).
- **Daily goal**: 1 finished test per IST day (the same thing that keeps the streak). The dashboard ring and week dots use `hasCompletedActivityToday` and `streakWeekDots` (`src/utils/streakWeek.ts`).
- **Read-aloud**: `src/utils/speech.ts` uses the phone's own voice (Web Speech API, no downloads). `ReadAloud`/`SpeakButton` (`src/components/ReadAloud.tsx`) wrap questions, answer explanations and the Thought prompt; every experiment hint strip has an `<ObservationSpeaker />`. English text is read with an Indian English voice; a button hides when the phone has no voice for its language.
- **Learning path**: `/practice` with no test in the link shows `LearningPath` (`src/components/LearningPath.tsx`), a winding path over the 13 tests. Nothing is locked; the next unfinished test is highlighted and `?start=true` without a test id starts it. Stars use `starsFor` (`src/utils/learningPath.ts`). XP and streaks are still counted per test.
- **Streak freezes**: earned every 7 streak days (max 2); each one covers a missed day. Rules are `streakAfterLesson`/`currentStreak` in `src/utils/xpRules.ts`; only `applyXP` writes `user_gamification.streak_freezes`. Needs `phase1_streak_freeze.sql`; until it is run the app works without freezes (`isMissingFreezeColumn`).
- **Kuppu**: `src/components/KuppuGuide.tsx` (`KuppuAvatar`, `KuppuBubble`, one-time `KuppuTip`) uses `public/kuppu/face-128.webp` (4.6 KB). Never use the 846 KB `kuppu-mascot.jpg` in the UI.
- **Install (Add to Home Screen)**: `src/components/InstallPrompt.tsx` shows on the dashboard after the first finished test (Android install button, iPhone Share steps; "Not now" snoozes 7 days). Needs `public/manifest.json` + `public/icons/*`, linked from `metadata.manifest` in `src/app/layout.tsx`.
- **Teacher portal (`/schools`)**: real data only. Students join a school with the code they type at sign-up (`school_students`, filled by `handle_new_user`). Agastya staff add a school + teacher PIN with the admin form on `/schools` (needs `ADMIN_SECRET_KEY`); the PIN is stored as a salted scrypt hash, 5 wrong PINs lock it for 15 minutes. Sign-in sets a signed httpOnly `teacher_session` cookie (`src/utils/teacherSession.ts`); `src/app/actions/teacher.ts` always takes the school from that cookie, never from the browser, and reads with the service-role client. `schools` and `school_students` have RLS on with no policies. Class numbers come from `buildClassReport` (`src/utils/classReport.ts`). Needs `teacher_portal.sql`.
- Telemetry counters (reversals, slider moves) start at 0 for every test; never seed them, they become bonus XP.
- New UI text lives in the `learn`, `thought`, `path`, `kuppu`, `freeze`, `install`, `teacher`, `quests` and `badges` sections of `locales/*.json`.
- **Question translations**: the 117 questions, test names and 39 experiment names are in `public/i18n/questions/<lang>.json` (8 languages), drafted by `node scripts/translate-questions.mjs` (AI Gateway, Gemini) and checked by `checkQuestionFile` (`src/utils/questionI18n.ts`): same 4 options in the same order, numbers kept, target script, sane length. Re-run the script after adding or editing a question (it only redoes what fails). Files are `"reviewed": false` until a teacher checks them. The practice page loads only the student's language (`useQuestionTranslations`) and has an "English" switch.
- **Experiment text translations**: every word inside the 39 experiments (toolbars, labels on the pictures, hint strips, screen-reader labels) is in `src/components/SandboxEngine/sceneStrings.ts` (`SCENE_TEXT`, by group, with `{n}`-style placeholders), translated in `public/i18n/scenes/<lang>.json` by `node scripts/translate-scenes.mjs` (same checks as questions, plus placeholders must match). Scenes call `const { s, en } = useSceneText("<group>")`; never put English text straight into a level file. SVG labels use `<FitText en={en(key)}>{s(key)}</FitText>`, which squeezes a translation that is much wider than the English so it stays on the picture. `SandboxEngine` takes `textLang` (the practice page passes `"en"` when the English switch is on); the hint-strip speaker reads in that language. Units and symbols (m, °C, pH) stay in the scene code.
- **Daily quests & badges**: rules in `src/utils/questsBadges.ts`, checked and saved on the server (`src/app/actions/quests.ts`, `src/utils/badgeLedger.ts`); the quest chest gives `CHEST_XP` once per IST day. Nothing rewards the Quick Scientist's Thought (framework rule). Needs `phase2_quests_badges.sql`.
- **Offline cache**: `publicExcludes` in `next.config.ts` keeps big or optional files (avatars, language files, large photos) out of the service worker's first download. Add new large files there.
- `evaluateExperiment` in `src/app/actions/scoring.ts` is still unused, so `telemetry_logs` is never written.

## Critical Traps & Architectural Rules
1. **Exam UUIDs**:
   - `exam_submissions.exam_id` has a foreign key to `exams(id)`.
   - Each mock test N submits to `00000000-0000-0000-0000-0000000000NN` (`MOCK_TEST_EXAM_IDS` in `src/app/actions/exams.ts`); `…000` ("Curiosity Sandbox Mock Test") is the fallback. Never remove these rows.
   - `supabase_migration.sql` seeds `…000`–`…013`. Existing databases need `phase0_launch_fixes.sql` (Part 1) to add Tests 12 and 13.
2. **Avatar Storage**:
   - The `student_profiles` table does NOT have an `avatar_url` column!
   - `updateAvatar` in `src/app/actions/profile.ts` is an intentional stub returning `{ success: true }`.
   - Avatars are persisted in `localStorage` (`curiosity_avatar_url`) and fall back to deterministic DJB2 string hashing (`getDeterministicAvatar` in `src/utils/userAvatar.ts`). `getUserAvatar` only uses the cached avatar when `localStorage.curiosity_user_id` matches, to stop bleed between students on shared devices.
3. **Certificate Release**:
   - Rank #1 Merit Certificates are only downloadable by the champion of a **finished** daily/weekly cycle. `getLeaderboard` computes `pastDailyChampionId` / `pastWeeklyChampionId`. Daily/weekly cycles use India time via `src/utils/istTime.ts` (midnight IST, weeks start Monday); never use `getHours()`/`setHours()` style math on the server.
   - The "SPECIMEN" watermark is drawn by the UI (`CertificateModal.tsx`, leaderboard, profile, `/certificate-sample`), not by `certificateCanvas.ts`. `certificateCanvas.ts` renders the 1920×1358 PNG.
4. **Auth Duality (Descope OTP + Supabase)**:
   - Supports Descope passwordless OTP and Supabase auth.
   - `getSecureFallbackPassword(identifier)` in `src/app/(auth)/login/actions.ts` derives a password with HMAC-SHA256 over the lowercased email/phone, keyed by `SUPABASE_SERVICE_ROLE_KEY` → `AUTH_FALLBACK_SALT` → `DESCOPE_MANAGEMENT_KEY` → a hard-coded fallback, to bridge Descope users into Supabase.
   - Phones and usernames map to placeholder emails (`<digits>@phone.curiosityolympiad.org`, `<username>@username.curiosityolympiad.org`).
5. **Child Privacy (DPDP Act / COPPA)**:
   - Usernames cannot be emails or phone numbers. Enforced by `validateUsernameFormat` in `src/app/(auth)/login/actions.ts`.
   - Sign-up requires a school code and parental consent.
6. **Route Proxy**:
   - `src/proxy.ts` is the active Next.js 16 proxy. It guards `/dashboard`, `/profile`, `/tournaments`, `/leaderboard`, `/practice`, `/settings`, `/campus-map`, `/mock-h5p-content`. `/schools` is **not** guarded (it uses its own teacher PIN screen).
   - The root `proxy.ts` is an older duplicate.
   - The redirect is skipped by any `descope_session` cookie (not verified) or by `?review=true`.

7. **XP & Streaks (server-only)**:
   - All XP writes go through `applyXP` in `src/utils/xpLedger.ts`, using the service-role client (`src/utils/supabase/admin.ts`) when `SUPABASE_SERVICE_ROLE_KEY` is set. Never add a server action that takes an XP amount from the browser.
   - Mock-test XP is computed on the server in `submitMockTestAttempt` (`src/app/actions/exams.ts`) with the capped formula in `src/utils/xpRules.ts`, which the practice page reuses for display. Each test earns XP once per IST day; same-day retakes save the attempt but give 0 XP.
   - The daily login reward is a fixed 500 XP (`awardXP` ignores its amount argument).
   - Streaks count IST days with a finished practice test: `streak_days` + `last_login_date` (an IST `YYYY-MM-DD`). The daily login claim does not extend the streak. A streak shows as 0 once a whole day is missed.
   - Until `phase0_launch_fixes.sql` Part 2 is run in production, the RLS policies still let students edit their own `user_gamification` row directly.
8. **Icon Font Subset**:
   - Only the Material Symbols listed in `src/config/iconSubset.ts` are downloaded (~15 KB vs ~320 KB). A new icon must be added there (sorted), or it renders as plain text. `tests/iconSubset.test.mjs` checks this.

## Known Gaps (verify before relying on these features)
- **Unused modules**: `KuppuMascot.tsx`, `src/utils/aws.ts`, `REDEMPTION_RULES`, `checkTournamentQualification`. Level gating is also effectively off (`getUnlockedLevels` unlocks everything).
- `src/app/page.tsx` is not a landing page; it redirects to `/dashboard`.

## Key File Locations
- **Simulations Engine**: `src/components/SandboxEngine/` (13 level files in `levels/`, one per mock test, 3 experiments each = 39 experiments). Scenes are SVG with `viewBox="0 0 340 220"` so geometry holds on every screen; check changes at 360px, 768px and 1280px.
- **Behavioral Telemetry**: `src/components/SandboxEngine/useTelemetry.ts`
- **CQ Calculation**: `src/utils/cqScoring.ts`
- **Curriculum / Mock Tests**: `src/data/mockTestsData.ts` (13 master mock tests). The practice page keeps its own `MOCK_TESTS` list and 117 questions (`PRACTICE_QUESTIONS`, 9 per test) in `src/app/practice/page.tsx`; keep both in sync.
- **Scoring Config & AI Rubrics**: `src/config/scoringConfig.ts`
- **Server Actions**: `src/app/actions/` (`exams.ts`, `profile.ts`, `teacher.ts`, `inquiry.ts`, `scoring.ts`)
- **Procedural Sound**: `src/utils/webAudio.ts`
- **Canvas Certificates**: `src/utils/certificateCanvas.ts`
- **Database Schema & Migrations**: `supabase_migration.sql`, `teacher_portal.sql` (current `handle_new_user`; `auto_profile_trigger.sql` is superseded), `fix_rls_policies.sql`
- **Unit Tests**: `tests/` (144 tests across 17 test files)
