// Bucket Keeper - Premium Glassmorphic + Skeuomorphic Theme
// Dynamic color system with couple customization

export const Colors = {
  // Base Dark Theme
  background: '#0A0A0F',
  backgroundDeep: '#050508',
  
  // Glassmorphic surfaces
  glass: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassLight: 'rgba(255, 255, 255, 0.15)',
  glassDark: 'rgba(0, 0, 0, 0.4)',
  
  // Primary gradient colors (default - can be customized)
  gradientStart: '#667EEA',
  gradientMid: '#764BA2',
  gradientEnd: '#F093FB',
  
  // Accent colors
  accent: '#A855F7',
  accentGlow: 'rgba(168, 85, 247, 0.5)',
  gold: '#F59E0B',
  goldGlow: 'rgba(245, 158, 11, 0.5)',
  
  // Text
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.4)',
  
  // Status colors
  success: '#10B981',
  successGlow: 'rgba(16, 185, 129, 0.4)',
  warning: '#F59E0B',
  warningGlow: 'rgba(245, 158, 11, 0.4)',
  error: '#EF4444',
  errorGlow: 'rgba(239, 68, 68, 0.4)',
  info: '#3B82F6',
  infoGlow: 'rgba(59, 130, 246, 0.4)',
  
  // Mood colors with glows
  moods: {
    energized: { color: '#F59E0B', glow: 'rgba(245, 158, 11, 0.6)' },
    happy: { color: '#10B981', glow: 'rgba(16, 185, 129, 0.6)' },
    calm: { color: '#3B82F6', glow: 'rgba(59, 130, 246, 0.6)' },
    romantic: { color: '#EC4899', glow: 'rgba(236, 72, 153, 0.6)' },
    tired: { color: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.6)' },
    stressed: { color: '#EF4444', glow: 'rgba(239, 68, 68, 0.6)' },
  },
  
  // Priority with gradients
  priorities: {
    high: { color: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
    medium: { color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    low: { color: '#6B7280', gradient: ['#6B7280', '#4B5563'] },
  },
};

// Couple color presets
export const CoupleColorPresets = [
  { name: 'Twilight', colors: ['#667EEA', '#764BA2', '#F093FB'] },
  { name: 'Ocean', colors: ['#0EA5E9', '#6366F1', '#8B5CF6'] },
  { name: 'Sunset', colors: ['#F97316', '#EC4899', '#8B5CF6'] },
  { name: 'Forest', colors: ['#10B981', '#14B8A6', '#06B6D4'] },
  { name: 'Rose', colors: ['#F43F5E', '#EC4899', '#D946EF'] },
  { name: 'Golden', colors: ['#F59E0B', '#EAB308', '#FDE047'] },
  { name: 'Midnight', colors: ['#1E3A8A', '#3730A3', '#4F46E5'] },
  { name: 'Aurora', colors: ['#06B6D4', '#10B981', '#84CC16'] },
];

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
  xxxl: 36,
  display: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
};

// Shadow presets for skeuomorphic depth
export const Shadows = {
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  }),
};
