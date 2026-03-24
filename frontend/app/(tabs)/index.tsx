import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/constants/theme';
import { AnimatedGradientBackground } from '../../src/components/AnimatedGradientBackground';
import { GlassCard } from '../../src/components/GlassCard';
import { MoodOrbAvatar } from '../../src/components/MoodOrbAvatar';
import { CoinDisplayPremium } from '../../src/components/CoinDisplayPremium';
import { AIInsightPremium } from '../../src/components/AIInsightPremium';
import { SkeuomorphicButton, Icon3D } from '../../src/components/SkeuomorphicElements';
import { statsApi, aiApi, itemsApi } from '../../src/utils/api';

const MOODS = [
  { id: 'energized', label: 'Energized', emoji: '⚡' },
  { id: 'happy', label: 'Happy', emoji: '😊' },
  { id: 'calm', label: 'Calm', emoji: '🌿' },
  { id: 'romantic', label: 'Romantic', emoji: '💕' },
  { id: 'tired', label: 'Tired', emoji: '😴' },
  { id: 'stressed', label: 'Stressed', emoji: '😰' },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateMood, updateCoins } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  // Fetch snapshot
  const { data: snapshot, refetch: refetchSnapshot } = useQuery({
    queryKey: ['snapshot'],
    queryFn: () => statsApi.getSnapshot().then(r => r.data),
    enabled: !!user,
  });

  // Fetch AI insight
  const { data: insightData, isLoading: insightLoading, refetch: refetchInsight } = useQuery({
    queryKey: ['insight', 'home'],
    queryFn: () => aiApi.getInsight('home').then(r => r.data),
    enabled: !!user,
    staleTime: 60000,
  });

  // Fetch priorities
  const { data: priorities, refetch: refetchPriorities } = useQuery({
    queryKey: ['priorities'],
    queryFn: () => statsApi.getPriorities().then(r => r.data),
    enabled: !!user,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchSnapshot(), refetchInsight(), refetchPriorities()]);
    setRefreshing(false);
  };

  const handleMoodSelect = async (mood: typeof MOODS[0]) => {
    await updateMood(mood.id, mood.emoji);
    setShowMoodPicker(false);
  };

  const handleCompleteTask = async (itemId: string) => {
    try {
      const response = await itemsApi.complete(itemId);
      updateCoins(response.data.coins_joint, response.data.coins_personal);
      refetchSnapshot();
      refetchPriorities();
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  if (!user) {
    return (
      <AnimatedGradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </SafeAreaView>
      </AnimatedGradientBackground>
    );
  }

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hi, {user.name?.split(' ')[0]} ✨</Text>
              <Text style={styles.subtitle}>Let's make today amazing</Text>
            </View>
            <TouchableOpacity 
              style={styles.settingsBtn}
              onPress={() => router.push('/(tabs)/profile')}
            >
              <Ionicons name="settings-outline" size={22} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Coins Display */}
          <CoinDisplayPremium 
            jointCoins={user.coins_joint} 
            personalCoins={user.coins_personal}
          />

          {/* Couple Status - Mood Orbs */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COUPLE STATUS</Text>
            <GlassCard style={styles.coupleCard}>
              <View style={styles.coupleContainer}>
                {/* My Avatar */}
                <MoodOrbAvatar
                  name="You"
                  mood={user.mood || 'happy'}
                  moodEmoji={user.mood_emoji || '😊'}
                  isMe={true}
                  size="large"
                  onPress={() => setShowMoodPicker(true)}
                />
                
                {/* Heart connector */}
                <View style={styles.heartConnector}>
                  <LinearGradient
                    colors={['#EC4899', '#F43F5E']}
                    style={styles.heartGradient}
                  >
                    <Ionicons name="heart" size={24} color="#FFF" />
                  </LinearGradient>
                </View>
                
                {/* Partner Avatar */}
                {snapshot?.partner ? (
                  <MoodOrbAvatar
                    name={snapshot.partner.name || 'Partner'}
                    mood={snapshot.partner.mood || 'happy'}
                    moodEmoji={snapshot.partner.mood_emoji || '😊'}
                    size="large"
                  />
                ) : (
                  <TouchableOpacity 
                    style={styles.addPartner}
                    onPress={() => router.push('/(tabs)/profile')}
                  >
                    <View style={styles.addPartnerCircle}>
                      <Ionicons name="add" size={32} color={Colors.accent} />
                    </View>
                    <Text style={styles.addPartnerText}>Link Partner</Text>
                  </TouchableOpacity>
                )}
              </View>
            </GlassCard>
          </View>

          {/* AI Insight */}
          <View style={styles.section}>
            <AIInsightPremium 
              insight={insightData?.insight || 'Complete tasks together to strengthen your bond! 💪'}
              isLoading={insightLoading}
              type="insight"
            />
          </View>

          {/* Today's Snapshot */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TODAY'S SNAPSHOT</Text>
            <View style={styles.snapshotGrid}>
              <GlassCard style={styles.snapshotCard}>
                <Icon3D icon="person" color="#3B82F6" size={40} />
                <Text style={styles.snapshotLabel}>Me</Text>
                <Text style={styles.snapshotValue}>
                  {snapshot?.me.pending === 0 ? 'All clear! 🎉' : `${snapshot?.me.pending || 0} tasks`}
                </Text>
              </GlassCard>
              
              <GlassCard style={styles.snapshotCard}>
                <Icon3D icon="people" color="#F59E0B" size={40} />
                <Text style={styles.snapshotLabel}>Together</Text>
                <Text style={styles.snapshotValue}>
                  {snapshot?.us.pending === 0 ? 'Free day!' : `${snapshot?.us.pending || 0} shared`}
                </Text>
              </GlassCard>
            </View>
          </View>

          {/* Top Priorities */}
          {priorities && priorities.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>⚡ TOP PRIORITIES</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/buckets')}>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              </View>
              {priorities.slice(0, 3).map((item) => (
                <GlassCard key={item.item_id} style={styles.taskCard}>
                  <TouchableOpacity 
                    style={[styles.checkBox, item.completed && styles.checkBoxCompleted]}
                    onPress={() => !item.completed && handleCompleteTask(item.item_id)}
                  >
                    {item.completed && <Ionicons name="checkmark" size={16} color="#FFF" />}
                  </TouchableOpacity>
                  <View style={styles.taskContent}>
                    <Text style={styles.taskTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.taskMeta}>
                      <View style={[styles.priorityDot, { backgroundColor: Colors.priorities.high.color }]} />
                      <Text style={styles.taskMetaText}>High</Text>
                      <View style={styles.rewardBadge}>
                        <Text style={styles.rewardText}>✨ {item.reward}</Text>
                      </View>
                    </View>
                  </View>
                </GlassCard>
              ))}
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.quickActions}>
              <SkeuomorphicButton
                title="Add Task"
                icon="add-circle"
                onPress={() => router.push('/(tabs)/add')}
                variant="primary"
              />
            </View>
          </View>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>

        {/* Mood Picker Modal */}
        <Modal
          visible={showMoodPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMoodPicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowMoodPicker(false)}
          >
            <GlassCard style={styles.moodPickerCard}>
              <Text style={styles.moodPickerTitle}>How are you feeling?</Text>
              <View style={styles.moodGrid}>
                {MOODS.map((mood) => (
                  <TouchableOpacity
                    key={mood.id}
                    style={[
                      styles.moodOption,
                      user.mood === mood.id && styles.moodOptionSelected,
                    ]}
                    onPress={() => handleMoodSelect(mood)}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={styles.moodLabel}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  viewAll: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    fontWeight: '500',
  },
  coupleCard: {
    padding: Spacing.lg,
  },
  coupleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heartConnector: {
    marginHorizontal: Spacing.md,
  },
  heartGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow('#EC4899'),
  },
  addPartner: {
    alignItems: 'center',
  },
  addPartnerCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.accent,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  addPartnerText: {
    fontSize: FontSize.sm,
    color: Colors.accent,
    fontWeight: '500',
  },
  snapshotGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  snapshotCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
  },
  snapshotLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  snapshotValue: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkBoxCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  taskMetaText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  rewardBadge: {
    marginLeft: Spacing.md,
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  rewardText: {
    fontSize: FontSize.xs,
    color: Colors.gold,
    fontWeight: '600',
  },
  quickActions: {
    gap: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  moodPickerCard: {
    width: '100%',
    padding: Spacing.lg,
  },
  moodPickerTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  moodOption: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    width: 90,
  },
  moodOptionSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accent + '20',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  moodLabel: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '500',
  },
});
