// Bucket Keeper - AIInsightCard
// Card with gradient border, sparkle icon, and pulsing glow while loading

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

import { Spacing, BorderRadius, Layout, Typography } from '../constants/theme';
import { Duration, Easings } from '../constants/animations';
import { useThemeColors } from './UIKit';

// ── Props ─────────────────────────────────────────────────────

interface AIInsightCardProps {
  insight: string | null;
  loading?: boolean;
  variant?: 'insight' | 'recommendation';
}

// ── Component ─────────────────────────────────────────────────

export function AIInsightCard({
  insight,
  loading = false,
  variant = 'insight',
}: AIInsightCardProps) {
  const colors = useThemeColors();

  const label = variant === 'recommendation' ? 'AI Recommendation' : 'AI Insight';

  // Pulsing glow opacity on the border while loading
  const glowOpacity = useSharedValue(1);

  useEffect(() => {
    if (loading) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 800, easing: Easings.standard }),
          withTiming(1, { duration: 800, easing: Easings.standard }),
        ),
        -1,
        false,
      );
    } else {
      glowOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [loading]);

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  // Animated dots for loading text
  const dotsOpacity = useSharedValue(0);

  useEffect(() => {
    if (loading) {
      dotsOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 600 }),
          withTiming(0, { duration: 600 }),
        ),
        -1,
        false,
      );
    }
  }, [loading]);

  const dotsStyle = useAnimatedStyle(() => ({
    opacity: dotsOpacity.value,
  }));

  return (
    <Animated.View style={[styles.outerWrapper, borderAnimatedStyle]}>
      {/* Gradient border */}
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBorder}
      >
        {/* Inner card */}
        <View
          style={[
            styles.innerCard,
            { backgroundColor: colors.card },
          ]}
        >
          {/* Header row */}
          <View style={styles.header}>
            <Ionicons
              name="sparkles"
              size={16}
              color={colors.gradientStart}
              style={{ marginRight: Spacing.sm }}
            />
            <Text
              style={[
                Typography.label,
                { color: colors.gradientStart, letterSpacing: 0.5 },
              ]}
            >
              {label}
            </Text>
          </View>

          {/* Content */}
          {loading ? (
            <View style={Layout.row}>
              <Text style={[Typography.bodySmall, { color: colors.textSecondary }]}>
                Analyzing your rewards
              </Text>
              <Animated.Text
                style={[
                  Typography.bodySmall,
                  { color: colors.textSecondary },
                  dotsStyle,
                ]}
              >
                ...
              </Animated.Text>
            </View>
          ) : (
            <Text style={[Typography.bodySmall, { color: colors.text }]}>
              {insight ?? 'No insights available yet.'}
            </Text>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const BORDER_WIDTH = 1.5;

const styles = StyleSheet.create({
  outerWrapper: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
  },
  gradientBorder: {
    borderRadius: BorderRadius.card,
    padding: BORDER_WIDTH,
  },
  innerCard: {
    borderRadius: BorderRadius.card - BORDER_WIDTH,
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
});
