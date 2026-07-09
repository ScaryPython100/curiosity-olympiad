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
  { id: 'kalam', name: 'Abdul Kalam', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/A._P._J._Abdul_Kalam.jpg/500px-A._P._J._Abdul_Kalam.jpg' },
  { id: 'einstein', name: 'Albert Einstein', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Albert_Einstein_Head_cleaned.jpg/500px-Albert_Einstein_Head_cleaned.jpg' },
  { id: 'curie', name: 'Marie Curie', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Marie_Curie_c._1920s.jpg/500px-Marie_Curie_c._1920s.jpg' },
  { id: 'ada', name: 'Ada Lovelace', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Ada_Lovelace_daguerreotype_by_Antoine_Claudet_1843_-_cropped.png/500px-Ada_Lovelace_daguerreotype_by_Antoine_Claudet_1843_-_cropped.png' },
  { id: 'newton', name: 'Isaac Newton', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg/500px-Portrait_of_Sir_Isaac_Newton%2C_1689_%28brightened%29.jpg' },
  { id: 'hopper', name: 'Grace Hopper', url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Commodore_Grace_M._Hopper%2C_USN_%28covered%29_head_and_shoulders_crop.jpg/500px-Commodore_Grace_M._Hopper%2C_USN_%28covered%29_head_and_shoulders_crop.jpg' },
];
