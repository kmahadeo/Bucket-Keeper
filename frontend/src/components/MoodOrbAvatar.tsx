// Bucket Keeper - MoodOrbAvatar
// Animated avatar with mood-colored glow and gradient ring

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import type { MoodType } from '../types';
import { MoodColors, Palette } from '../constants/colors';
import { Typography, Spacing, BorderRadius, Layout } from '../constants/theme';
import { Duration, Easings } from '../constants/animations';
import { useThemeColors } from './UIKit';

// ── Mood config ───────────────────────────────────────────────

const MOOD_EMOJI: Record<MoodType, string> = {
  energized: '\u26A1',
  happy: '\uD83D\uDE04',
  calm: '\uD83C\uDF3F',
  romantic: '\uD83D\uDC96',
  tired: '\uD83C\uDF19',
  stressed: '\uD83D\uDE25',
};

const MOOD_STATUS_ICON: Record<MoodType, keyof typeof Ionicons.glyphMap> = {
  energized: 'flash',
  happy: 'happy',
  calm: 'leaf',
  romantic: 'heart',
  tired: 'moon',
  stressed: 'alert-circle',
};

// ── Props ─────────────────────────────────────────────────────

interface MoodOrbAvatarProps {
  name: string;
  mood: MoodType | null;
  size?: number;
  isPartner?: boolean;
  statusIcon?: string;
}

// ── Component ─────────────────────────────────────────────────

export function MoodOrbAvatar({
  name,
  mood,
  size = 120,
  isPartner = false,
  statusIcon,
}: MoodOrbAvatarProps) {
  const colors = useThemeColors();

  const moodColor = mood ? MoodColors[mood] : colors.primary;
  const emoji = mood ? MOOD_EMOJI[mood] : null;
  const moodLabel = mood
    ? mood.charAt(0).toUpperCase() + mood.slice(1)
    : null;

  // ── Animations ────────────────────────────────────────────

  // Outer glow pulse: scale 1.0 -> 1.06 -> 1.0, 2.4s loop
  const glowScale = useSharedValue(1);
  // Ring rotation: continuous 360deg
  const ringRotation = useSharedValue(0);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.06, {
          duration: Duration.orbBreathing / 2,
          easing: Easings.standard,
        }),
        withTiming(1.0, {
          duration: Duration.orbBreathing / 2,
          easing: Easings.standard,
        }),
      ),
      -1, // infinite
      false,
    );

    ringRotation.value = withRepeat(
      withTiming(360, { duration: 8000, easing: Easings.standard }),
      -1,
      false,
    );
  }, []);

  const glowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotation.value}deg` }],
  }));

  // ── Dimensions ────────────────────────────────────────────

  const innerSize = size * 0.75; // avatar circle
  const ringSize = size; // gradient ring
  const glowSize = size * 1.2; // outer glow
  const statusBadgeSize = size * 0.24;

  return (
    <View style={styles.wrapper}>
      {/* Outer glow ring (pulsing) */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            backgroundColor: moodColor,
            opacity: 0.15,
          },
          glowAnimatedStyle,
        ]}
      />

      {/* Mood-colored gradient ring (rotating) */}
      <Animated.View
        style={[
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            overflow: 'hidden',
            ...Layout.center,
          },
          ringAnimatedStyle,
        ]}
      >
        <LinearGradient
          colors={[moodColor, colors.gradientEnd, moodColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Inner cutout */}
        <View
          style={{
            width: innerSize + 4,
            height: innerSize + 4,
            borderRadius: (innerSize + 4) / 2,
            backgroundColor: colors.background,
          }}
        />
      </Animated.View>

      {/* Inner avatar circle */}
      <View
        style={[
          styles.avatar,
          {
            width: innerSize,
            height: innerSize,
            borderRadius: innerSize / 2,
            backgroundColor: colors.card,
          },
        ]}
      >
        <Text style={{ fontSize: innerSize * 0.45 }}>
          {emoji ?? name.charAt(0).toUpperCase()}
        </Text>
      </View>

      {/* Status icon badge (top-right) */}
      {statusIcon && (
        <View
          style={[
            styles.statusBadge,
            {
              width: statusBadgeSize,
              height: statusBadgeSize,
              borderRadius: statusBadgeSize / 2,
              backgroundColor: moodColor,
              borderColor: colors.background,
              top: 0,
              right: 0,
            },
          ]}
        >
          <Ionicons
            name={statusIcon as keyof typeof Ionicons.glyphMap}
            size={statusBadgeSize * 0.55}
            color="#FFF"
          />
        </View>
      )}

      {/* Name label */}
      <Text
        style={[
          Typography.caption,
          { color: colors.text, marginTop: Spacing.sm, textAlign: 'center' },
        ]}
        numberOfLines={1}
      >
        {isPartner ? name : 'You'}
      </Text>

      {/* Mood label */}
      {moodLabel && (
        <Text
          style={[
            Typography.tiny,
            { color: moodColor, marginTop: 2, textAlign: 'center' },
          ]}
        >
          {moodLabel}
        </Text>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
  },
  avatar: {
    position: 'absolute',
    ...Layout.center,
  },
  statusBadge: {
    position: 'absolute',
    ...Layout.center,
    borderWidth: 2,
  },
});
