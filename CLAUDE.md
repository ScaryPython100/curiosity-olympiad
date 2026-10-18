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
- **AI Evaluation (not wired up)**: `gradeFreeText` and `evaluateExperiment` in `src/app/actions/scoring.ts` use `@ai-sdk/google` (`gemini-1.5-pro`, an outdated model ID) via `generateObject`, but **nothing calls them**, so `telemetry_logs` is never written. `zod` is imported there but is not a direct dependency in `package.json`.

## Critical Traps & Architectural Rules
1. **Exam UUIDs**:
   - `exam_submissions.exam_id` has a foreign key to `exams(id)`.
   - Each mock test N submits to `00000000-0000-0000-0000-0000000000NN` (`MOCK_TEST_EXAM_IDS` in `src/app/actions/exams.ts`); `…000` ("Curiosity Sandbox Mock Test") is the fallback. Never remove these rows.
   - `supabase_migration.sql` only seeds `…000`–`…011`. Tests 12 and 13 (`…012`, `…013`) must be added to `exams` or their submissions fail the foreign key.
2. **Avatar Storage**:
   - The `student_profiles` table does NOT have an `avatar_url` column!
   - `updateAvatar` in `src/app/actions/profile.ts` is an intentional stub returning `{ success: true }`.
   - Avatars are persisted in `localStorage` (`curiosity_avatar_url`) and fall back to deterministic DJB2 string hashing (`getDeterministicAvatar` in `src/utils/userAvatar.ts`). `getUserAvatar` only uses the cached avatar when `localStorage.curiosity_user_id` matches, to stop bleed between students on shared devices.
3. **Certificate Release**:
   - Rank #1 Merit Certificates are only downloadable by the champion of a **finished** daily/weekly cycle. `getLeaderboard` computes `pastDailyChampionId` / `pastWeeklyChampionId`; resets use the server's local time (UTC on Vercel, not IST).
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

## Known Gaps (verify before relying on these features)
- **Practice page caps test IDs at 11**: `?mockTestId=12|13` falls back to Test 1 (`src/app/practice/page.tsx`, initial parse and URL effect).
- **XP is trusted from the client**: `addActivityXP(amount)` accepts any amount, and the RLS policies let users update their own `user_gamification` row.
- **Telemetry bonus starts inflated**: the practice page defaults to reversals = 2 and adjustments = 4 before any interaction.
- **Streaks never grow**: nothing updates `streak_days`.
- **Schools portal is mostly demo data**: 12 hard-coded Kuppam students, a live query that ignores the school code, and fixed CQ breakdown and milestones. `enrollStudentRoster` does not write to Supabase. `verifyTeacherPin` accepts any PIN of 6+ characters.
- **Unused modules**: `KuppuMascot.tsx`, `src/utils/aws.ts`, `REDEMPTION_RULES`, `checkTournamentQualification`. Level gating is also effectively off (`getUnlockedLevels` unlocks everything).
- `src/app/page.tsx` is not a landing page; it redirects to `/dashboard`.

## Key File Locations
- **Simulations Engine**: `src/components/SandboxEngine/` (13 level files in `levels/`, one per mock test, 3 experiments each = 39 experiments).
- **Behavioral Telemetry**: `src/components/SandboxEngine/useTelemetry.ts`
- **CQ Calculation**: `src/utils/cqScoring.ts`
- **Curriculum / Mock Tests**: `src/data/mockTestsData.ts` (13 master mock tests). The practice page keeps its own `MOCK_TESTS` list and 117 questions (`PRACTICE_QUESTIONS`, 9 per test) in `src/app/practice/page.tsx`; keep both in sync.
- **Scoring Config & AI Rubrics**: `src/config/scoringConfig.ts`
- **Server Actions**: `src/app/actions/` (`exams.ts`, `profile.ts`, `schools.ts`, `scoring.ts`)
- **Procedural Sound**: `src/utils/webAudio.ts`
- **Canvas Certificates**: `src/utils/certificateCanvas.ts`
- **Database Schema & Migrations**: `supabase_migration.sql`, `auto_profile_trigger.sql`, `fix_rls_policies.sql`
- **Unit Tests**: `tests/` (53 tests across 8 test files)
