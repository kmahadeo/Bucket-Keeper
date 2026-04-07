// Bucket Keeper - Unified Color System
// Cift-inspired design with multi-theme support

import type { ThemeColors, ThemeMode, ThemeName } from '../types';

// ── Core Palette ───────────────────────────────────────────────

export const Palette = {
  // Primary gradient
  indigo: '#6366F1',
  violet: '#8B5CF6',
  indigoLight: '#818CF8',
  violetLight: '#A78BFA',

  // Neutrals - Dark
  darkBg: '#0A0A14',
  darkBgSecondary: '#10101C',
  darkCard: '#16161F',
  darkSurface: '#1E1E2A',
  darkBorder: 'rgba(255, 255, 255, 0.06)',

  // Neutrals - Light
  lightBg: '#F8F8FC',
  lightBgSecondary: '#F0F0F6',
  lightCard: '#FFFFFF',
  lightSurface: '#F4F4F8',
  lightBorder: 'rgba(0, 0, 0, 0.06)',

  // Text - Dark mode
  textDarkPrimary: '#F0F0FA',
  textDarkSecondary: '#A1A1B5',
  textDarkMuted: '#5A5A72',

  // Text - Light mode
  textLightPrimary: '#0D0D1A',
  textLightSecondary: '#6B6B80',
  textLightMuted: '#8E8EA0',

  // Status
  success: '#22C55E',
  successDark: '#16A34A',
  warning: '#F59E0B',
  warningDark: '#D97706',
  error: '#EF4444',
  errorDark: '#DC2626',
  info: '#3B82F6',

  // Priority
  priorityUrgent: '#EF4444',
  priorityHigh: '#F97316',
  priorityNormal: '#6366F1',
  priorityLow: '#6B7280',

  // Coins
  coinGold: '#F59E0B',
  coinSilver: '#94A3B8',

  // Transparent
  white10: 'rgba(255, 255, 255, 0.10)',
  white06: 'rgba(255, 255, 255, 0.06)',
  white04: 'rgba(255, 255, 255, 0.04)',
  black06: 'rgba(0, 0, 0, 0.06)',
  black10: 'rgba(0, 0, 0, 0.10)',
  indigo08: 'rgba(99, 102, 241, 0.08)',
  indigo15: 'rgba(99, 102, 241, 0.15)',
  indigo35: 'rgba(99, 102, 241, 0.35)',
} as const;

// ── Mood Colors ────────────────────────────────────────────────

export const MoodColors = {
  energized: '#F59E0B',
  happy: '#22C55E',
  calm: '#3B82F6',
  romantic: '#EC4899',
  tired: '#8B5CF6',
  stressed: '#EF4444',
} as const;

// ── Bucket Colors ──────────────────────────────────────────────

export const BucketColors = [
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#22C55E', // Green
  '#3B82F6', // Blue
] as const;

// ── Theme Definitions ──────────────────────────────────────────

const darkTheme: ThemeColors = {
  background: Palette.darkBg,
  backgroundSecondary: Palette.darkBgSecondary,
  card: Palette.darkCard,
  cardBorder: Palette.darkBorder,
  text: Palette.textDarkPrimary,
  textSecondary: Palette.textDarkSecondary,
  textMuted: Palette.textDarkMuted,
  primary: Palette.indigo,
  primaryLight: Palette.indigoLight,
  gradientStart: Palette.indigo,
  gradientEnd: Palette.violet,
  success: Palette.success,
  warning: Palette.warning,
  error: Palette.error,
  priorityUrgent: Palette.priorityUrgent,
  priorityHigh: Palette.priorityHigh,
  priorityNormal: Palette.priorityNormal,
  priorityLow: Palette.priorityLow,
  tabBar: Palette.darkBg,
  tabBarBorder: Palette.darkBorder,
};

const lightTheme: ThemeColors = {
  background: Palette.lightBg,
  backgroundSecondary: Palette.lightBgSecondary,
  card: Palette.lightCard,
  cardBorder: Palette.lightBorder,
  text: Palette.textLightPrimary,
  textSecondary: Palette.textLightSecondary,
  textMuted: Palette.textLightMuted,
  primary: Palette.indigo,
  primaryLight: Palette.indigoLight,
  gradientStart: Palette.indigo,
  gradientEnd: Palette.violet,
  success: Palette.success,
  warning: Palette.warning,
  error: Palette.error,
  priorityUrgent: Palette.priorityUrgent,
  priorityHigh: Palette.priorityHigh,
  priorityNormal: Palette.priorityNormal,
  priorityLow: Palette.priorityLow,
  tabBar: Palette.lightCard,
  tabBarBorder: Palette.lightBorder,
};

// ── Custom Relationship Themes ─────────────────────────────────
// Override gradients and accents per relationship type

const couplesTheme: ThemeColors = {
  ...darkTheme,
  gradientStart: '#EC4899', // Pink
  gradientEnd: '#F43F5E',   // Rose
  primary: '#EC4899',
  primaryLight: '#F472B6',
};

const friendsTheme: ThemeColors = {
  ...darkTheme,
  gradientStart: '#14B8A6', // Teal
  gradientEnd: '#06B6D4',   // Cyan
  primary: '#14B8A6',
  primaryLight: '#2DD4BF',
};

const familyTheme: ThemeColors = {
  ...darkTheme,
  gradientStart: '#F59E0B', // Amber
  gradientEnd: '#F97316',   // Orange
  primary: '#F59E0B',
  primaryLight: '#FBBF24',
};

const roommatesTheme: ThemeColors = {
  ...darkTheme,
  gradientStart: '#22C55E', // Green
  gradientEnd: '#10B981',   // Emerald
  primary: '#22C55E',
  primaryLight: '#4ADE80',
};

// ── Theme Registry ─────────────────────────────────────────────

const themes: Record<ThemeName, Record<ThemeMode, ThemeColors>> = {
  default: { dark: darkTheme, light: lightTheme },
  couples: {
    dark: couplesTheme,
    light: { ...lightTheme, gradientStart: '#EC4899', gradientEnd: '#F43F5E', primary: '#EC4899', primaryLight: '#F472B6' },
  },
  friends: {
    dark: friendsTheme,
    light: { ...lightTheme, gradientStart: '#14B8A6', gradientEnd: '#06B6D4', primary: '#14B8A6', primaryLight: '#2DD4BF' },
  },
  family: {
    dark: familyTheme,
    light: { ...lightTheme, gradientStart: '#F59E0B', gradientEnd: '#F97316', primary: '#F59E0B', primaryLight: '#FBBF24' },
  },
  roommates: {
    dark: roommatesTheme,
    light: { ...lightTheme, gradientStart: '#22C55E', gradientEnd: '#10B981', primary: '#22C55E', primaryLight: '#4ADE80' },
  },
};

// ── Theme Accessor ─────────────────────────────────────────────

export function getTheme(mode: ThemeMode, name: ThemeName = 'default'): ThemeColors {
  return themes[name]?.[mode] ?? themes.default[mode];
}

export function getThemeNames(): ThemeName[] {
  return Object.keys(themes) as ThemeName[];
}

// Default export for backward compatibility during migration
export const Colors = darkTheme;
