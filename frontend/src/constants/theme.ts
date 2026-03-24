// Bucket Keeper - Human-Crafted Design System
// Inspired by Sweetgreen (clean), Paired (warm), Ultrahuman (data-focused)

export const Colors = {
  // Warm backgrounds (Sweetgreen-inspired ivory/cream)
  background: '#FAFAF8',
  backgroundDark: '#0D0D0D',
  card: '#FFFFFF',
  cardDark: '#1A1A1A',
  
  // Primary - Warm sage green (organic, fresh)
  primary: '#4A7C59',
  primaryLight: '#6B9B7A',
  primaryDark: '#3D6449',
  
  // Accent - Soft coral (warm, relationship-focused)
  accent: '#E8927C',
  accentLight: '#F5B4A3',
  accentDark: '#D4755F',
  
  // Secondary - Warm gold (achievements, rewards)
  gold: '#C9A227',
  goldLight: '#E5C35C',
  
  // Text - Rich, readable
  text: '#1A1A1A',
  textDark: '#FFFFFF',
  textSecondary: '#6B6B6B',
  textSecondaryDark: '#A0A0A0',
  textMuted: '#9B9B9B',
  
  // Borders & dividers
  border: '#E8E8E5',
  borderDark: '#2A2A2A',
  
  // Status
  success: '#4A7C59',
  warning: '#E8927C',
  error: '#D64545',
  info: '#5B8FB9',
  
  // Mood colors (warm palette)
  moods: {
    energized: '#E8927C',
    happy: '#4A7C59',
    calm: '#5B8FB9',
    romantic: '#C97B84',
    tired: '#8B7E74',
    stressed: '#D64545',
  },
  
  // Priority
  priorityHigh: '#D64545',
  priorityMedium: '#E8927C',
  priorityLow: '#9B9B9B',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Clean, readable typography
export const Typography = {
  // Display - for hero numbers/stats
  display: {
    fontSize: 48,
    fontWeight: '700' as const,
    letterSpacing: -1,
  },
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  // Body
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  // Small
  caption: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Subtle, clean shadows (not glass)
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
};
