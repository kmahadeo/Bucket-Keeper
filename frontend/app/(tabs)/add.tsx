import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Typography, Spacing, BorderRadius, Layout, Shadows } from '../../src/constants/theme';
import { Palette } from '../../src/constants/colors';
import {
  Card,
  Chip,
  GradientButton,
  StyledTextInput,
  useThemeColors,
} from '../../src/components/UIKit';
import { itemsApi } from '../../src/utils/api';
import { useAuthStore } from '../../src/store/authStore';

type BucketType = 'joint' | 'personal';
type ItemType = 'task' | 'goal' | 'habit';
type Priority = 'low' | 'medium' | 'high';
type Frequency = 'once' | 'daily' | 'weekly' | 'monthly';
type Assignee = 'me' | 'partner' | 'anyone';

const REWARD_OPTIONS = [
  { value: 10, label: 'Small', emoji: '\uD83E\uDE99' },
  { value: 25, label: 'Medium', emoji: '\uD83E\uDE99\uD83E\uDE99' },
  { value: 50, label: 'Large', emoji: '\uD83D\uDCB0' },
  { value: 100, label: 'Epic', emoji: '\uD83D\uDC8E' },
];

const PRIORITY_COLORS: Record<Priority, string> = {
  low: Palette.priorityLow,
  medium: Palette.warning,
  high: Palette.priorityHigh,
};

export default function AddScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = useThemeColors();
  const { user } = useAuthStore();

  const [title, setTitle] = useState('');
  const [bucketType, setBucketType] = useState<BucketType>('joint');
  const [itemType, setItemType] = useState<ItemType>('task');
  const [reward, setReward] = useState(10);
  const [assignee, setAssignee] = useState<Assignee>('anyone');
  const [priority, setPriority] = useState<Priority>('medium');
  const [frequency, setFrequency] = useState<Frequency>('once');
  const [dueDate, setDueDate] = useState<string | null>(null);

  const partnerName = user?.partner_name || 'Partner';

  const createMutation = useMutation({
    mutationFn: () =>
      itemsApi.create({
        title,
        bucket_type: bucketType,
        item_type: itemType,
        reward,
        assignee,
        priority,
        frequency,
        due_date: dueDate || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['snapshot'] });
      queryClient.invalidateQueries({ queryKey: ['priorities'] });
      router.back();
    },
    onError: (error: any) => {
      Alert.alert(
        'Error',
        error.response?.data?.detail || 'Failed to create item'
      );
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    createMutation.mutate();
  };

  const assigneeOptions: { key: Assignee; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'me', label: 'Me', icon: 'person' },
    { key: 'partner', label: partnerName, icon: 'heart' },
    { key: 'anyone', label: 'Anyone', icon: 'people' },
  ];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backBtn,
              { backgroundColor: colors.card },
              Shadows.subtle,
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[Typography.h3, { color: colors.text }]}>
            Add to {bucketType === 'joint' ? 'Joint' : 'Personal'} Bucket
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          style={styles.form}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title input */}
          <View style={styles.section}>
            <Text
              style={{
                ...Typography.label,
                color: colors.textSecondary,
                marginBottom: Spacing.sm,
              }}
            >
              WHAT NEEDS DOING?
            </Text>
            <StyledTextInput
              placeholder="e.g., Wash the car, Plan date night..."
              value={title}
              onChangeText={setTitle}
              multiline
              autoFocus
              style={{
                minHeight: 80,
                textAlignVertical: 'top',
                paddingTop: Spacing.md,
              }}
            />
          </View>

          {/* Bucket type toggle */}
          <View style={styles.section}>
            <Text
              style={{
                ...Typography.label,
                color: colors.textSecondary,
                marginBottom: Spacing.sm,
              }}
            >
              BUCKET
            </Text>
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={[
                  styles.selectCard,
                  {
                    flex: 1,
                    backgroundColor:
                      bucketType === 'joint' ? colors.primary : colors.card,
                    borderColor:
                      bucketType === 'joint'
                        ? colors.primary
                        : colors.cardBorder,
                  },
                ]}
                onPress={() => setBucketType('joint')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="people"
                  size={20}
                  color={bucketType === 'joint' ? '#FFF' : Palette.coinGold}
                />
                <Text
                  style={[
                    Typography.caption,
                    {
                      color:
                        bucketType === 'joint' ? '#FFF' : colors.textSecondary,
                      fontWeight: '600',
                    },
                  ]}
                >
                  Joint
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.selectCard,
                  {
                    flex: 1,
                    backgroundColor:
                      bucketType === 'personal' ? colors.primary : colors.card,
                    borderColor:
                      bucketType === 'personal'
                        ? colors.primary
                        : colors.cardBorder,
                  },
                ]}
                onPress={() => setBucketType('personal')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="person"
                  size={20}
                  color={
                    bucketType === 'personal' ? '#FFF' : colors.primary
                  }
                />
                <Text
                  style={[
                    Typography.caption,
                    {
                      color:
                        bucketType === 'personal'
                          ? '#FFF'
                          : colors.textSecondary,
                      fontWeight: '600',
                    },
                  ]}
                >
                  Personal
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Type selector */}
          <View style={styles.section}>
            <Text
              style={{
                ...Typography.label,
                color: colors.textSecondary,
                marginBottom: Spacing.sm,
              }}
            >
              TYPE
            </Text>
            <View style={styles.optionRow}>
              <Chip
                label="Task"
                icon="checkbox-outline"
                selected={itemType === 'task'}
                onPress={() => setItemType('task')}
              />
              <Chip
                label="Goal"
                icon="flag"
                selected={itemType === 'goal'}
                onPress={() => setItemType('goal')}
              />
              <Chip
                label="Habit"
                icon="refresh"
                selected={itemType === 'habit'}
                onPress={() => setItemType('habit')}
              />
            </View>
          </View>

          {/* Reward selector */}
          <View style={styles.section}>
            <Text
              style={{
                ...Typography.label,
                color: colors.textSecondary,
                marginBottom: Spacing.sm,
              }}
            >
              REWARD
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.optionRow}>
                {REWARD_OPTIONS.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[
                      styles.selectCard,
                      {
                        backgroundColor:
                          reward === r.value ? colors.primary : colors.card,
                        borderColor:
                          reward === r.value
                            ? colors.primary
                            : colors.cardBorder,
                      },
                    ]}
                    onPress={() => setReward(r.value)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="star"
                      size={16}
                      color={
                        reward === r.value ? '#FFF' : Palette.coinGold
                      }
                    />
                    <Text
                      style={{
                        ...Typography.h3,
                        color:
                          reward === r.value ? '#FFF' : Palette.coinGold,
                      }}
                    >
                      {r.value}
                    </Text>
                    <Text
                      style={{
                        ...Typography.tiny,
                        color:
                          reward === r.value
                            ? '#FFF'
                            : colors.textMuted,
                      }}
                    >
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Assignee */}
          <View style={styles.section}>
            <Text
              style={{
                ...Typography.label,
                color: colors.textSecondary,
                marginBottom: Spacing.sm,
              }}
            >
              ASSIGNEE
            </Text>
            <View style={styles.optionRow}>
              {assigneeOptions.map((opt) => (
                <TouchableOpacity
                  key={opt.key}
                  style={[
                    styles.selectCard,
                    {
                      flex: 1,
                      backgroundColor:
                        assignee === opt.key ? colors.card : colors.card,
                      borderColor:
                        assignee === opt.key
                          ? colors.primary
                          : colors.cardBorder,
                      borderWidth: assignee === opt.key ? 2 : 1,
                    },
                  ]}
                  onPress={() => setAssignee(opt.key)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={opt.icon}
                    size={22}
                    color={
                      assignee === opt.key
                        ? colors.primary
                        : colors.textMuted
                    }
                  />
                  <Text
                    style={[
                      Typography.caption,
                      {
                        color:
                          assignee === opt.key
                            ? colors.primary
                            : colors.textSecondary,
                        fontWeight: assignee === opt.key ? '700' : '500',
                        marginTop: 2,
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <Text
              style={{
                ...Typography.label,
                color: colors.textSecondary,
                marginBottom: Spacing.sm,
              }}
            >
              PRIORITY
            </Text>
            <View style={styles.optionRow}>
              {(['low', 'medium', 'high'] as Priority[]).map((p) => (
                <Chip
                  key={p}
                  label={p.charAt(0).toUpperCase() + p.slice(1)}
                  selected={priority === p}
                  onPress={() => setPriority(p)}
                  color={
                    priority === p ? PRIORITY_COLORS[p] : undefined
                  }
                />
              ))}
            </View>
          </View>

          {/* Frequency */}
          <View style={styles.section}>
            <Text
              style={{
                ...Typography.label,
                color: colors.textSecondary,
                marginBottom: Spacing.sm,
              }}
            >
              FREQUENCY
            </Text>
            <View style={styles.optionRow}>
              {(['once', 'daily', 'weekly', 'monthly'] as Frequency[]).map(
                (f) => (
                  <Chip
                    key={f}
                    label={f.charAt(0).toUpperCase() + f.slice(1)}
                    selected={frequency === f}
                    onPress={() => setFrequency(f)}
                  />
                )
              )}
            </View>
          </View>

          {/* Due Date */}
          <View style={styles.section}>
            <Text
              style={{
                ...Typography.label,
                color: colors.textSecondary,
                marginBottom: Spacing.sm,
              }}
            >
              DUE DATE
            </Text>
            <TouchableOpacity
              style={[
                styles.dateButton,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
              onPress={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setDueDate(
                  dueDate ? null : tomorrow.toISOString().split('T')[0]
                );
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={dueDate ? colors.primary : colors.textMuted}
              />
              <Text
                style={{
                  ...Typography.body,
                  color: dueDate ? colors.text : colors.textMuted,
                  marginLeft: Spacing.sm,
                }}
              >
                {dueDate || 'Pick Date'}
              </Text>
              {dueDate && (
                <TouchableOpacity
                  onPress={() => setDueDate(null)}
                  style={{ marginLeft: 'auto' }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Submit footer */}
        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
              borderTopColor: colors.cardBorder,
            },
          ]}
        >
          <GradientButton
            title={createMutation.isPending ? 'Adding...' : 'Add Item'}
            onPress={handleSubmit}
            disabled={createMutation.isPending || !title.trim()}
            loading={createMutation.isPending}
            size="lg"
            icon="add-circle"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  optionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  selectCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xxl : Spacing.lg,
    borderTopWidth: 1,
  },
});
