/**
 * Shared Design System Tokens
 * Source of truth extracted from the approved Practice Lab / Mock Test experience.
 * Incorporates principles from emil-design-eng, impeccable, and taste-skill/minimalist-ui:
 * - High-contrast, sunlight-accessible palette for budget Android displays
 * - 8pt spacing grid and strict optical alignment
 * - Minimum touch target >= 44px for WCAG AAA mobile usability
 * - Pure hardware-accelerated CSS tactile press feedback (<100ms response)
 * - Zero heavy blur filters / heavy JS animation loops for low-end device performance
 */

export const colors = {
  // Brand & Hierarchy
  primary: "#143867",        // Deep Agastya Navy (WCAG AAA contrast > 10:1 on white)
  primaryHover: "#1e4a85",
  primaryLight: "#eef2f7",
  primaryBorder: "#d1dbe5",

  accent: "#ea580c",         // Agastya Warm Orange (Timers, linked modules, highlights)
  accentHover: "#c2410c",
  accentLight: "#fff7ed",
  accentBorder: "#ffedd5",

  // Feedback & States
  success: "#16a34a",        // Accessible Emerald
  successHover: "#15803d",
  successLight: "#f0fdf4",
  successBorder: "#bbf7d0",

  danger: "#dc2626",         // Accessible Crimson
  dangerHover: "#b91c1c",
  dangerLight: "#fef2f2",
  dangerBorder: "#fecaca",

  amber: "#f59e0b",
  amberLight: "#fffbeb",
  amberBorder: "#fde68a",

  // Neutrals & Surfaces
  pageBackground: "#f7f9fb", // Calm warm off-white canvas
  surface: "#ffffff",        // Card & Modal surface
  borderMuted: "#e2e8f0",    // Subtle divider (gray-200)
  borderLight: "#f1f5f9",

  // High-Readability Text (Sunlight & low-brightness screens)
  textPrimary: "#191c1e",    // Near-black charcoal
  textSecondary: "#475569",  // Slate-600
  textMuted: "#64748b",      // Slate-500
  textLight: "#94a3b8",      // Slate-400
} as const;

export const spacing = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  "2xl": "24px",
  "3xl": "32px",
} as const;

export const radii = {
  sm: "rounded-lg",    // 8px
  md: "rounded-xl",    // 12px - inputs, buttons
  lg: "rounded-2xl",   // 16px - content cards, banners
  xl: "rounded-3xl",   // 24px - hero cards, modals
  full: "rounded-full",// 9999px - status pills, avatars
} as const;

export const typography = {
  fontFamily: "font-['Montserrat',sans-serif]",
  
  // Badges & Micro Labels
  microTag: "text-[10px] sm:text-[11px] font-black uppercase tracking-wider",
  subLabel: "text-[11px] sm:text-xs font-bold text-gray-500",
  
  // Body Text
  bodySm: "text-xs sm:text-sm text-gray-700 leading-relaxed",
  bodyMd: "text-sm sm:text-base text-gray-800 leading-relaxed",
  
  // Headings
  h4: "text-sm sm:text-base font-black text-[#143867] tracking-tight",
  h3: "text-base sm:text-lg font-black text-[#143867] tracking-tight",
  h2: "text-lg sm:text-xl md:text-2xl font-black text-[#143867] tracking-tight",
  h1: "text-2xl sm:text-3xl md:text-4xl font-black text-[#143867] tracking-tight",
} as const;

export const touchTargets = {
  minHeight: "min-h-[44px]", // WCAG AAA minimum
  minTouch: "min-w-[44px] min-h-[44px]",
} as const;

export const motion = {
  // Emil Kowalski instant tactile press state (<100ms response)
  buttonPress: "transition-transform duration-100 ease-out active:scale-95 cursor-pointer",
  cardPress: "transition-transform duration-100 ease-out active:scale-[0.98] cursor-pointer",
} as const;

export const components = {
  card: "bg-white rounded-2xl border border-gray-200/90 shadow-2xs p-4 sm:p-6",
  cardElevated: "bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm p-4 sm:p-6",
  input: "w-full min-h-[44px] px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#143867] focus:border-transparent transition-all shadow-2xs",
  primaryButton: "min-h-[44px] px-5 py-2.5 bg-[#143867] hover:bg-[#1e4a85] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-xs active:scale-95 transition-transform duration-100 flex items-center justify-center gap-2 cursor-pointer",
  secondaryButton: "min-h-[44px] px-5 py-2.5 bg-white hover:bg-gray-50 text-[#143867] border border-gray-300 rounded-xl text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-transform duration-100 flex items-center justify-center gap-2 cursor-pointer",
  accentButton: "min-h-[44px] px-5 py-2.5 bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs sm:text-sm font-black uppercase tracking-wider rounded-xl shadow-xs active:scale-95 transition-transform duration-100 flex items-center justify-center gap-2 cursor-pointer",
  statusBadge: "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold shrink-0",
} as const;
