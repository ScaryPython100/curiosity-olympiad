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
  { id: 'kalam', name: 'Abdul Kalam', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDP57RuXi2x5Oi-N6FJbYRupRRXvVm_KtcYT0HvUro2sl6D3VvjGuiJmgamB_bQu8-1nfS3AE5rwpsRmtb3zgody9KeS9jg_7nkd8NE2zrrd08c6cxj2gJkdaqSnOP02zMQ705jficGIloi34z7gC9C_fMItoys2EmQUYebVKU_Ss27Gob9Zzjf_YsscceVXX9wiaWHkZSER0oaiypYdtnSp-h4Bk42TFPWNmHQAgJm1ohSyXdDBnvenPVJFPE9KLTkdod3B_AXCtH9' },
  { id: 'einstein', name: 'Albert Einstein', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcmLovT--8_XlQTazvWKBCOfc0dSS5_1bCSrSpFh9Jmd09HI126PUu6RkERIyR6fZZj6O-ISPTe2QKjvIyEzJdmw_pVc4kJl0CS23C2aIbYpgaXFjbLyrqYu89g8Ni9-BluII1Z8q646xX8pkpaZfrecQrC5ftJLZJfJ-jOG1v9phLTfi8vV15qU_etbTZp1dGXlQsX9IVok7J6n0vkvNX_a9vESmKIMUnTvShWkV9As9HpULZxa740Gio0E5NJkRr5-Fdn0ix10Ye' },
  { id: 'curie', name: 'Marie Curie', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZSYWU27g4pkV0bkpRC3qzjSh5niW_Ixg-wHXvPPLEO-B4iYH2K_oP5VVA2QlXZ3zInK6DJ3_ix8Aen8sb8kjHpoTcjrQU57bOzZKAtclc_TWKS2bs5rRIBuT6Z0NCSM8PwXhFtq6ZH77mDLouTOXrpcdMA6PrFpHPUTo3W36zmHLcnYOCXoyMNsUMFWal6Jgd64pQdC2N-aAhoqUDI3prj7jAFnHA39T5PC3plKYB_sniWysIGDB7lwa9tM8M0wQdqgNsQ6gFUBzm' },
  { id: 'ada', name: 'Ada Lovelace', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2PGNFWl5qfR0NHVUZQ06W8-99rCeuDkAAOmAeci4Lf_zeVSq98O-IFSsnxE0yAhZVTYIBEfaEmmt6AsbHstoS3Gu36OYJFTxtJ4pxdAWoNGWdrRB_H4GKnzGMxIbM-E0GOhx4VmFcuu9wYQIcA4P_MRb7YEUdN-Y6KChtCRPmZBtFD07DrlS7OnbrnmrrS1E0S5bmEaiSFuJ_wqZGaUc-E0RVgLjcmeYtVzM7P_t7bsZ8fqeva-yIrAwYfyKpZgdhdsblowkAaPRK' },
  { id: 'newton', name: 'Isaac Newton', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAOUd8Wi9a5h1TV9-1SJu8O10qPztkjnel2zaVFZU_RhnWsfH4xAB5gxqt0v6vsZgJLej2op28pwg6uYf4-bl2IGBpISNmQyWTh1dn64DiJ57_EdLdka-5ze8LleOGNWHRhbwUB5yvjRss7OQBwp_I_3LPiorT4dtBEFlCZrnxeyjY6gVLGh30Vsd75ge82nUXBcydscRRCiaA-N4_ahHAh3NOKrksBE78w2bBTxit2JUusvfTo2icM0P6nK0TUrGzxpo3iTGL99KDZ' },
  { id: 'hopper', name: 'Grace Hopper', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCTHj7OG-NoH7O7DQt5Mz7Hdngq2sTgICnBT9szI9FjE0L6himNTBFWflhcJWfywqSoZ0kJQiMCZpYU6CdJ8H_TSYxdw2XRnwDBAP-HD9iMjXZKrimKnc4unD6HFfSEfifCQrBm_1yf6Tw6b58pYLMf2UEty2vbSDUlhM3IsUGgj6PgL01TPSdVT6FWCHgdMxiCb1pWQHOKLFJhrr0XRduxNy4BxPb6VLY-ZfkjpHSnccacKEmf4jtjohc0CVK3otpvQAI3nnKP9DpF' },
];
