import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { Card, Avatar, Button } from '../../src/components/UIKit';
import { CoinDisplay } from '../../src/components/CoinDisplay';
import { AIInsightCard } from '../../src/components/AIInsightCard';
import { TaskCard } from '../../src/components/TaskCard';
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

  const { data: snapshot, refetch: refetchSnapshot } = useQuery({
    queryKey: ['snapshot'],
    queryFn: () => statsApi.getSnapshot().then(r => r.data),
    enabled: !!user,
  });

  const { data: insightData, isLoading: insightLoading, refetch: refetchInsight } = useQuery({
    queryKey: ['insight', 'home'],
    queryFn: () => aiApi.getInsight('home').then(r => r.data),
    enabled: !!user,
    staleTime: 60000,
  });

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

  const getMoodColor = (mood: string) => {
    return Colors.moods[mood as keyof typeof Colors.moods] || Colors.primary;
  };

  if (!user) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {user.name?.split(' ')[0]}</Text>
            <Text style={styles.date}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/(tabs)/profile')}>
            <Ionicons name="settings-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {/* Coins */}
        <CoinDisplay 
          jointCoins={user.coins_joint} 
          personalCoins={user.coins_personal}
          onPress={() => router.push('/(tabs)/store')}
        />

        {/* Couple Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Couple Status</Text>
          <Card style={styles.coupleCard}>
            <View style={styles.coupleRow}>
              <Avatar
                name="You"
                emoji={user.mood_emoji || '😊'}
                moodColor={getMoodColor(user.mood || 'happy')}
                size="large"
                onPress={() => setShowMoodPicker(true)}
              />
              
              <View style={styles.heartDivider}>
                <Ionicons name="heart" size={24} color={Colors.accent} />
              </View>
              
              {snapshot?.partner ? (
                <Avatar
                  name={snapshot.partner.name?.split(' ')[0] || 'Partner'}
                  emoji={snapshot.partner.mood_emoji || '😊'}
                  moodColor={getMoodColor(snapshot.partner.mood || 'happy')}
                  size="large"
                />
              ) : (
                <TouchableOpacity style={styles.addPartner} onPress={() => router.push('/(tabs)/profile')}>
                  <View style={styles.addPartnerCircle}>
                    <Ionicons name="add" size={24} color={Colors.primary} />
                  </View>
                  <Text style={styles.addPartnerText}>Add Partner</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        </View>

        {/* AI Insight */}
        <View style={styles.section}>
          <AIInsightCard 
            insight={insightData?.insight || 'Complete tasks together to earn rewards!'}
            isLoading={insightLoading}
          />
        </View>

        {/* Today's Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Overview</Text>
          <View style={styles.overviewGrid}>
            <Card style={styles.overviewCard}>
              <View style={[styles.overviewIcon, { backgroundColor: Colors.primary + '15' }]}>
                <Ionicons name="person" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.overviewValue}>{snapshot?.me.pending || 0}</Text>
              <Text style={styles.overviewLabel}>My tasks</Text>
            </Card>
            <Card style={styles.overviewCard}>
              <View style={[styles.overviewIcon, { backgroundColor: Colors.accent + '15' }]}>
                <Ionicons name="people" size={18} color={Colors.accent} />
              </View>
              <Text style={styles.overviewValue}>{snapshot?.us.pending || 0}</Text>
              <Text style={styles.overviewLabel}>Together</Text>
            </Card>
            <Card style={styles.overviewCard}>
              <View style={[styles.overviewIcon, { backgroundColor: Colors.success + '15' }]}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
              </View>
              <Text style={styles.overviewValue}>{snapshot?.me.completed_today || 0}</Text>
              <Text style={styles.overviewLabel}>Done today</Text>
            </Card>
          </View>
        </View>

        {/* Priorities */}
        {priorities && priorities.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Priorities</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/buckets')}>
                <Text style={styles.viewAllLink}>View all</Text>
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

        {/* Quick Add */}
        <View style={styles.section}>
          <Button
            title="Add New Task"
            icon="add-circle-outline"
            onPress={() => router.push('/(tabs)/add')}
          />
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Mood Picker Modal */}
      <Modal visible={showMoodPicker} transparent animationType="fade">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMoodPicker(false)}
        >
          <View style={styles.moodPicker}>
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
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollView: { flex: 1 },
  content: { padding: Spacing.lg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  greeting: { ...Typography.h1, color: Colors.text },
  date: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  settingsBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  section: { marginTop: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  viewAllLink: { ...Typography.caption, color: Colors.primary },
  coupleCard: { padding: Spacing.lg },
  coupleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  heartDivider: {
    width: 48, height: 48,
    borderRadius: 24,
    backgroundColor: Colors.accent + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  addPartner: { alignItems: 'center' },
  addPartnerCircle: {
    width: 80, height: 80, borderRadius: 40,
    borderWidth: 2, borderColor: Colors.primary, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  addPartnerText: { ...Typography.caption, color: Colors.primary },
  overviewGrid: { flexDirection: 'row', gap: Spacing.sm },
  overviewCard: { flex: 1, alignItems: 'center', padding: Spacing.md },
  overviewIcon: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  overviewValue: { ...Typography.h2, color: Colors.text },
  overviewLabel: { ...Typography.caption, color: Colors.textMuted },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  moodPicker: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
  },
  moodPickerTitle: { ...Typography.h3, color: Colors.text, textAlign: 'center', marginBottom: Spacing.lg },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Spacing.sm },
  moodOption: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    width: 90,
  },
  moodOptionSelected: {
    backgroundColor: Colors.primary + '15',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  moodEmoji: { fontSize: 28, marginBottom: Spacing.xs },
  moodLabel: { ...Typography.caption, color: Colors.text },
});
