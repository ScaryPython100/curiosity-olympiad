# Agastya Academic & Assessment Council: Assessment Alignment Agenda

> **Date**: Q3 2026 Strategy Review  
> **Topic**: Transitioning the Curiosity Olympiad to Experiential Assessment, Privacy Integrity & Gamified Recognition  
> **Philosophy**: *"Aah! Aha! Ha-ha!"* (Curiosity, Discovery, and Joy in Learning)

---

## 1. Executive Mission & Pedagogical Shift

The Curiosity Olympiad is evolving from a traditional multiple-choice testing platform into an **Experiential Scientific Discovery Ecosystem**. Rather than evaluating static memorization through conventional MCQs, the platform now prioritizes interactive simulations, hypothesis-testing, and dynamic variable experimentation.

### Key Strategic Objectives:
* **Replace Static MCQs with Experiential Assessments**: Students interact with light refraction sliders, orbital mechanics mass attractors, and chemical thermal reactions before answering analytical challenge prompts.
* **Cultivate "Aah! Aha! Ha-ha!" Moments**: Every practice assessment must evoke sensory surprise ("Aah!"), analytical insight ("Aha!"), and joyful confidence ("Ha-ha!").
* **Guarantee Student Safety & Moderation-Free Operations**: Ensure complete data privacy and zero moderation overhead across all user flows.

---

## 2. Leveled Assessment Architecture & Bounded Timers

To accommodate diverse student grades and academic readiness, practice tests are now organized into two distinct tiers:

### Level 1: Foundation Tier (Grades 6–8 Equivalent)
* **Focus**: Foundational scientific curiosity and qualitative observations.
* **Simulations**: Basic parameter adjustments (e.g., standard glass refraction, normal orbital launch speeds, room-temperature chemical reactions).
* **Ideal Completion Time**: Displayed badge indicating **10:00 Minutes** target pace.

### Level 2: Advanced Tier (Grades 9–12 Equivalent)
* **Focus**: Quantitative relationship modeling and boundary testing.
* **Simulations**: High-index optical media ($n > 2.0$), gravitational capture vs. escape velocity limits, and platinum-catalyzed exothermic reactions.
* **Ideal Completion Time**: Displayed badge indicating **15:00 Minutes** target pace.

### Session Management Policies:
* **Practice Tests**: **Pause and Resume enabled**. Students can freeze their timer and return to complete their simulation experiments without penalty.
* **Official Olympiad Tournament**: **Strict single-session locked mode**. Pause is disabled; browser tab-switch proctoring events are logged to telemetry.

---

## 3. Privacy Integrity & Student Roster Protocol (`/schools`)

In compliance with child data privacy laws and Agastya's strict safeguarding policies, the platform enforces a dual-identity architecture:

```
[Student School Enrollment (CSV/Roster)] -> Real Name Secured in DB
                                                  │
                ┌─────────────────────────────────┴─────────────────────────────────┐
                ▼                                                                   ▼
       Public Leaderboard                                            Official Merit Certificates
   (NICKNAME ONLY: e.g. "CuriousMind99")                     (REAL NAME ONLY: e.g. "Kishan Alamuri")
```

1. **School Roster Verification (`/schools`)**:
   * Teachers and school administrators upload CSV rosters containing student names and enrollment codes.
   * Students link their accounts to verified rosters without creating secondary unmanaged identities.
2. **Public Leaderboard Privacy**:
   * Only **Nicknames (`username`)** and avatars are publicly visible on the leaderboard (`/leaderboard`).
3. **Formal Recognition & Certificate Security**:
   * **Real Names** are unlocked and rendered **strictly** when generating an Official Certificate of Excellence.

---

## 4. Forum Feature Exclusion Policy

* **Policy Decision**: **Strict Exclusion of Public Forums, Chatrooms, or Unmoderated Feeds**.
* **Rationale**: Public student forums introduce severe moderation overhead, cybersecurity risks, and potential distractions from hands-on scientific experimentation.
* **Implementation**: All navigation menus, profile pages, and community dashboards are stripped of forum links. Community interaction is safely channeled through structured leaderboards and social media badge sharing.

---

## 5. Certificate Policy: Exclusive Rank #1 Standing

* **Policy Rule**: Printable **Certificates of Excellence** are **NEVER** awarded for accumulating standard XP badges or completing routine practice quests.
* **Eligible Achievements**:
  * **Weekly Rank #1 Champion**
  * **Monthly Rank #1 Champion**
  * **Olympiad Champion / National Finalist**
* **Verification & Social Sharing**:
  * Every certificate bears a unique verification code (`AGY-OLY-2026-XXXX`).
  * Integrated sharing buttons allow students to celebrate their Rank #1 standing on X (Twitter) and LinkedIn with pre-formatted Agastya hashtags (`#AahAhaHaha #CuriosityOlympiad`).

---

## 6. Action Items for Assessment Design Council

1. [ ] Finalize Level 1 vs. Level 2 item banks for the upcoming Fall Sprint.
2. [ ] Review telemetry correlation between `reversals` (hypothesis testing) and Level 2 score outcomes.
3. [ ] Approve school CSV upload templates for institutional rollouts.
