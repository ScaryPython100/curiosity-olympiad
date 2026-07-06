export const XP_PER_LEVEL = 1000;

export function calculateLevelProgress(totalXp: number) {
  const level = Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const currentLevelXp = totalXp % XP_PER_LEVEL;
  const progressPercentage = (currentLevelXp / XP_PER_LEVEL) * 100;

  return {
    level,
    currentLevelXp,
    progressPercentage
  };
}
