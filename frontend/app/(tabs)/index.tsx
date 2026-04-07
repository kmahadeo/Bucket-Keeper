// Bucket Keeper - Home Screen
// Partner avatars, AI insights, priorities, mood tracking

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { format } from 'date-fns';
import { useAuthStore } from '../../src/store/authStore';
import { useThemeColors, Card, GradientButton, Badge } from '../../src/components/UIKit';
import { Typography, Spacing, BorderRadius, Layout, Shadows } from '../../src/constants/theme';
import { Palette, MoodColors } from '../../src/constants/colors';
import { statsApi, aiApi, itemsApi } from '../../src/utils/api';
import type { MoodType } from '../../src/types';

const MOODS: { key: MoodType; label: string; emoji: string }[] = [
  { key: 'energized', label: 'Energized', emoji: '⚡' },
  { key: 'happy', label: 'Happy', emoji: '😊' },
  { key: 'calm', label: 'Calm', emoji: '🌿' },
  { key: 'romantic', label: 'Romantic', emoji: '💕' },
  { key: 'tired', label: 'Tired', emoji: '😴' },
  { key: 'stressed', label: 'Stressed', emoji: '😰' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateMood, updateCoins } = useAuthStore();
  const colors = useThemeColors();
  const [refreshing, setRefreshing] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const { data: snapshot, refetch: refetchSnapshot } = useQuery({
    queryKey: ['snapshot'],
    queryFn: () => statsApi.getSnapshot().then((r) => r.data),
  });

  const { data: priorities, refetch: refetchPriorities } = useQuery({
    queryKey: ['priorities'],
    queryFn: () => statsApi.getPriorities().then((r) => r.data),
  });

  const { data: insight } = useQuery({
    queryKey: ['insight'],
    queryFn: () => aiApi.getInsight('home').then((r) => r.data.insight),
    staleTime: 60000,
  });

  const completeMutation = useMutation({
    mutationFn: (itemId: string) => itemsApi.complete(itemId),
    onSuccess: (_, itemId) => {
      refetchPriorities();
      refetchSnapshot();
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchSnapshot(), refetchPriorities()]);
    setRefreshing(false);
  }, []);

  const handleMoodSelect = async (mood: MoodType, emoji: string) => {
    setShowMoodPicker(false);
    await updateMood(mood, emoji);
    refetchSnapshot();
  };

  const greeting = getGreeting();
  const today = format(new Date(), 'EEEE, MMMM d');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={{
            ...Layout.rowBetween,
            paddingHorizontal: Spacing.screenHorizontal,
            paddingTop: Spacing.md,
            paddingBottom: Spacing.sm,
          }}
        >
          <View>
            <Text style={{ ...Typography.h1, color: colors.text }}>
              {greeting}, {user?.name?.split(' ')[0] ?? 'there'}
            </Text>
            <Text style={{ ...Typography.bodySmall, color: colors.textMuted, marginTop: 2 }}>
              {today}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/profile')}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: Palette.white06,
              ...Layout.center,
            }}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: Spacing.screenHorizontal, gap: Spacing.sectionGap }}>
          {/* Partner Avatars */}
          <View style={{ alignItems: 'center', paddingVertical: Spacing.md }}>
            <View style={{ ...Layout.row, gap: Spacing.xl }}>
              {/* You */}
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    borderWidth: 3,
                    borderColor: getMoodColor(snapshot?.me?.mood as MoodType),
                    ...Layout.center,
                    ...Shadows.card,
                  }}
                >
                  <View
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 44,
                      backgroundColor: colors.card,
                      ...Layout.center,
                    }}
                  >
                    <Text style={{ fontSize: 40 }}>
                      {snapshot?.me?.mood_emoji || '😊'}
                    </Text>
                  </View>
                  {snapshot?.me?.mood && (
                    <View
                      style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: getMoodColor(snapshot.me.mood as MoodType),
                        ...Layout.center,
                      }}
                    >
                      <Text style={{ fontSize: 12 }}>⚡</Text>
                    </View>
                  )}
                </View>
                <Text
                  style={{
                    ...Typography.label,
                    color: getMoodColor(snapshot?.me?.mood as MoodType),
                    marginTop: Spacing.sm,
                  }}
                >
                  {(snapshot?.me?.mood ?? 'HAPPY').toUpperCase()}
                </Text>
                <Text style={{ ...Typography.caption, color: colors.textSecondary, marginTop: 2 }}>
                  You
                </Text>
              </View>

              {/* Heart divider */}
              <View style={{ ...Layout.center, paddingTop: Spacing.md }}>
                <Text style={{ fontSize: 20, color: Palette.error }}>❤️</Text>
              </View>

              {/* Partner */}
              <View style={{ alignItems: 'center' }}>
                <View
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 50,
                    borderWidth: 3,
                    borderColor: getMoodColor(snapshot?.partner?.mood as MoodType),
                    ...Layout.center,
                    ...Shadows.card,
                  }}
                >
                  <View
                    style={{
                      width: 88,
                      height: 88,
                      borderRadius: 44,
                      backgroundColor: colors.card,
                      ...Layout.center,
                    }}
                  >
                    <Text style={{ fontSize: 40 }}>
                      {snapshot?.partner?.mood_emoji || '😸'}
                    </Text>
                  </View>
                </View>
                <Text
                  style={{
                    ...Typography.label,
                    color: getMoodColor(snapshot?.partner?.mood as MoodType),
                    marginTop: Spacing.sm,
                  }}
                >
                  {(snapshot?.partner?.mood ?? 'CALM').toUpperCase()}
                </Text>
                <Text style={{ ...Typography.caption, color: colors.textSecondary, marginTop: 2 }}>
                  {snapshot?.partner?.name ?? 'Partner'}
                </Text>
              </View>
            </View>
          </View>

          {/* AI Insight */}
          {insight && (
            <Card>
              <View style={Layout.row}>
                <Text style={{ fontSize: 14, marginRight: Spacing.sm }}>✨</Text>
                <Text style={{ ...Typography.caption, color: colors.primary, fontWeight: '700' }}>
                  AI Insight:
                </Text>
              </View>
              <Text
                style={{
                  ...Typography.bodySmall,
                  color: colors.textSecondary,
                  marginTop: Spacing.sm,
                  lineHeight: 20,
                }}
              >
                {insight}
              </Text>
            </Card>
          )}

          {/* Action Buttons */}
          <View style={{ ...Layout.row, gap: Spacing.md }}>
            <Pressable
              onPress={() => setShowMoodPicker(true)}
              style={({ pressed }) => ({
                flex: 1,
                ...Layout.row,
                justifyContent: 'center',
                height: 44,
                borderRadius: BorderRadius.button,
                backgroundColor: Palette.white06,
                gap: Spacing.sm,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontSize: 14 }}>✨</Text>
              <Text style={{ ...Typography.bodyMedium, color: colors.text }}>Vibe Check</Text>
            </Pressable>

            <Pressable
              onPress={() => router.push('/ai-daily-plan')}
              style={({ pressed }) => ({
                flex: 1,
                ...Layout.row,
                justifyContent: 'center',
                height: 44,
                borderRadius: BorderRadius.button,
                backgroundColor: Palette.white06,
                gap: Spacing.sm,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ fontSize: 14 }}>🎯</Text>
              <Text style={{ ...Typography.bodyMedium, color: colors.text }}>AI Plan</Text>
            </Pressable>
          </View>

          {/* Weekly Check-in */}
          <Card
            style={{
              borderColor: Palette.success,
              borderWidth: 1,
              backgroundColor: 'rgba(34, 197, 94, 0.06)',
            }}
          >
            <View style={Layout.rowBetween}>
              <View style={Layout.row}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    ...Layout.center,
                    marginRight: Spacing.md,
                  }}
                >
                  <Ionicons name="checkmark-circle" size={22} color={Palette.success} />
                </View>
                <View>
                  <Text style={{ ...Typography.h3, color: colors.text }}>Weekly Check-in</Text>
                  <Text style={{ ...Typography.bodySmall, color: colors.textSecondary }}>
                    Review goals & high-priority items
                  </Text>
                </View>
              </View>
              <Pressable
                style={{
                  paddingHorizontal: Spacing.md,
                  paddingVertical: Spacing.sm,
                  borderRadius: BorderRadius.button,
                  backgroundColor: Palette.success,
                }}
              >
                <Text style={{ ...Typography.caption, color: '#FFF', fontWeight: '700' }}>
                  Start
                </Text>
              </Pressable>
            </View>
          </Card>

          {/* Top Priorities */}
          <View>
            <View style={[Layout.rowBetween, { marginBottom: Spacing.md }]}>
              <View style={Layout.row}>
                <Text style={{ fontSize: 14, marginRight: Spacing.sm }}>⚡</Text>
                <Text style={{ ...Typography.label, color: colors.textSecondary }}>
                  TOP PRIORITIES
                </Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/buckets')}>
                <Text style={{ ...Typography.caption, color: colors.primary }}>View All</Text>
              </Pressable>
            </View>

            {priorities && priorities.length > 0 ? (
              <View style={{ gap: Spacing.sm }}>
                {priorities.slice(0, 5).map((task: any) => (
                  <Card key={task.item_id} onPress={() => {}}>
                    <View style={Layout.rowBetween}>
                      <View style={{ ...Layout.row, flex: 1 }}>
                        <Pressable
                          onPress={() => completeMutation.mutate(task.item_id)}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            borderWidth: 2,
                            borderColor: getPriorityColor(task.priority),
                            ...Layout.center,
                            marginRight: Spacing.md,
                          }}
                        >
                          {task.completed && (
                            <Ionicons name="checkmark" size={14} color={getPriorityColor(task.priority)} />
                          )}
                        </Pressable>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              ...Typography.bodyMedium,
                              color: colors.text,
                            }}
                            numberOfLines={1}
                          >
                            {task.title}
                          </Text>
                        </View>
                      </View>
                      <View style={Layout.row}>
                        <Badge
                          text={`${task.reward}`}
                          color={Palette.indigo15}
                          textColor={colors.primary}
                        />
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            ) : (
              <Card>
                <Text
                  style={{
                    ...Typography.body,
                    color: colors.textMuted,
                    textAlign: 'center',
                    paddingVertical: Spacing.lg,
                  }}
                >
                  No priorities yet. Add some tasks to get started!
                </Text>
              </Card>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Mic Button */}
      <Pressable
        onPress={() => router.push('/voice-capture')}
        style={{
          position: 'absolute',
          bottom: 20,
          alignSelf: 'center',
          ...Shadows.fab,
        }}
      >
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            ...Layout.center,
          }}
        >
          <Ionicons name="mic" size={28} color="#FFF" />
        </LinearGradient>
      </Pressable>

      {/* Mood Picker Modal */}
      <Modal visible={showMoodPicker} transparent animationType="fade">
        <Pressable
          onPress={() => setShowMoodPicker(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'flex-end',
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.card,
              borderTopLeftRadius: BorderRadius.card,
              borderTopRightRadius: BorderRadius.card,
              padding: Spacing.lg,
              paddingBottom: Spacing.xxl,
            }}
          >
            <Text
              style={{
                ...Typography.h2,
                color: colors.text,
                textAlign: 'center',
                marginBottom: Spacing.lg,
              }}
            >
              How are you feeling?
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: Spacing.md,
              }}
            >
              {MOODS.map((mood) => (
                <Pressable
                  key={mood.key}
                  onPress={() => handleMoodSelect(mood.key, mood.emoji)}
                  style={({ pressed }) => ({
                    width: 90,
                    height: 90,
                    borderRadius: BorderRadius.card,
                    backgroundColor:
                      user?.mood === mood.key
                        ? MoodColors[mood.key] + '20'
                        : Palette.white06,
                    borderWidth: user?.mood === mood.key ? 2 : 0,
                    borderColor: MoodColors[mood.key],
                    ...Layout.center,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ fontSize: 28, marginBottom: 4 }}>{mood.emoji}</Text>
                  <Text style={{ ...Typography.tiny, color: colors.textSecondary }}>
                    {mood.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

// ── Helpers ────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getMoodColor(mood: MoodType | string | null | undefined): string {
  if (!mood || !(mood in MoodColors)) return Palette.indigo;
  return MoodColors[mood as MoodType];
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return Palette.priorityHigh;
    case 'urgent':
      return Palette.priorityUrgent;
    case 'low':
      return Palette.priorityLow;
    default:
      return Palette.priorityNormal;
  }
}
