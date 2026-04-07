// Bucket Keeper - Animation Constants
// All durations in ms, all Reanimated-compatible

import { Easing } from 'react-native-reanimated';

// ── Durations ──────────────────────────────────────────────────

export const Duration = {
  // Screen transitions
  screenTransition: 280,

  // Card animations
  cardEntrance: 300,
  cardEntranceStagger: 40, // delay between each card
  cardExit: 200,

  // Task completion sequence (450ms total)
  taskCheckScale: 150,
  taskCheckDraw: 150,
  taskCardFadeOut: 150,

  // Micro-interactions
  buttonPress: 100,
  chipToggle: 150,
  tooltipFade: 200,

  // Looping animations
  micPulse: 1800,
  micRipple: 1200,
  orbBreathing: 2400,
  loadingSpinner: 1000,

  // Swipe
  swipeThreshold: 80,
  swipeComplete: 200,

  // Modal
  modalIn: 300,
  modalOut: 200,

  // Celebration / Session End
  celebrationScale: 600,
  celebrationFade: 400,
  confettiDuration: 2000,
} as const;

// ── Easing Presets ─────────────────────────────────────────────

export const Easings = {
  // Standard motion
  standard: Easing.bezier(0.4, 0.0, 0.2, 1.0),

  // Deceleration (entering screen)
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1.0),

  // Acceleration (leaving screen)
  accelerate: Easing.bezier(0.4, 0.0, 1.0, 1.0),

  // Sharp (quick state change)
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1.0),

  // Bounce (playful interactions)
  bounce: Easing.bezier(0.34, 1.56, 0.64, 1.0),
} as const;

// ── Spring Configs ─────────────────────────────────────────────

export const Springs = {
  // Gentle - tooltips, fades
  gentle: {
    damping: 20,
    stiffness: 150,
    mass: 1,
  },

  // Responsive - buttons, chips
  responsive: {
    damping: 15,
    stiffness: 200,
    mass: 0.8,
  },

  // Bouncy - celebrations, completions
  bouncy: {
    damping: 10,
    stiffness: 180,
    mass: 1,
  },

  // Snappy - swipe gestures
  snappy: {
    damping: 20,
    stiffness: 300,
    mass: 0.8,
  },
} as const;

// ── Card Entrance Helpers ──────────────────────────────────────

export function getStaggerDelay(index: number): number {
  return index * Duration.cardEntranceStagger;
}

export function getCardEntranceConfig(index: number) {
  return {
    delay: getStaggerDelay(index),
    duration: Duration.cardEntrance,
    easing: Easings.decelerate,
  };
}
