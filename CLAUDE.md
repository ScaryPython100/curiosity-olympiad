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
- **Open inquiry / ML coding ("Quick Scientist's Thought")**: follows Agastya's "Measuring Curiosity in Digital Platform Environments" framework. Prompts and the Question Matrix live in `src/config/inquiryMatrix.ts` (document wording, do not edit without the Impact team). `submitInquiryResponse` in `src/app/actions/inquiry.ts` codes the answer via AI SDK 7 `generateText` + `Output.object` through the AI Gateway (`THOUGHT_CODING_MODEL`, default `anthropic/claude-haiku-5.5`; needs `AI_GATEWAY_API_KEY` locally or OIDC on Vercel) and saves it to `inquiry_responses` (`inquiry_responses.sql`). The model returns codes only, never a score or feedback; codes are not shown to students and do not affect XP or rank. Without a key, answers are saved with `coding_status = 'pending'`.
- **Fairness rule**: never score open-inquiry text by length, keywords or English wording. The CQ Generative Inquiry axis uses only the framework's Question generation and Generative extension rates from the codes.
- **Anomalies**: each experiment reports its built-in surprise with `useAnomalySignal(condition, recordAction)` (`src/components/SandboxEngine/useAnomalySignal.ts`); this switches the thought prompt to the "after anomaly" wording.
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
- **Schools portal is mostly demo data**: 12 hard-coded Kuppam students, a live query that ignores the school code, and fixed CQ breakdown and milestones. `enrollStudentRoster` does not write to Supabase. `verifyTeacherPin` accepts any PIN of 6+ characters.
- **Unused modules**: `KuppuMascot.tsx`, `src/utils/aws.ts`, `REDEMPTION_RULES`, `checkTournamentQualification`. Level gating is also effectively off (`getUnlockedLevels` unlocks everything).
- `src/app/page.tsx` is not a landing page; it redirects to `/dashboard`.

## Key File Locations
- **Simulations Engine**: `src/components/SandboxEngine/` (13 level files in `levels/`, one per mock test, 3 experiments each = 39 experiments). Scenes are SVG with `viewBox="0 0 340 220"` so geometry holds on every screen; check changes at 360px, 768px and 1280px.
- **Behavioral Telemetry**: `src/components/SandboxEngine/useTelemetry.ts`
- **CQ Calculation**: `src/utils/cqScoring.ts`
- **Curriculum / Mock Tests**: `src/data/mockTestsData.ts` (13 master mock tests). The practice page keeps its own `MOCK_TESTS` list and 117 questions (`PRACTICE_QUESTIONS`, 9 per test) in `src/app/practice/page.tsx`; keep both in sync.
- **Scoring Config & AI Rubrics**: `src/config/scoringConfig.ts`
- **Server Actions**: `src/app/actions/` (`exams.ts`, `profile.ts`, `schools.ts`, `scoring.ts`)
- **Procedural Sound**: `src/utils/webAudio.ts`
- **Canvas Certificates**: `src/utils/certificateCanvas.ts`
- **Database Schema & Migrations**: `supabase_migration.sql`, `auto_profile_trigger.sql`, `fix_rls_policies.sql`
- **Unit Tests**: `tests/` (89 tests across 12 test files)
