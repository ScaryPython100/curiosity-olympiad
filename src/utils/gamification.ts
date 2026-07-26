export const XP_PER_LEVEL = 2500;

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  minXp: number;
}

export const BADGES: Badge[] = [
  { id: 'novice', name: 'Novice Explorer', icon: '🌱', description: 'Just starting the journey', minXp: 0 },
  { id: 'logic_initiate', name: 'Logic Initiate', icon: '🧩', description: '2,500 XP reached', minXp: 2500 },
  { id: 'curious_mind', name: 'Curious Mind', icon: '💡', description: '5,000 XP reached', minXp: 5000 },
  { id: 'scholar', name: 'Scholar', icon: '📚', description: '10,000 XP reached', minXp: 10000 },
  { id: 'expert', name: 'Expert Thinker', icon: '🧠', description: '25,000 XP reached', minXp: 25000 },
  { id: 'master', name: 'Logic Master', icon: '👑', description: '50,000 XP reached', minXp: 50000 },
  { id: 'laureate', name: 'Olympiad Laureate', icon: '🏆', description: '100,000 XP reached', minXp: 100000 },
  { id: 'grandmaster', name: 'Grandmaster Scientist', icon: '🚀', description: '250,000 XP reached', minXp: 250000 },
];

export const getBestBadge = (xp: number) => {
  const unlocked = BADGES.filter(b => xp >= b.minXp);
  return unlocked.length > 0 ? unlocked[unlocked.length - 1] : null;
};

export function calculateLevelProgress(totalXp: number) {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = totalXp % XP_PER_LEVEL;
  const progressPercentage = (currentLevelXp / XP_PER_LEVEL) * 100;

  const unlockedBadges = BADGES.filter(badge => totalXp >= badge.minXp);

  return {
    level,
    currentLevelXp,
    progressPercentage,
    unlockedBadges,
    nextBadge: BADGES.find(badge => totalXp < badge.minXp)
  };
}

export const AVATARS = [
  { id: 'kalam', name: 'Abdul Kalam', url: '/avatars/abdul_kalam_1783786598184.png' },
  { id: 'einstein', name: 'Albert Einstein', url: '/avatars/albert_einstein_1783786524612.png' },
  { id: 'curie', name: 'Marie Curie', url: '/avatars/marie_curie_1783786533839.png' },
  { id: 'ada', name: 'Ada Lovelace', url: '/avatars/ada_lovelace_1783786544449.png' },
  { id: 'newton', name: 'Isaac Newton', url: '/avatars/isaac_newton_1783786553524.png' },
  { id: 'hopper', name: 'Grace Hopper', url: '/avatars/grace_hopper_1783786562459.png' },
];

/* =========================================================
   XP MILESTONES & AGASTYA EXPERIENTIAL RANKS
   ========================================================= */
export interface XPMilestone {
  level: number;
  xpRequired: number;
  title: string;
  perk: string;
}

export const XP_MILESTONES: XPMilestone[] = [
  { level: 1, xpRequired: 0, title: "Curious Observer", perk: "Access to Level 1 Practice Labs" },
  { level: 5, xpRequired: 12500, title: "Lab Experimenter", perk: "Access to Level 2 Advanced Practice Labs" },
  { level: 10, xpRequired: 25000, title: "Scientific Inquirer", perk: "Eligible for Weekly Leaderboard Challenges" },
  { level: 25, xpRequired: 62500, title: "Agastya Fellow", perk: "Eligible for Regional Tournament Seeding" },
  { level: 50, xpRequired: 125000, title: "Olympiad Laureate", perk: "Direct Qualification for National Olympiad Final" },
  { level: 100, xpRequired: 250000, title: "Grandmaster Scientist", perk: "National Honor Roll Insignia & Master Mentorship" },
];

/* =========================================================
   REDEMPTION RULES & REWARD POLICIES
   ========================================================= */
export interface RedemptionRule {
  id: string;
  name: string;
  description: string;
  pointCost: number;
  minLevelRequired: number;
  category: "Avatar" | "Sandbox Theme" | "Study Resource";
  certificateRuleNote?: string;
}

export const REDEMPTION_RULES: RedemptionRule[] = [
  {
    id: "avatar-custom-frame",
    name: "Golden Scientist Frame",
    description: "Ornate border for your public leaderboard nickname",
    pointCost: 3500,
    minLevelRequired: 3,
    category: "Avatar",
  },
  {
    id: "sandbox-theme-cosmos",
    name: "Cosmic Deep Space Workspace",
    description: "Dark nebula grid theme for interactive physics simulations",
    pointCost: 7500,
    minLevelRequired: 5,
    category: "Sandbox Theme",
  },
  {
    id: "agastya-science-kit",
    name: "Agastya Hands-on Lab Guide (Digital)",
    description: "Exclusive PDF booklet of home experiments & Aah! Aha! Ha-ha! projects",
    pointCost: 15000,
    minLevelRequired: 10,
    category: "Study Resource",
  },
];

/**
 * STRICT CERTIFICATE RULE NOTE:
 * Formal printable Certificates of Excellence are NEVER awarded for standard XP badges or point redemptions.
 * They are exclusively reserved for students who achieve:
 * - Weekly Rank #1 on the national leaderboard
 * - Monthly Rank #1 on the national leaderboard
 * - Olympiad Champion standing
 */
export const CERTIFICATE_ELIGIBILITY_POLICY = {
  allowedRanks: ["Weekly Rank 1", "Monthly Rank 1", "Olympiad Champion", "National Finalist"],
  allowBadgeCertificates: false,
};

/* =========================================================
   TOURNAMENT QUALIFICATION POLICIES
   ========================================================= */
export interface TournamentPolicy {
  tournamentId: string;
  name: string;
  minLevel: number;
  minXp: number;
  requiresSchoolVerification: boolean;
  maxAttempts: number;
}

export const TOURNAMENT_POLICIES: Record<string, TournamentPolicy> = {
  "weekly-sprint": {
    tournamentId: "weekly-sprint",
    name: "Weekly Experiential Science Sprint",
    minLevel: 1,
    minXp: 0,
    requiresSchoolVerification: false,
    maxAttempts: 3,
  },
  "monthly-cup": {
    tournamentId: "monthly-cup",
    name: "Monthly Agastya Discovery Cup",
    minLevel: 5,
    minXp: 12500,
    requiresSchoolVerification: false,
    maxAttempts: 2,
  },
  "national-olympiad-final": {
    tournamentId: "national-olympiad-final",
    name: "National Curiosity Olympiad Grand Final",
    minLevel: 20,
    minXp: 50000,
    requiresSchoolVerification: true,
    maxAttempts: 1,
  },
};

export function checkTournamentQualification(
  userXp: number,
  userLevel: number,
  isSchoolVerified: boolean,
  tournamentId: string
): { qualified: boolean; reason?: string } {
  const policy = TOURNAMENT_POLICIES[tournamentId];
  if (!policy) {
    return { qualified: false, reason: "Tournament policy not found" };
  }

  if (userLevel < policy.minLevel || userXp < policy.minXp) {
    return {
      qualified: false,
      reason: `Requires Level ${policy.minLevel} (${policy.minXp.toLocaleString()} XP). You have ${userXp.toLocaleString()} XP.`,
    };
  }

  if (policy.requiresSchoolVerification && !isSchoolVerified) {
    return {
      qualified: false,
      reason: "Requires verified School Roster enrollment (Real Name protected for Certificate).",
    };
  }

  return { qualified: true };
}

