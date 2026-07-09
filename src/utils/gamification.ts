export const XP_PER_LEVEL = 1000;

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  minXp: number;
}

export const BADGES: Badge[] = [
  { id: 'novice', name: 'Novice Explorer', icon: '🌱', description: 'Just starting the journey', minXp: 0 },
  { id: 'logic_initiate', name: 'Logic Initiate', icon: '🧩', description: '1,000 XP reached', minXp: 1000 },
  { id: 'curious_mind', name: 'Curious Mind', icon: '💡', description: '2,500 XP reached', minXp: 2500 },
  { id: 'scholar', name: 'Scholar', icon: '📚', description: '5,000 XP reached', minXp: 5000 },
  { id: 'expert', name: 'Expert Thinker', icon: '🧠', description: '10,000 XP reached', minXp: 10000 },
  { id: 'master', name: 'Logic Master', icon: '👑', description: '25,000 XP reached', minXp: 25000 },
];

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
  { id: 'kalam', name: 'Abdul Kalam', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kalam' },
  { id: 'einstein', name: 'Albert Einstein', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=einstein' },
  { id: 'curie', name: 'Marie Curie', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=curie' },
  { id: 'ada', name: 'Ada Lovelace', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ada' },
  { id: 'newton', name: 'Isaac Newton', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=newton' },
  { id: 'hopper', name: 'Grace Hopper', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hopper' },
];
