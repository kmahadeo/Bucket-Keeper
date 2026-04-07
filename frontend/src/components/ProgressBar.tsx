// Bucket Keeper - ProgressBar
// Animated gradient progress bar with smooth width transitions

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { BorderRadius } from '../constants/theme';
import { Easings } from '../constants/animations';
import { useThemeColors } from './UIKit';

// ── Props ─────────────────────────────────────────────────────

interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  color?: string;
}

// ── Animated gradient wrapper ─────────────────────────────────

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

// ── Component ─────────────────────────────────────────────────

export function ProgressBar({
  progress,
  height = 6,
  color,
}: ProgressBarProps) {
  const colors = useThemeColors();

  // Clamp between 0 and 1
  const clampedProgress = Math.max(0, Math.min(1, progress));

  const widthPercent = useSharedValue(clampedProgress);

  useEffect(() => {
    widthPercent.value = withTiming(clampedProgress, {
      duration: 400,
      easing: Easings.standard,
    });
  }, [clampedProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${widthPercent.value * 100}%` as `${number}%`,
  }));

  const gradientColors: [string, string] = color
    ? [color, color]
    : [colors.gradientStart, colors.gradientEnd];

  return (
    <View
      style={[
        styles.track,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: colors.cardBorder,
        },
      ]}
    >
      <AnimatedLinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.fill,
          {
            height,
            borderRadius: height / 2,
          },
          fillStyle,
        ]}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
