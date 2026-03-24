import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/constants/theme';
import { AnimatedGradientBackground } from '../../src/components/AnimatedGradientBackground';
import { GlassCard } from '../../src/components/GlassCard';
import { Icon3D } from '../../src/components/SkeuomorphicElements';
import { itemsApi, BucketItem } from '../../src/utils/api';

type FilterType = 'all' | 'joint' | 'personal';
type StatusFilter = 'pending' | 'completed';

export default function BucketsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { updateCoins } = useAuthStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [refreshing, setRefreshing] = useState(false);

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['items', filter, statusFilter],
    queryFn: () => itemsApi.getAll({
      bucket_type: filter === 'all' ? undefined : filter,
      completed: statusFilter === 'completed',
      archived: false,
    }).then(r => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: (itemId: string) => itemsApi.complete(itemId),
    onSuccess: (response) => {
      updateCoins(response.data.coins_joint, response.data.coins_personal);
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['snapshot'] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'goal': return 'flag';
      case 'habit': return 'refresh';
      default: return 'checkbox-outline';
    }
  };

  const FilterPill = ({ type, label, icon }: { type: FilterType; label: string; icon: string }) => (
    <TouchableOpacity
      style={[styles.filterPill, filter === type && styles.filterPillActive]}
      onPress={() => setFilter(type)}
    >
      {filter === type ? (
        <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.filterPillGradient}>
          <Ionicons name={icon as any} size={14} color="#FFF" />
          <Text style={styles.filterPillTextActive}>{label}</Text>
        </LinearGradient>
      ) : (
        <>
          <Ionicons name={icon as any} size={14} color={Colors.textMuted} />
          <Text style={styles.filterPillText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Buckets</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/add')}>
            <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.addBtn}>
              <Ionicons name="add" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View style={styles.filters}>
          <FilterPill type="all" label="All" icon="apps" />
          <FilterPill type="joint" label="Joint" icon="people" />
          <FilterPill type="personal" label="Personal" icon="person" />
        </View>

        {/* Status Toggle */}
        <GlassCard style={styles.statusToggle} noPadding>
          <View style={styles.statusToggleInner}>
            <TouchableOpacity
              style={[styles.statusBtn, statusFilter === 'pending' && styles.statusBtnActive]}
              onPress={() => setStatusFilter('pending')}
            >
              {statusFilter === 'pending' && (
                <LinearGradient colors={['#A855F7', '#7C3AED']} style={StyleSheet.absoluteFill} />
              )}
              <Text style={[styles.statusText, statusFilter === 'pending' && styles.statusTextActive]}>
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.statusBtn, statusFilter === 'completed' && styles.statusBtnActive]}
              onPress={() => setStatusFilter('completed')}
            >
              {statusFilter === 'completed' && (
                <LinearGradient colors={['#10B981', '#059669']} style={StyleSheet.absoluteFill} />
              )}
              <Text style={[styles.statusText, statusFilter === 'completed' && styles.statusTextActive]}>
                Completed
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        {/* Items List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.accent} />
            </View>
          ) : items && items.length > 0 ? (
            items.map((item) => (
              <GlassCard key={item.item_id} style={styles.taskCard}>
                <TouchableOpacity 
                  style={[styles.checkBox, item.completed && styles.checkBoxCompleted]}
                  onPress={() => !item.completed && completeMutation.mutate(item.item_id)}
                >
                  {item.completed ? (
                    <LinearGradient colors={['#10B981', '#059669']} style={styles.checkBoxGradient}>
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    </LinearGradient>
                  ) : null}
                </TouchableOpacity>
                
                <View style={styles.taskContent}>
                  <Text style={[styles.taskTitle, item.completed && styles.taskTitleCompleted]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={styles.taskMeta}>
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                    <Text style={styles.taskMetaText}>{item.priority}</Text>
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardText}>✨ {item.reward}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.typeIndicator}>
                  <Icon3D 
                    icon={item.bucket_type === 'joint' ? 'people' : 'person'}
                    color={item.bucket_type === 'joint' ? '#F59E0B' : '#A855F7'}
                    size={36}
                  />
                </View>
              </GlassCard>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon3D icon="clipboard-outline" color="#6B7280" size={64} />
              <Text style={styles.emptyTitle}>
                {statusFilter === 'completed' ? 'No completed items yet' : 'No items yet'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {statusFilter === 'pending' 
                  ? 'Tap + to add your first task'
                  : 'Complete tasks to see them here'
                }
              </Text>
              {statusFilter === 'pending' && (
                <TouchableOpacity onPress={() => router.push('/(tabs)/add')}>
                  <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.emptyButton}>
                    <Ionicons name="add" size={20} color="#FFF" />
                    <Text style={styles.emptyButtonText}>Add Item</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
          )}
          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.medium,
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: Spacing.xs,
  },
  filterPillActive: {
    padding: 0,
    borderWidth: 0,
    overflow: 'hidden',
  },
  filterPillGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  filterPillText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  filterPillTextActive: {
    fontSize: FontSize.sm,
    color: '#FFF',
    fontWeight: '600',
  },
  statusToggle: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statusToggleInner: {
    flexDirection: 'row',
    padding: 4,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  statusBtnActive: {},
  statusText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  statusTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  loadingContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  checkBoxCompleted: {
    borderWidth: 0,
  },
  checkBoxGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
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
    textTransform: 'capitalize',
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
  typeIndicator: {
    marginLeft: Spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
