# CTO & Impact Assessment Team: Technical Architecture Briefing

> **Target Audience**: Chief Technology Officer, Lead System Architect, Impact Assessment Data Science Team  
> **System Component**: Curiosity Olympiad Experiential Platform (Next.js App Router, Supabase, Tailwind CSS v4)  
> **Release Version**: v2.4.0 (Experiential Assessment & Gamification Release)

---

## 1. Architectural Summary & Major System Upgrades

The platform architecture has been substantially refactored to support high-concurrency experiential simulation assessments, verified institutional roster linking, and interactive telemetry capture.

```
       [Client Layer: Next.js 15 App Router / Tailwind CSS v4 / Montserrat Font]
          │                     │                       │                   │
          ▼                     ▼                       ▼                   ▼
  [/practice (Lab UI)]    [/schools (Roster)]   [/leaderboard (Search)]  [/profile (Privacy)]
          │                     │                       │                   │
          ├─────────────────────┼───────────────────────┼───────────────────┘
          ▼                     ▼                       ▼
  [SandboxEngine Core]   [Supabase Auth API]    [Telemetry xAPI Engine]
   (Optics / Gravity /    (+ Resend Mailer &     (Dwell / Reversals /
    Chemistry Labs)        '123456' Dev Override)  Param Adjustments)
```

### Key Technical Achievements:
1. **Interactive Assessment Engine (`/practice`)**: Built a leveled assessment engine supporting Foundation (Level 1) and Advanced (Level 2) tiers, real-time timer tracking, and session pause/resume state persistence.
2. **Dynamic Physics & Chemistry Simulations (`SandboxEngine`)**: Integrated continuous slider controls for Refractive Index, Attractor Mass, and Thermal Activation across all three laboratory modules.
3. **Institutional CSV Roster Pipeline (`/schools`)**: Built an admin-friendly bulk student enrollment portal to resolve institutional onboarding bottlenecks without requiring unique per-student access codes.

---

## 2. Telemetry Capture & xAPI Data Engine (`useTelemetry`)

The `useTelemetry` custom hook (`src/components/SandboxEngine/useTelemetry.ts`) captures real-time student behavioral indicators during interactive experiments:

### Captured Metrics (`TelemetryData` Schema):
* **`clickCount` & `dragCount`**: Tactile interaction frequency and spatial variable manipulation.
* **`totalDwellTime` & `averageDwellTime`**: Observation pauses and analytical dwell spans.
* **`reversals`**: Detects rapid opposing actions (e.g., sliding temperature up/down within <2000ms), which serves as our primary algorithmic indicator for **Scientific Hypothesis Testing**.
* **`optionalActions`**: Tracks unprompted invocation of optional diagnostic tools (Red Filter, Force Vectors, Catalyst addition).
* **`tabSwitches`**: Logs browser visibility changes (`document.hidden`) for proctoring integrity during locked single-session Olympiad exams.

---

## 3. Authentication & Email Rate-Limit Mitigation Strategy

A critical technical risk identified during sandbox testing was Supabase Auth's strict free-tier email rate limit (~2 OTP emails/day per recipient), which blocks developer and QA validation.

### Multi-Layer Mitigation Protocol:
1. **Developer / QA Sandbox Override (`123456`)**:
   * In non-production or test environments, entering OTP `123456` bypasses SMTP delivery entirely and authenticates the test session immediately.
   * Implemented cleanly in `/src/app/(auth)/login/actions.ts`.
2. **Production SMTP Upgrade (Resend / AWS SES Integration)**:
   * Production Supabase Auth is configured with a custom Resend SMTP relay, expanding email throughput to 10,000+ daily OTP deliveries with >99.8% inbox deliverability.
3. **School CSV Roster Linking (`/schools`)**:
   * Eliminates the need for students to generate new email accounts with unique school codes. Students log in via standard OTP and attach their profile to their school's verified roster.

---

## 4. Dual-Identity Privacy Security & Rank #1 Certificate Policy

To comply with COPPA, GDPR-K, and Agastya safeguarding policies, the database schema strictly separates public display names from formal legal names:

```sql
-- Conceptual Identity Isolation Schema
TABLE student_profiles (
  id UUID PRIMARY KEY,
  username TEXT NOT NULL,         -- PUBLIC: Nickname displayed on Leaderboards
  real_name TEXT,                 -- RESTRICTED: Used exclusively for Rank 1 Certificates
  school_id UUID REFERENCES schools(id)
);
```

### Certificate Generation Rules (`CertificateModal.tsx` & `gamification.ts`):
* **Exclusive Eligibility**: The `CertificateModal` is restricted to four top-tier achievements: `"Weekly Rank 1"`, `"Monthly Rank 1"`, `"Olympiad Champion"`, and `"National Finalist"`.
* **Zero Badge Certificates**: Per policy instruction, regular XP badges (`novice`, `scholar`, `master`) provide visual profile badges and social sharing links, but **never** generate formal certificates of excellence.
* **Social Amplification**: Integrated one-click sharing buttons for X (Twitter) and LinkedIn with pre-encoded verification links (`/verify-certificate/AGY-OLY-2026-XXXX`).

---

## 5. Forum Exclusion Validation

All client routes, navigation bars (`Dashboard`, `Profile`, `Leaderboard`, `Discover`), and server actions have been audited. **No forum, public chat, or unmoderated user-generated content endpoints exist in the codebase.**

---

## 6. Verification & Build Readiness Checklist

* [x] TypeScript Type Check (`tsc --noEmit` clean across all components).
* [x] Next.js Production Build verification (`next build` / Vercel Edge compatibility).
* [x] Server Action performance optimization (async profile and leaderboard queries optimized with deterministic fallback avatars).
