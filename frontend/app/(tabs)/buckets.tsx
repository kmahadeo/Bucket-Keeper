import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { Card, Chip, Button } from '../../src/components/UIKit';
import { TaskCard } from '../../src/components/TaskCard';
import { itemsApi } from '../../src/utils/api';

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Buckets</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(tabs)/add')}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
            <Chip label="Joint" selected={filter === 'joint'} onPress={() => setFilter('joint')} color={Colors.accent} />
            <Chip label="Personal" selected={filter === 'personal'} onPress={() => setFilter('personal')} />
          </View>
        </ScrollView>
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

      {/* List */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
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
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="clipboard-outline" size={48} color={Colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {statusFilter === 'completed' ? 'No completed items' : 'No items yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {statusFilter === 'pending' ? 'Add your first task to get started' : 'Complete tasks to see them here'}
            </Text>
            {statusFilter === 'pending' && (
              <View style={{ marginTop: Spacing.lg }}>
                <Button title="Add Item" icon="add" onPress={() => router.push('/(tabs)/add')} />
              </View>
            )}
          </View>
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { ...Typography.h1, color: Colors.text },
  addBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  filters: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.sm },
  filterRow: { flexDirection: 'row', gap: Spacing.sm },
  statusToggle: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.card,
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
  statusBtnActive: { backgroundColor: Colors.primary },
  statusText: { ...Typography.caption, color: Colors.textSecondary },
  statusTextActive: { color: '#FFF', fontWeight: '600' },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
  loadingContainer: { paddingVertical: Spacing.xxl, alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: { ...Typography.h3, color: Colors.text },
  emptySubtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
});
