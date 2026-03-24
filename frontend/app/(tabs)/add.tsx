import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/constants/theme';
import { AnimatedGradientBackground } from '../../src/components/AnimatedGradientBackground';
import { GlassCard } from '../../src/components/GlassCard';
import { SkeuomorphicButton, Icon3D } from '../../src/components/SkeuomorphicElements';
import { itemsApi } from '../../src/utils/api';
import { useAuthStore } from '../../src/store/authStore';

type BucketType = 'joint' | 'personal';
type ItemType = 'task' | 'goal' | 'habit';
type Priority = 'low' | 'medium' | 'high';
type Assignee = 'me' | 'partner' | 'anyone';
type Frequency = 'once' | 'daily' | 'weekly' | 'monthly';

const REWARDS = [
  { value: 5, label: 'Tiny', emoji: '🫧' },
  { value: 10, label: 'Small', emoji: '⭐' },
  { value: 25, label: 'Medium', emoji: '🌟' },
  { value: 50, label: 'Big', emoji: '💫' },
  { value: 100, label: 'Huge', emoji: '✨' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#6B7280' },
  { value: 'medium', label: 'Medium', color: '#F59E0B' },
  { value: 'high', label: 'High', color: '#EF4444' },
];

export default function AddScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [bucketType, setBucketType] = useState<BucketType>('joint');
  const [itemType, setItemType] = useState<ItemType>('task');
  const [reward, setReward] = useState(10);
  const [assignee, setAssignee] = useState<Assignee>('anyone');
  const [priority, setPriority] = useState<Priority>('medium');
  const [frequency, setFrequency] = useState<Frequency>('once');

  const createMutation = useMutation({
    mutationFn: () => itemsApi.create({
      title,
      bucket_type: bucketType,
      item_type: itemType,
      reward,
      assignee,
      priority,
      frequency,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['snapshot'] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create item');
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    createMutation.mutate();
  };

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Add to {bucketType === 'joint' ? 'Joint' : 'Personal'} Bucket
            </Text>
            <View style={{ width: 44 }} />
          </View>

          <ScrollView 
            style={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title Input */}
            <View style={styles.section}>
              <Text style={styles.label}>WHAT NEEDS DOING?</Text>
              <GlassCard noPadding>
                <TextInput
                  style={styles.titleInput}
                  placeholder="e.g. Wash the car, Plan date night..."
                  placeholderTextColor={Colors.textMuted}
                  value={title}
                  onChangeText={setTitle}
                  multiline
                  autoFocus
                />
              </GlassCard>
            </View>

            {/* Bucket Type */}
            <View style={styles.section}>
              <Text style={styles.label}>BUCKET</Text>
              <View style={styles.row}>
                <TouchableOpacity 
                  style={[styles.selectCard, bucketType === 'joint' && styles.selectCardActive]}
                  onPress={() => setBucketType('joint')}
                >
                  {bucketType === 'joint' && (
                    <LinearGradient colors={['#F59E0B', '#D97706']} style={StyleSheet.absoluteFill} />
                  )}
                  <Icon3D icon="people" color={bucketType === 'joint' ? '#FFF' : '#F59E0B'} size={40} />
                  <Text style={[styles.selectText, bucketType === 'joint' && styles.selectTextActive]}>Joint</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.selectCard, bucketType === 'personal' && styles.selectCardActive]}
                  onPress={() => setBucketType('personal')}
                >
                  {bucketType === 'personal' && (
                    <LinearGradient colors={['#A855F7', '#7C3AED']} style={StyleSheet.absoluteFill} />
                  )}
                  <Icon3D icon="person" color={bucketType === 'personal' ? '#FFF' : '#A855F7'} size={40} />
                  <Text style={[styles.selectText, bucketType === 'personal' && styles.selectTextActive]}>Personal</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Item Type */}
            <View style={styles.section}>
              <Text style={styles.label}>TYPE</Text>
              <View style={styles.row}>
                {[
                  { type: 'task', icon: 'checkbox-outline', color: '#10B981', label: 'Task' },
                  { type: 'goal', icon: 'flag', color: '#F59E0B', label: 'Goal' },
                  { type: 'habit', icon: 'refresh', color: '#3B82F6', label: 'Habit' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.type}
                    style={[styles.typeCard, itemType === item.type && styles.typeCardActive]}
                    onPress={() => setItemType(item.type as ItemType)}
                  >
                    {itemType === item.type && (
                      <LinearGradient colors={[item.color, item.color + 'CC']} style={StyleSheet.absoluteFill} />
                    )}
                    <Ionicons 
                      name={item.icon as any} 
                      size={24} 
                      color={itemType === item.type ? '#FFF' : item.color} 
                    />
                    <Text style={[styles.typeText, itemType === item.type && { color: '#FFF' }]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Reward */}
            <View style={styles.section}>
              <Text style={styles.label}>REWARD</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.rewardRow}>
                  {REWARDS.map((r) => (
                    <TouchableOpacity 
                      key={r.value} 
                      style={[styles.rewardCard, reward === r.value && styles.rewardCardActive]}
                      onPress={() => setReward(r.value)}
                    >
                      {reward === r.value && (
                        <LinearGradient colors={['#F59E0B', '#D97706']} style={StyleSheet.absoluteFill} />
                      )}
                      <Text style={styles.rewardEmoji}>{r.emoji}</Text>
                      <Text style={[styles.rewardValue, reward === r.value && { color: '#FFF' }]}>
                        {r.value}
                      </Text>
                      <Text style={[styles.rewardLabel, reward === r.value && { color: 'rgba(255,255,255,0.8)' }]}>
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <Text style={styles.label}>PRIORITY</Text>
              <View style={styles.row}>
                {PRIORITIES.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    style={[styles.priorityCard, priority === p.value && styles.priorityCardActive]}
                    onPress={() => setPriority(p.value as Priority)}
                  >
                    {priority === p.value && (
                      <LinearGradient colors={[p.color, p.color + 'CC']} style={StyleSheet.absoluteFill} />
                    )}
                    <View style={[styles.priorityDot, { backgroundColor: priority === p.value ? '#FFF' : p.color }]} />
                    <Text style={[styles.priorityText, priority === p.value && { color: '#FFF' }]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Frequency */}
            <View style={styles.section}>
              <Text style={styles.label}>FREQUENCY</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.freqRow}>
                  {(['once', 'daily', 'weekly', 'monthly'] as Frequency[]).map((f) => (
                    <TouchableOpacity 
                      key={f}
                      style={[styles.freqCard, frequency === f && styles.freqCardActive]}
                      onPress={() => setFrequency(f)}
                    >
                      {frequency === f && (
                        <LinearGradient colors={['#A855F7', '#7C3AED']} style={StyleSheet.absoluteFill} />
                      )}
                      <Text style={[styles.freqText, frequency === f && { color: '#FFF' }]}>
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Submit Button */}
          <View style={styles.footer}>
            <SkeuomorphicButton
              title={createMutation.isPending ? 'Adding...' : 'Add Item'}
              icon="add-circle"
              onPress={handleSubmit}
              disabled={createMutation.isPending}
              variant="primary"
              size="large"
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  form: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
  },
  titleInput: {
    padding: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  selectCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    gap: Spacing.xs,
  },
  selectCardActive: {
    borderWidth: 0,
  },
  selectText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  selectTextActive: {
    color: '#FFF',
  },
  typeCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    gap: Spacing.xs,
  },
  typeCardActive: {
    borderWidth: 0,
  },
  typeText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  rewardRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  rewardCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    minWidth: 70,
  },
  rewardCardActive: {
    borderWidth: 0,
  },
  rewardEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.gold,
  },
  rewardLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  priorityCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    gap: Spacing.xs,
  },
  priorityCardActive: {
    borderWidth: 0,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  priorityText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  freqRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  freqCard: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  freqCardActive: {
    borderWidth: 0,
  },
  freqText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xxl : Spacing.lg,
    backgroundColor: Colors.glassDark,
  },
});
