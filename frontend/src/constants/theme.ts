// Bucket Keeper - Design System
// Cift-inspired: clean, premium, intentional

import { Platform, StyleSheet, type TextStyle, type ViewStyle } from 'react-native';
import type { ThemeColors, ThemeMode, ThemeName } from '../types';
import { getTheme } from './colors';

// ── Typography ─────────────────────────────────────────────────
// SF Pro on iOS (system), Inter/system on Android

const fontFamily = Platform.select({
  ios: {
    bold: 'System', // Maps to SF Pro Display Bold on iOS
    semibold: 'System',
    medium: 'System',
    regular: 'System',
  },
  default: {
    bold: 'System',
    semibold: 'System',
    medium: 'System',
    regular: 'System',
  },
});

export const Typography = {
  // Display - hero numbers, app title
  display: {
    fontSize: 40,
    fontWeight: '700' as const,
    fontFamily: fontFamily!.bold,
    letterSpacing: -1,
  } satisfies TextStyle,

  // H1 - screen titles
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    fontFamily: fontFamily!.bold,
    letterSpacing: -0.5,
  } satisfies TextStyle,

  // H2 - section headers
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    fontFamily: fontFamily!.semibold,
    letterSpacing: -0.3,
  } satisfies TextStyle,

  // H3 - card titles, sub-section
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    fontFamily: fontFamily!.semibold,
  } satisfies TextStyle,

  // Body - main text
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    fontFamily: fontFamily!.regular,
    lineHeight: 22,
  } satisfies TextStyle,

  // Body Medium - emphasized body
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
    fontFamily: fontFamily!.medium,
    lineHeight: 22,
  } satisfies TextStyle,

  // Body Small
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    fontFamily: fontFamily!.regular,
    lineHeight: 20,
  } satisfies TextStyle,

  // Caption - metadata, timestamps
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
    fontFamily: fontFamily!.medium,
  } satisfies TextStyle,

  // Label - all caps labels, badges
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    fontFamily: fontFamily!.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  } satisfies TextStyle,

  // Tiny - smallest text
  tiny: {
    fontSize: 11,
    fontWeight: '500' as const,
    fontFamily: fontFamily!.medium,
  } satisfies TextStyle,
};

// ── Spacing (8px grid) ─────────────────────────────────────────

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,

  // Semantic
  screenHorizontal: 20,
  cardPaddingV: 18,
  cardPaddingH: 20,
  sectionGap: 28,
} as const;

// ── Border Radius ──────────────────────────────────────────────

export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  card: 20,
  button: 14,
  pill: 999,
} as const;

// ── Shadows ────────────────────────────────────────────────────

export const Shadows = {
  card: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  } satisfies ViewStyle,

  cardLight: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  } satisfies ViewStyle,

  elevated: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  } satisfies ViewStyle,

  fab: {
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  } satisfies ViewStyle,

  subtle: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  } satisfies ViewStyle,
};

// ── Hit Slop ───────────────────────────────────────────────────

export const HitSlop = {
  small: { top: 8, bottom: 8, left: 8, right: 8 },
  medium: { top: 12, bottom: 12, left: 12, right: 12 },
  large: { top: 16, bottom: 16, left: 16, right: 16 },
} as const;

// ── Layout Helpers ─────────────────────────────────────────────

export const Layout = {
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  } satisfies ViewStyle,

  rowBetween: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  } satisfies ViewStyle,

  center: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  } satisfies ViewStyle,

  fill: {
    flex: 1,
  } satisfies ViewStyle,
};

// ── Theme-aware Style Factory ──────────────────────────────────

export function createThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (theme: ThemeColors) => T,
) {
  const cache = new Map<string, T>();

  return (mode: ThemeMode, name: ThemeName = 'default'): T => {
    const key = `${mode}-${name}`;
    if (cache.has(key)) return cache.get(key)!;

    const theme = getTheme(mode, name);
    const styles = StyleSheet.create(factory(theme));
    cache.set(key, styles);
    return styles;
  };
}

// ── Tab Bar Constants ──────────────────────────────────────────

export const TabBar = {
  height: Platform.OS === 'ios' ? 88 : 64,
  paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.sm,
  fabSize: 56,
  iconSize: 22,
} as const;

// Re-export colors for convenience
export { getTheme, Palette, MoodColors, BucketColors } from './colors';
