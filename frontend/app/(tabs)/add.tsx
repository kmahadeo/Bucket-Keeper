import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { itemsApi } from '../../src/utils/api';
import { useAuthStore } from '../../src/store/authStore';

type BucketType = 'joint' | 'personal';
type ItemType = 'task' | 'goal' | 'habit';
type Priority = 'low' | 'medium' | 'high';
type Assignee = 'me' | 'partner' | 'anyone';
type Frequency = 'once' | 'daily' | 'weekly' | 'monthly';

const REWARDS = [
  { value: 5, label: 'Tiny', emoji: '🫧' },
  { value: 10, label: 'Small', emoji: '👍' },
  { value: 25, label: 'Medium', emoji: '⭐' },
  { value: 50, label: 'Big', emoji: '🌟' },
  { value: 100, label: 'Huge', emoji: '💫' },
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

  const SelectButton = ({ selected, onPress, children, style }: any) => (
    <TouchableOpacity
      style={[styles.selectBtn, selected && styles.selectBtnActive, style]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );

  return (
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
          <Text style={styles.title}>Add to {bucketType === 'joint' ? 'Joint' : 'Personal'} Bucket</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView 
          style={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.label}>What needs doing?</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="e.g. Wash the car..."
              placeholderTextColor={Colors.textMuted}
              value={title}
              onChangeText={setTitle}
              multiline
              autoFocus
            />
          </View>

          {/* Bucket Type */}
          <View style={styles.section}>
            <Text style={styles.label}>BUCKET</Text>
            <View style={styles.row}>
              <SelectButton 
                selected={bucketType === 'joint'} 
                onPress={() => setBucketType('joint')}
                style={styles.flex}
              >
                <Ionicons name="people" size={20} color={bucketType === 'joint' ? Colors.secondary : Colors.textMuted} />
                <Text style={[styles.selectText, bucketType === 'joint' && { color: Colors.secondary }]}>Joint</Text>
              </SelectButton>
              <SelectButton 
                selected={bucketType === 'personal'} 
                onPress={() => setBucketType('personal')}
                style={styles.flex}
              >
                <Ionicons name="person" size={20} color={bucketType === 'personal' ? Colors.primary : Colors.textMuted} />
                <Text style={[styles.selectText, bucketType === 'personal' && { color: Colors.primary }]}>Personal</Text>
              </SelectButton>
            </View>
          </View>

          {/* Item Type */}
          <View style={styles.section}>
            <Text style={styles.label}>TYPE</Text>
            <View style={styles.row}>
              <SelectButton selected={itemType === 'task'} onPress={() => setItemType('task')} style={styles.flex}>
                <Ionicons name="checkbox-outline" size={20} color={itemType === 'task' ? Colors.success : Colors.textMuted} />
                <Text style={[styles.selectText, itemType === 'task' && { color: Colors.success }]}>Task</Text>
              </SelectButton>
              <SelectButton selected={itemType === 'goal'} onPress={() => setItemType('goal')} style={styles.flex}>
                <Ionicons name="flag" size={20} color={itemType === 'goal' ? Colors.warning : Colors.textMuted} />
                <Text style={[styles.selectText, itemType === 'goal' && { color: Colors.warning }]}>Goal</Text>
              </SelectButton>
              <SelectButton selected={itemType === 'habit'} onPress={() => setItemType('habit')} style={styles.flex}>
                <Ionicons name="refresh" size={20} color={itemType === 'habit' ? Colors.info : Colors.textMuted} />
                <Text style={[styles.selectText, itemType === 'habit' && { color: Colors.info }]}>Habit</Text>
              </SelectButton>
            </View>
          </View>

          {/* Reward */}
          <View style={styles.section}>
            <Text style={styles.label}>REWARD</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.row}>
                {REWARDS.map((r) => (
                  <SelectButton 
                    key={r.value} 
                    selected={reward === r.value} 
                    onPress={() => setReward(r.value)}
                  >
                    <Text style={styles.rewardEmoji}>{r.emoji}</Text>
                    <Text style={[styles.rewardValue, reward === r.value && { color: Colors.secondary }]}>
                      {r.value}
                    </Text>
                    <Text style={styles.rewardLabel}>{r.label}</Text>
                  </SelectButton>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Assignee */}
          {bucketType === 'joint' && (
            <View style={styles.section}>
              <Text style={styles.label}>ASSIGNEE</Text>
              <View style={styles.row}>
                <SelectButton selected={assignee === 'me'} onPress={() => setAssignee('me')} style={styles.flex}>
                  <View style={[styles.avatar, assignee === 'me' && { borderColor: Colors.primary }]}>
                    <Ionicons name="person" size={20} color={assignee === 'me' ? Colors.primary : Colors.textMuted} />
                  </View>
                  <Text style={[styles.selectText, assignee === 'me' && { color: Colors.primary }]}>Me</Text>
                </SelectButton>
                {user?.partner_id && (
                  <SelectButton selected={assignee === 'partner'} onPress={() => setAssignee('partner')} style={styles.flex}>
                    <View style={[styles.avatar, assignee === 'partner' && { borderColor: Colors.secondary }]}>
                      <Ionicons name="heart" size={20} color={assignee === 'partner' ? Colors.secondary : Colors.textMuted} />
                    </View>
                    <Text style={[styles.selectText, assignee === 'partner' && { color: Colors.secondary }]}>
                      {user.partner_name?.split(' ')[0] || 'Partner'}
                    </Text>
                  </SelectButton>
                )}
                <SelectButton selected={assignee === 'anyone'} onPress={() => setAssignee('anyone')} style={styles.flex}>
                  <View style={[styles.avatar, assignee === 'anyone' && { borderColor: Colors.success }]}>
                    <Ionicons name="people" size={20} color={assignee === 'anyone' ? Colors.success : Colors.textMuted} />
                  </View>
                  <Text style={[styles.selectText, assignee === 'anyone' && { color: Colors.success }]}>Anyone</Text>
                </SelectButton>
              </View>
            </View>
          )}

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.label}>PRIORITY</Text>
            <View style={styles.row}>
              <SelectButton selected={priority === 'low'} onPress={() => setPriority('low')} style={styles.flex}>
                <View style={[styles.priorityDot, { backgroundColor: Colors.priorityLow }]} />
                <Text style={[styles.selectText, priority === 'low' && { color: Colors.priorityLow }]}>Low</Text>
              </SelectButton>
              <SelectButton selected={priority === 'medium'} onPress={() => setPriority('medium')} style={styles.flex}>
                <View style={[styles.priorityDot, { backgroundColor: Colors.priorityMedium }]} />
                <Text style={[styles.selectText, priority === 'medium' && { color: Colors.priorityMedium }]}>Medium</Text>
              </SelectButton>
              <SelectButton selected={priority === 'high'} onPress={() => setPriority('high')} style={styles.flex}>
                <View style={[styles.priorityDot, { backgroundColor: Colors.priorityHigh }]} />
                <Text style={[styles.selectText, priority === 'high' && { color: Colors.priorityHigh }]}>High</Text>
              </SelectButton>
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.section}>
            <Text style={styles.label}>FREQUENCY</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.row}>
                {(['once', 'daily', 'weekly', 'monthly'] as Frequency[]).map((f) => (
                  <SelectButton key={f} selected={frequency === f} onPress={() => setFrequency(f)}>
                    <Text style={[styles.selectText, frequency === f && { color: Colors.primary }]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </SelectButton>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
          >
            <Ionicons name="add-circle" size={24} color={Colors.text} />
            <Text style={styles.submitText}>
              {createMutation.isPending ? 'Adding...' : 'Add Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
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
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  titleInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  flex: {
    flex: 1,
  },
  selectBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 4,
  },
  selectBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  selectText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  priorityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardValue: {
    fontSize: FontSize.lg,
    fontWeight: '700',
    color: Colors.text,
  },
  rewardLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xxl : Spacing.lg,
    backgroundColor: Colors.backgroundSecondary,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  submitText: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
});
