// Bucket Keeper - TaskCard
// Task item card with animated checkbox, badges, and assignee avatar

import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolateColor,
} from 'react-native-reanimated';

import type { Task } from '../types';
import { Palette } from '../constants/colors';
import {
  Typography,
  Spacing,
  BorderRadius,
  Shadows,
  Layout,
} from '../constants/theme';
import { Duration, Springs } from '../constants/animations';
import { useThemeColors, Card, Badge } from './UIKit';

// ── Props ─────────────────────────────────────────────────────

interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  onPress?: (id: string) => void;
}

// ── Priority helpers ──────────────────────────────────────────

function getPriorityColor(priority: Task['priority']): string {
  switch (priority) {
    case 'urgent':
      return Palette.priorityUrgent;
    case 'high':
      return Palette.priorityHigh;
    case 'medium':
      return Palette.priorityNormal;
    case 'low':
    default:
      return Palette.priorityLow;
  }
}

// ── Component ─────────────────────────────────────────────────

export function TaskCard({ task, onComplete, onPress }: TaskCardProps) {
  const colors = useThemeColors();

  // Animated checkbox fill
  const checkProgress = useSharedValue(task.isComplete ? 1 : 0);
  const checkScale = useSharedValue(1);

  useEffect(() => {
    checkProgress.value = withTiming(task.isComplete ? 1 : 0, {
      duration: Duration.taskCheckScale,
    });
  }, [task.isComplete]);

  const checkboxAnimatedStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      checkProgress.value,
      [0, 1],
      ['transparent', colors.success],
    );
    return {
      backgroundColor,
      borderColor: checkProgress.value > 0.5 ? colors.success : colors.textMuted,
      transform: [{ scale: checkScale.value }],
    };
  });

  const checkmarkOpacity = useAnimatedStyle(() => ({
    opacity: checkProgress.value,
  }));

  const handleComplete = () => {
    // Bounce animation on tap
    checkScale.value = withSequence(
      withSpring(0.85, Springs.responsive),
      withSpring(1.1, Springs.bouncy),
      withSpring(1, Springs.responsive),
    );
    onComplete?.(task.id);
  };

  const priorityColor = getPriorityColor(task.priority);

  return (
    <Card
      onPress={onPress ? () => onPress(task.id) : undefined}
      style={styles.card}
    >
      <View style={styles.row}>
        {/* Checkbox */}
        <Pressable
          onPress={handleComplete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Animated.View style={[styles.checkbox, checkboxAnimatedStyle]}>
            <Animated.View style={checkmarkOpacity}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </Animated.View>
          </Animated.View>
        </Pressable>

        {/* Title + meta */}
        <View style={styles.content}>
          <Text
            style={[
              Typography.bodyMedium,
              {
                color: task.isComplete ? colors.textMuted : colors.text,
                textDecorationLine: task.isComplete ? 'line-through' : 'none',
              },
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          {/* Badges row */}
          <View style={styles.badges}>
            {/* Priority dot */}
            <View style={styles.priorityRow}>
              <View
                style={[
                  styles.priorityDot,
                  { backgroundColor: priorityColor },
                ]}
              />
              <Text
                style={[
                  Typography.tiny,
                  { color: priorityColor, textTransform: 'capitalize' },
                ]}
              >
                {task.priority}
              </Text>
            </View>

            {/* Reward badge */}
            <Badge
              text={`${task.reward}`}
              color={Palette.coinGold + '20'}
              textColor={Palette.coinGold}
            />

            {/* Bucket type chip */}
            <Badge
              text={task.isJoint ? 'Joint' : 'Personal'}
              color={
                task.isJoint
                  ? Palette.indigo15
                  : Palette.coinSilver + '20'
              }
              textColor={
                task.isJoint ? Palette.indigo : Palette.coinSilver
              }
            />
          </View>
        </View>

        {/* Assignee avatar (right side) */}
        {task.assignedToUserId && (
          <View
            style={[
              styles.assigneeAvatar,
              { backgroundColor: colors.primary },
            ]}
          >
            <Ionicons name="person" size={14} color="#FFF" />
          </View>
        )}
      </View>
    </Card>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    ...Layout.center,
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  assigneeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    ...Layout.center,
    marginLeft: Spacing.sm,
  },
});
