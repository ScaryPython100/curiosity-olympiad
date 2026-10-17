# Engineering Portfolio Dossier: Agastya Curiosity Olympiad

**Architect & Lead Engineer:** Kishan Alamuri  
**Live Production URL:** [curiosity-olympiad.vercel.app](https://curiosity-olympiad.vercel.app)  
**Source Code Repository:** [github.com/ScaryPython100/curiosity-olympiad](https://github.com/ScaryPython100/curiosity-olympiad)  
**Primary Discipline:** Systems Architecture, Edge Computing, Behavioral Telemetry & Computational Pedagogy  

---

```
                                SYSTEM ARCHITECTURE OVERVIEW
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                CLIENT RUNTIME (BROWSER / PWA)                          │
│  ┌───────────────────────┐  ┌─────────────────────────┐  ┌───────────────────────────┐ │
│  │   SandboxEngine       │  │   CQ Telemetry Engine   │  │   Web Audio Synthesizer   │ │
│  │ (33 Custom Math Sims) │  │  (5-Axis Behavioral Log)│  │ (Procedural Pulse & Waves)│ │
│  └───────────┬───────────┘  └────────────┬────────────┘  └─────────────┬─────────────┘ │
└──────────────┼───────────────────────────┼─────────────────────────────┼───────────────┘
               │                           │                             │
┌──────────────▼───────────────────────────▼─────────────────────────────▼───────────────┐
│                               NEXT.JS 16 EDGE RUNTIME                                  │
│  ┌──────────────────────────────────┐     ┌──────────────────────────────────────────┐ │
│  │ Next.js App Router & Middleware  │     │ Server Actions & Cryptographic Pipeline  │ │
│  │ (Session Guard & Edge Proxy)     │     │ (HMAC-SHA256 Salts, Admin Auth Guards)   │ │
│  └──────────────────┬───────────────┘     └────────────────────┬─────────────────────┘ │
└─────────────────────┼──────────────────────────────────────────┼───────────────────────┘
                      │                                          │
┌─────────────────────▼──────────────────────────────────────────▼───────────────────────┐
│                          PERSISTENCE & SECURITY (SUPABASE / POSTGRESQL)                │
│  ┌──────────────────────────────────┐     ┌──────────────────────────────────────────┐ │
│  │ Row Level Security (RLS) Policies│     │ Remote Procedure Calls (RPCs) & Triggers │ │
│  │ (School Code Multi-Tenant Scopes)│     │ (Atomic XP Transactions & CQ Profiling)  │ │
│  └──────────────────────────────────┘     └──────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Executive Summary & Problem Formulation

### 1.1 Context & Educational Problem Space
The **Agastya International Foundation** operates the world's largest mobile hands-on science education program, reaching over 15 million children across rural and semi-urban India. In resource-constrained classrooms, STEM education overwhelmingly defaults to rote memorization due to the absence of physical laboratory infrastructure.

The **Curiosity Olympiad** was conceived to invert this paradigm: converting science education from passive recall into **inquiry-driven, experiential exploration**. Unlike conventional competitive platforms that evaluate students exclusively through multiple-choice speed drills, the platform measures **how** a student learns—tracking hypothesis testing, parameter tinkering, resilience after failure, and conceptual reasoning.

### 1.2 Authorship Declaration
I served as the **sole systems architect and lead full-stack engineer** for the platform across its entire development lifecycle (100+ commits). I engineered the full stack independently:
- Mathematical and kinematic simulation models for 33 interactive laboratory experiments.
- A proprietary 5-axis behavioral telemetry engine calculating a multidimensional **Curiosity Quotient (CQ)**.
- Edge proxy routing, cryptographic authentication pipelines, and zero-trust certificate release mechanics.
- A fully relational PostgreSQL schema with Row-Level Security (RLS) policies, idempotent migrations, and atomic state transitions.

---

## 2. Technical Innovations & Platform Capabilities

### 2.1 Physics & Kinetic Sandbox Engine (Zero-Engine Web Simulation)
Rather than importing heavy 3D WebGL runtimes (e.g., Three.js, Babylon.js) that trigger thermal throttling and out-of-memory crashes on low-spec mobile chipsets, I designed a **canvas-free, mathematically grounded simulation kernel** rendered entirely using hardware-accelerated SVG coordinates and standard DOM primitives.

- **33 Interactive Laboratory Modules:** Spanning 11 curricular domains—from Snell’s Law optical ray refraction, gravitational orbital velocity perturbations, and acid-base turmeric titration kinetics to acoustic wave resonance and biological phototropism.
- **Parametric State Modeling:** Every simulation exposes real-time independent variables (e.g., refractive indices, planetary mass ratios, thermal dissipation rates) through low-latency pointer interactions.
- **Hardware-Constrained Optimization:** Form-factored and rigorously tested to maintain a steady **60 FPS on budget Android hardware** (360px viewports, Mali/Adreno entry GPUs) with zero horizontal clipping and touch targets strictly $\ge 44\text{px}$.

| Domain | Underlying Mathematical Model | State Variables |
| :--- | :--- | :--- |
| **Optics & Refraction** | Snell's Law Vector Tracing: $n_1 \sin\theta_1 = n_2 \sin\theta_2$ | $n_1, n_2, \theta_1$ |
| **Orbital Mechanics** | Semi-Implicit Euler Step Integration: $\vec{a} = -\frac{GM}{r^3}\vec{r}$ | $G, M, r, v$ |
| **Acoustic Resonance** | Standing Wave Harmonic Synthesis: $f_n = \frac{n}{2L}\sqrt{\frac{T}{\mu}}$ | $L, T, \mu, n$ |

### 2.2 The 5-Axis Curiosity Quotient (CQ) Telemetry Engine
Standard grading rewards raw accuracy. The Curiosity Olympiad platform introduces a quantitative psychometric framework called the **Curiosity Quotient (CQ)**, powered by an active client-side telemetry engine:

$$\mathbf{CQ} = w_p \cdot P + w_e \cdot E + w_g \cdot G + w_r \cdot R + w_s \cdot S$$

1. **Exploration Depth ($E$):** Measures the breadth and variance of parameter manipulation prior to answering (e.g., testing extrema on a voltage slider or boundary conditions in buoyancy).
2. **Resilience / Grit ($G$):** Tracks recovery trajectories following erroneous predictions, penalizing rapid surrender and rewarding iterative hypothesis revision.
3. **Observation & Reflection ($R$):** Evaluates time spent studying simulation anomalies and the semantic depth of free-text hypothesis articulations.
4. **Precision ($P$):** Quantifies accuracy in targeted objective completions and empirical deductions.
5. **Efficiency ($S$):** Evaluates cognitive economy—distinguishing deliberate, goal-oriented exploration from random jitter.

- **Non-Blocking Telemetry Collection:** Implemented via a lightweight React hook (`useTelemetry.ts`) that records pointer deltas, slider settlements, tool switches, and simulation resets without incurring React re-render overhead.
- **Collision-Free Dynamic SVG Radar Visualization:** Vector projection engine translates multidimensional telemetry vectors into closed SVG polygon paths with zero third-party chart dependencies.

### 2.3 Web Audio API Procedural Sound Synthesis
In rural connectivity environments (2G/3G speeds), fetching binary MP3/WAV audio assets introduces latency and packet failure risks. 

To eliminate audio bandwidth consumption entirely, I engineered a **pure procedural audio synthesizer** using the browser's native **Web Audio API** (`src/utils/webAudio.ts`):
- **Stethoscope Heartbeat Synthesizer:** Chains low-frequency oscillator bursts (45 Hz–60 Hz) through a custom Biquad low-pass filter to procedurally generate variable-BPM cardiac "lub-dub" acoustics.
- **Acoustic Wave Simulations:** Simulates acoustic vibrations for resonance experiments (string telephone, terracotta *matka* tapping) by modulating triangle/sine wave oscillators and dynamic gain envelopes in real time.
- **Zero Network Payload:** $0\text{ KB}$ network overhead for sound assets across the entire application lifecycle.

### 2.4 Kuppam Campus Highway (Progressive SVG Gamification)
Replaced sterile percentage bars with a thematic visual highway tracing 11 real-world landmarks of Agastya’s 172-acre Kuppam Creativity Campus (e.g., Discovery Center, Bio-Diversity Park, Planetarium):
- **Parametric S-Curve Spline:** Calculates dynamic SVG path matrices with proportional vehicle orientation angles ($\theta = \arctan2(\Delta y, \Delta x)$) as student XP progresses from 0 to 10,000 XP.
- **Tiered Competition Architecture:** Separates an **Official Competitive Leaderboard** (tied to merit certification) from a **Friends Leaderboard** (casual, social learning tier) to prevent competitive anxiety among younger students.

---

## 3. Systems Architecture & Deep-Dive Engineering Challenges

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              FULL-STACK DATA & SECURITY FLOW                           │
│                                                                                        │
│  [Student Client]                                                                      │
│         │ (OTP Authentication via Mobile / Email)                                      │
│         ▼                                                                              │
│  [Descope Identity Provider] ──(Session Cookie)──► [Next.js Edge Proxy]                │
│                                                              │ (Validate Session)      │
│                                                              ▼                         │
│  [Supabase Auth (Postgres)] ◄──(HMAC-SHA256 Salted Sync)── [Server Actions]            │
│         │                                                                              │
│         ├──► [RLS Policy Layer] (Filters records by authenticated user_id)             │
│         │                                                                              │
│         ├──► [PostgreSQL Database]                                                     │
│         │      ├── student_profiles (School code, consent timestamp, real name)        │
│         │      ├── user_gamification (XP, streaks, unlocked levels)                    │
│         │      └── exam_submissions (Exam scores, 5-axis CQ telemetry logs)            │
│         │                                                                              │
│         └──► [Time-Locked View / RPC]                                                  │
│                └── Checks: NOW() >= 00:01 AM (D+1) AND user_id = rank_1_user           │
│                      └── Returns Certificate Authorization Payload                     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Challenge 1: Enforcing Zero-Trust Certificate Generation
* **Problem:** Standard web apps render merit certificates directly on the client once a score threshold is crossed. This presents a critical vulnerability: client-side inspection or network tampering can spoof certificates or claim Rank #1 honors mid-day while the leaderboard is still volatile.
* **Architecture Solution:** 
  1. Moved eligibility enforcement entirely into a **time-locked database model**.
  2. Implemented strict business logic: A "Top Performer" certificate cannot be viewed or downloaded during the active day. Eligibility unlocks exclusively at **12:01 AM on the subsequent calendar day (D+1)** after the daily/weekly window has formally closed.
  3. Rendered on an isolated **HTML5 Canvas canvas pipeline** (`src/utils/certificateCanvas.ts`) with high-resolution 300 DPI exports, dynamic signature placeholders, specimen security watermarks for unranked previews, and deterministic audit hashes.

### Challenge 2: Multi-Tenant Data Isolation & Cross-Account Bleed
* **Problem:** In rural school computer labs, dozens of students share identical low-cost Android tablets or desktop Chromebooks. An early bug revealed that shared browser `localStorage` could leak cached school codes and user avatar mappings between subsequent student logins.
* **Architecture Solution:**
  1. Completely eradicated client-side profile hydration from local storage; refactored the pipeline to source identity exclusively from authenticated Supabase sessions and JWT metadata.
  2. Built **per-account scoped storage isolation** and engineered `TabSessionGuard.tsx` to detect concurrent tab mutations and purge residual states on session termination.
  3. Developed custom unit tests (`tests/userAvatar.test.mjs`) executing automated assertions against deterministic hashing algorithms (`DJB2`) to guarantee avatar stability and zero cache bleed across distinct user IDs.

### Challenge 3: Child Privacy Compliance & Cryptographic Fallback Pipelines
* **Problem:** Because the platform serves minors across India, collecting or publicly exposing Personally Identifiable Information (PII) violates statutory data privacy standards (DPDP Act / COPPA). Furthermore, students needed an OTP-based login flow that interfaced reliably with Supabase's strict relational auth schema.
* **Architecture Solution:**
  1. **Anonymous Deterministic Avatars:** Implemented a DJB2 string hashing utility that converts an abstract user ID into a deterministic mascot assignment, allowing social leaderboard rankings without storing or broadcasting profile images or personal names.
  2. **Consent Auditing:** Designed explicit parental and teacher consent tracking directly in the database registration transaction (`parental_consent_granted_at` timestamp).
  3. **Cryptographically Salted Auth Bridge:** When bridging passwordless Descope OTP sessions to Supabase service-role auth, I eliminated insecure static credentials by engineering an **HMAC-SHA256 salted fallback generator** (`getSecureFallbackPassword` in `actions.ts`) utilizing the server's private `SUPABASE_SERVICE_ROLE_KEY`.

### Challenge 4: High-Frequency Re-render Optimization
* **Problem:** During timed 15-minute mock olympiads, the exam interface tracks an elapsed countdown timer ticking every second. Initial profiling indicated that filtering the 99-question question bank and scanning experiment configurations on every clock tick was causing UI stutter on low-power devices.
* **Architecture Solution:**
  1. Converted multi-attribute array scans into pre-indexed $O(1)$ dictionary lookups (`EXPERIMENT_CONFIG_MAP`).
  2. Wrapped high-frequency question filters and active mock test selectors in strict `useMemo` hooks, decoupling time-counter state propagation from the assessment render tree.
  3. Batch-optimized database administration endpoints (`wipe-accounts/route.ts`), replacing sequential $O(N)$ HTTP/SQL loops with parallelized `Promise.allSettled` batches and SQL `.in("user_id", ids)` set operations.

---

## 4. Technical Stack & Engineering Specifications

| Layer | Technologies Used | Primary Purpose |
| :--- | :--- | :--- |
| **Frontend Runtime** | Next.js 16 (App Router), React 19, TypeScript | Server-side rendering, zero-bundle server actions |
| **Styling & Motion** | Tailwind CSS, Dynamic SVG, Hardware Transform Matrices | Zero-latency, 60fps budget mobile performance |
| **Audio Synthesis** | Web Audio API (AudioContext, Oscillators, Biquad Filters) | Bandwidth-free procedural sound wave generation |
| **Edge Routing & Auth** | Descope OTP, Next.js Middleware, HMAC-SHA256 Cryptographic Salts | Passwordless auth, edge session token preservation |
| **Persistence & Backend** | Supabase, PostgreSQL 15, Row-Level Security (RLS) | Relational integrity, multi-tenant school gating |
| **Offline Architecture** | Custom Service Worker (PWA), Cache Storage API | Offline caching & asset resilience in rural areas |
| **Quality Assurance** | Native Node.js Test Runner (`node:test`, `node:assert/strict`) | Fast, dependency-free unit verification (75ms) |

---

## 5. Verifiable Engineering Artifacts & Source Tree

```
curiosity-olympiad/
├── src/
│   ├── app/
│   │   ├── (auth)/login/actions.ts         # HMAC-SHA256 salted auth bridges & OTP verification
│   │   ├── api/admin/wipe-accounts/        # Batched admin account maintenance (Bearer-protected)
│   │   ├── practice/page.tsx               # Timed simulation runner with memoized dataset filtering
│   │   ├── tournaments/                    # Category-filtered competitive tournament engine
│   │   ├── privacy/ & terms/               # DPDP/COPPA compliance & parental consent documentation
│   │   └── certificate-sample/             # High-res canvas certificate generator with specimen guard
│   ├── components/
│   │   ├── SandboxEngine/                  # 33 interactive physics/chemistry mathematical simulations
│   │   │   ├── levels/                     # Optics, Gravity, Acoustics, Mechanics, Botany, Chemistry
│   │   │   └── useTelemetry.ts             # Non-blocking 5-axis user action telemetry recorder
│   │   ├── CuriosityQuotientCard.tsx       # Mathematical SVG radar projection for student CQ profiles
│   │   ├── ComingSoonOlympiadCard.tsx      # Final National Olympiad teaser integration
│   │   └── TabSessionGuard.tsx             # Multi-tab concurrency synchronization guard
│   ├── config/
│   │   └── scoringConfig.ts                # O(1) experiment lookup dictionaries & difficulty scaling
│   ├── utils/
│   │   ├── cqScoring.ts                    # 5-axis CQ normalization & standard deviation algorithms
│   │   ├── webAudio.ts                     # Web Audio API procedural acoustic synthesizers
│   │   ├── userAvatar.ts                   # DJB2 deterministic hashing & cache bleed safeguards
│   │   └── certificateCanvas.ts            # 300 DPI canvas rendering & security watermark pipeline
│   └── proxy.ts                            # Edge session validation middleware
├── tests/
│   ├── userAvatar.test.mjs                 # DJB2 hashing stability & cross-account bleed unit tests
│   └── authHook.test.mjs                   # Session parsing, cookie precedence & resilience tests
└── supabase_migration.sql                  # 450+ lines of idempotent DDL, RLS policies, & RPC functions
```

---

## 6. Personal Reflection & Next Horizons

Building the Agastya Curiosity Olympiad underscored the profound difference between building a conventional CRUD application and engineering a **resilient, real-world educational system**. Designing software for students in rural India forced me to treat every kilobyte of bandwidth, every millisecond of thread execution, and every pixel of viewport width as scarce resources. 

Through this project, I demonstrated that software engineering can redefine how scientific curiosity is quantified and cultivated—proving that world-class, mathematically rigorous digital laboratories can run smoothly on a $50 Android phone in the most remote corners of India.

In my undergraduate studies, I intend to deepen my research at the intersection of **low-latency edge systems**, **computational physics simulations**, and **automated cognitive telemetry**—designing scalable infrastructure that expands equitable access to computational tools globally.
