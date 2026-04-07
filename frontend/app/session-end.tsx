// Bucket Keeper - Session End / Celebration Screen
// "Pleasure Doing Business With You"

import React, { useEffect, useMemo } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeColors } from '../src/components/UIKit';
import { Typography, Spacing, Layout } from '../src/constants/theme';
import { Palette, BucketColors } from '../src/constants/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function generateConfetti(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_W,
    y: Math.random() * SCREEN_H * 0.7 + SCREEN_H * 0.1,
    size: Math.random() * 8 + 4,
    color: BucketColors[Math.floor(Math.random() * BucketColors.length)],
    opacity: Math.random() * 0.6 + 0.2,
  }));
}

export default function SessionEndScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const confetti = useMemo(() => generateConfetti(30), []);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.back();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Pressable
      onPress={() => router.back()}
      style={{
        flex: 1,
        backgroundColor: colors.background,
        ...Layout.center,
      }}
    >
      {/* Confetti dots */}
      {confetti.map((dot) => (
        <View
          key={dot.id}
          style={{
            position: 'absolute',
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            borderRadius: dot.size / 2,
            backgroundColor: dot.color,
            opacity: dot.opacity,
          }}
        />
      ))}

      {/* Main text */}
      <View style={{ alignItems: 'center', paddingHorizontal: Spacing.xl }}>
        <Text
          style={{
            ...Typography.h1,
            color: '#FFFFFF',
            textAlign: 'center',
            lineHeight: 42,
          }}
        >
          Pleasure Doing{'\n'}Business With You
        </Text>
        <Text
          style={{
            ...Typography.body,
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: Spacing.lg,
          }}
        >
          Let's Gamify Your Relationship
        </Text>
        <Text
          style={{
            ...Typography.tiny,
            color: colors.textMuted,
            marginTop: Spacing.xxl,
          }}
        >
          Tap anywhere to continue
        </Text>
      </View>
    </Pressable>
  );
}
