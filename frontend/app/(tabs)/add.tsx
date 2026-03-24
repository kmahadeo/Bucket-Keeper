import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { Card, Button, Chip } from '../../src/components/UIKit';
import { itemsApi } from '../../src/utils/api';
import { useAuthStore } from '../../src/store/authStore';

type BucketType = 'joint' | 'personal';
type ItemType = 'task' | 'goal' | 'habit';
type Priority = 'low' | 'medium' | 'high';
type Frequency = 'once' | 'daily' | 'weekly' | 'monthly';

const REWARDS = [
  { value: 5, label: 'Tiny' },
  { value: 10, label: 'Small' },
  { value: 25, label: 'Medium' },
  { value: 50, label: 'Big' },
  { value: 100, label: 'Huge' },
];

export default function AddScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  const [title, setTitle] = useState('');
  const [bucketType, setBucketType] = useState<BucketType>('joint');
  const [itemType, setItemType] = useState<ItemType>('task');
  const [reward, setReward] = useState(10);
  const [priority, setPriority] = useState<Priority>('medium');
  const [frequency, setFrequency] = useState<Frequency>('once');

  const createMutation = useMutation({
    mutationFn: () => itemsApi.create({
      title,
      bucket_type: bucketType,
      item_type: itemType,
      reward,
      assignee: 'anyone',
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

  const SelectOption = ({ selected, onPress, children, style }: any) => (
    <TouchableOpacity
      style={[styles.selectOption, selected && styles.selectOptionActive, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {children}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New {bucketType === 'joint' ? 'Joint' : 'Personal'} Item</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>What needs doing?</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.titleInput}
                placeholder="e.g., Wash the car, Plan date night..."
                placeholderTextColor={Colors.textMuted}
                value={title}
                onChangeText={setTitle}
                multiline
                autoFocus
              />
            </View>
          </View>

          {/* Bucket Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Bucket</Text>
            <View style={styles.optionRow}>
              <SelectOption selected={bucketType === 'joint'} onPress={() => setBucketType('joint')} style={{ flex: 1 }}>
                <Ionicons name="people" size={20} color={bucketType === 'joint' ? '#FFF' : Colors.accent} />
                <Text style={[styles.optionText, bucketType === 'joint' && styles.optionTextActive]}>Joint</Text>
              </SelectOption>
              <SelectOption selected={bucketType === 'personal'} onPress={() => setBucketType('personal')} style={{ flex: 1 }}>
                <Ionicons name="person" size={20} color={bucketType === 'personal' ? '#FFF' : Colors.primary} />
                <Text style={[styles.optionText, bucketType === 'personal' && styles.optionTextActive]}>Personal</Text>
              </SelectOption>
            </View>
          </View>

          {/* Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Type</Text>
            <View style={styles.optionRow}>
              {[
                { type: 'task', icon: 'checkbox-outline', label: 'Task' },
                { type: 'goal', icon: 'flag', label: 'Goal' },
                { type: 'habit', icon: 'refresh', label: 'Habit' },
              ].map((item) => (
                <SelectOption key={item.type} selected={itemType === item.type} onPress={() => setItemType(item.type as ItemType)} style={{ flex: 1 }}>
                  <Ionicons name={item.icon as any} size={20} color={itemType === item.type ? '#FFF' : Colors.textSecondary} />
                  <Text style={[styles.optionText, itemType === item.type && styles.optionTextActive]}>{item.label}</Text>
                </SelectOption>
              ))}
            </View>
          </View>

          {/* Reward */}
          <View style={styles.section}>
            <Text style={styles.label}>Reward</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionRow}>
                {REWARDS.map((r) => (
                  <SelectOption key={r.value} selected={reward === r.value} onPress={() => setReward(r.value)}>
                    <Ionicons name="star" size={16} color={reward === r.value ? '#FFF' : Colors.gold} />
                    <Text style={[styles.rewardValue, reward === r.value && { color: '#FFF' }]}>{r.value}</Text>
                    <Text style={[styles.rewardLabel, reward === r.value && { color: '#FFF' }]}>{r.label}</Text>
                  </SelectOption>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.optionRow}>
              {[
                { value: 'low', label: 'Low', color: Colors.priorityLow },
                { value: 'medium', label: 'Medium', color: Colors.priorityMedium },
                { value: 'high', label: 'High', color: Colors.priorityHigh },
              ].map((p) => (
                <SelectOption key={p.value} selected={priority === p.value} onPress={() => setPriority(p.value as Priority)} style={{ flex: 1 }}>
                  <View style={[styles.priorityDot, { backgroundColor: priority === p.value ? '#FFF' : p.color }]} />
                  <Text style={[styles.optionText, priority === p.value && styles.optionTextActive]}>{p.label}</Text>
                </SelectOption>
              ))}
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.section}>
            <Text style={styles.label}>Frequency</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.optionRow}>
                {(['once', 'daily', 'weekly', 'monthly'] as Frequency[]).map((f) => (
                  <SelectOption key={f} selected={frequency === f} onPress={() => setFrequency(f)}>
                    <Text style={[styles.optionText, frequency === f && styles.optionTextActive]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </Text>
                  </SelectOption>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Submit */}
        <View style={styles.footer}>
          <Button
            title={createMutation.isPending ? 'Adding...' : 'Add Item'}
            onPress={handleSubmit}
            disabled={createMutation.isPending}
            size="large"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  headerTitle: { ...Typography.h3, color: Colors.text },
  form: { flex: 1, paddingHorizontal: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  label: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.sm },
  inputContainer: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titleInput: {
    padding: Spacing.md,
    ...Typography.body,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  optionRow: { flexDirection: 'row', gap: Spacing.sm },
  selectOption: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  selectOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: { ...Typography.caption, color: Colors.textSecondary },
  optionTextActive: { color: '#FFF', fontWeight: '600' },
  priorityDot: { width: 10, height: 10, borderRadius: 5 },
  rewardValue: { ...Typography.h3, color: Colors.gold },
  rewardLabel: { ...Typography.caption, color: Colors.textMuted },
  footer: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xxl : Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
