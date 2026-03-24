import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { CoinDisplay } from '../../src/components/CoinDisplay';
import { MoodCard } from '../../src/components/MoodCard';
import { AIInsightCard } from '../../src/components/AIInsightCard';
import { TaskCard } from '../../src/components/TaskCard';
import { statsApi, aiApi, itemsApi } from '../../src/utils/api';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const { user, updateMood, updateCoins } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

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
    staleTime: 60000, // 1 minute
  });

  // Fetch priorities
  const { data: priorities, refetch: refetchPriorities } = useQuery({
    queryKey: ['priorities'],
    queryFn: () => statsApi.getPriorities().then(r => r.data),
    enabled: !!user,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refetchSnapshot(),
      refetchInsight(),
      refetchPriorities(),
    ]);
    setRefreshing(false);
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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {user.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.subtitle}>Let's check your day</Text>
          </View>
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Coins */}
        <CoinDisplay 
          jointCoins={user.coins_joint} 
          personalCoins={user.coins_personal}
          onPress={() => router.push('/(tabs)/store')}
        />

        {/* AI Insight */}
        <View style={styles.section}>
          <AIInsightCard 
            insight={insightData?.insight || 'Complete tasks to earn coins!'}
            isLoading={insightLoading}
          />
        </View>

        {/* Mood Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VIBE CHECK</Text>
          <View style={styles.moodRow}>
            <MoodCard
              name="You"
              mood={user.mood}
              moodEmoji={user.mood_emoji}
              isMe={true}
              onMoodSelect={(mood, emoji) => updateMood(mood, emoji)}
            />
            {snapshot?.partner && (
              <MoodCard
                name={snapshot.partner.name || 'Partner'}
                mood={snapshot.partner.mood || undefined}
                moodEmoji={snapshot.partner.mood_emoji || undefined}
              />
            )}
          </View>
        </View>

        {/* Today's Snapshot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY'S SNAPSHOT</Text>
          <View style={styles.snapshotGrid}>
            <View style={styles.snapshotCard}>
              <View style={[styles.snapshotIcon, { backgroundColor: Colors.info + '20' }]}>
                <Ionicons name="person" size={20} color={Colors.info} />
              </View>
              <Text style={styles.snapshotLabel}>Me</Text>
              <Text style={styles.snapshotValue}>
                {snapshot?.me.pending === 0 ? 'All clear! 🎉' : `${snapshot?.me.pending || 0} pending`}
              </Text>
            </View>
            
            <View style={styles.snapshotCard}>
              <View style={[styles.snapshotIcon, { backgroundColor: Colors.secondary + '20' }]}>
                <Ionicons name="people" size={20} color={Colors.secondary} />
              </View>
              <Text style={styles.snapshotLabel}>Us</Text>
              <Text style={styles.snapshotValue}>
                {snapshot?.us.pending === 0 ? 'Nothing scheduled' : `${snapshot?.us.pending || 0} together`}
              </Text>
            </View>
            
            {snapshot?.partner && (
              <View style={styles.snapshotCard}>
                <View style={[styles.snapshotIcon, { backgroundColor: Colors.primary + '20' }]}>
                  <Ionicons name="heart" size={20} color={Colors.primary} />
                </View>
                <Text style={styles.snapshotLabel}>{snapshot.partner.name?.split(' ')[0]}</Text>
                <Text style={styles.snapshotValue}>
                  {snapshot.partner.mood_emoji || '😊'} {snapshot.partner.mood || 'Chilling'}
                </Text>
              </View>
            )}
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
              <TaskCard
                key={item.item_id}
                item={item}
                onComplete={() => handleCompleteTask(item.item_id)}
                onPress={() => router.push('/(tabs)/buckets')}
              />
            ))}
          </View>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
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
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  viewAll: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  moodRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  snapshotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  snapshotCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  snapshotIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  snapshotLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  snapshotValue: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
