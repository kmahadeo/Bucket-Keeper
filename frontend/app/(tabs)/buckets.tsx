import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { TaskCard } from '../../src/components/TaskCard';
import { itemsApi, BucketItem } from '../../src/utils/api';
import { useRouter } from 'expo-router';

type FilterType = 'all' | 'joint' | 'personal';
type StatusFilter = 'pending' | 'completed';

export default function BucketsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { updateCoins } = useAuthStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('pending');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch items
  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['items', filter, statusFilter],
    queryFn: () => itemsApi.getAll({
      bucket_type: filter === 'all' ? undefined : filter,
      completed: statusFilter === 'completed',
      archived: false,
    }).then(r => r.data),
  });

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: (itemId: string) => itemsApi.complete(itemId),
    onSuccess: (response) => {
      updateCoins(response.data.coins_joint, response.data.coins_personal);
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['snapshot'] });
    },
  });

  // Archive mutation
  const archiveMutation = useMutation({
    mutationFn: (itemId: string) => itemsApi.archive(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const FilterButton = ({ type, label, icon }: { type: FilterType; label: string; icon: string }) => (
    <TouchableOpacity
      style={[styles.filterBtn, filter === type && styles.filterBtnActive]}
      onPress={() => setFilter(type)}
    >
      <Ionicons 
        name={icon as any} 
        size={16} 
        color={filter === type ? Colors.text : Colors.textMuted} 
      />
      <Text style={[styles.filterText, filter === type && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Buckets</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => router.push('/(tabs)/add')}
        >
          <Ionicons name="add" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <FilterButton type="all" label="All" icon="apps" />
        <FilterButton type="joint" label="Joint" icon="people" />
        <FilterButton type="personal" label="Personal" icon="person" />
      </View>

      {/* Status Toggle */}
      <View style={styles.statusToggle}>
        <TouchableOpacity
          style={[styles.statusBtn, statusFilter === 'pending' && styles.statusBtnActive]}
          onPress={() => setStatusFilter('pending')}
        >
          <Text style={[styles.statusText, statusFilter === 'pending' && styles.statusTextActive]}>
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statusBtn, statusFilter === 'completed' && styles.statusBtnActive]}
          onPress={() => setStatusFilter('completed')}
        >
          <Text style={[styles.statusText, statusFilter === 'completed' && styles.statusTextActive]}>
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Items List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : items && items.length > 0 ? (
          items.map((item) => (
            <TaskCard
              key={item.item_id}
              item={item}
              onComplete={() => !item.completed && completeMutation.mutate(item.item_id)}
              onPress={() => {}}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {statusFilter === 'completed' ? 'No completed items yet' : 'No items yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {statusFilter === 'pending' 
                ? 'Tap + to add your first task or goal'
                : 'Complete tasks to see them here'
              }
            </Text>
            {statusFilter === 'pending' && (
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/(tabs)/add')}
              >
                <Ionicons name="add" size={20} color={Colors.text} />
                <Text style={styles.emptyButtonText}>Add Item</Text>
              </TouchableOpacity>
            )}
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
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  filterBtnActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  filterTextActive: {
    color: Colors.text,
  },
  statusToggle: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.md,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  statusBtnActive: {
    backgroundColor: Colors.primary,
  },
  statusText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  statusTextActive: {
    color: Colors.text,
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
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  emptyButtonText: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
