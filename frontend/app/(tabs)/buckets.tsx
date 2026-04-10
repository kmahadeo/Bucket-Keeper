import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Typography, Spacing, BorderRadius, Layout } from '../../src/constants/theme';
import { Palette, BucketColors } from '../../src/constants/colors';
import { Card, Chip, GradientButton, useThemeColors } from '../../src/components/UIKit';
import { itemsApi, BucketItem } from '../../src/utils/api';

type FilterType = 'all' | 'joint' | 'personal';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_GAP = Spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - CARD_GAP) / 2;

interface BucketGroup {
  id: string;
  name: string;
  color: string;
  icon: string;
  type: 'joint' | 'personal';
  items: BucketItem[];
  completedCount: number;
  totalCount: number;
}

function groupItemsIntoBuckets(items: BucketItem[]): BucketGroup[] {
  const jointItems = items.filter((i) => i.bucket_type === 'joint');
  const personalItems = items.filter((i) => i.bucket_type === 'personal');

  const buckets: BucketGroup[] = [];

  if (jointItems.length > 0) {
    buckets.push({
      id: 'joint',
      name: 'Joint Bucket',
      color: BucketColors[0],
      icon: '\uD83E\uDD1D',
      type: 'joint',
      items: jointItems,
      completedCount: jointItems.filter((i) => i.completed).length,
      totalCount: jointItems.length,
    });
  }

  if (personalItems.length > 0) {
    buckets.push({
      id: 'personal',
      name: 'Personal Bucket',
      color: BucketColors[1],
      icon: '\uD83C\uDFAF',
      type: 'personal',
      items: personalItems,
      completedCount: personalItems.filter((i) => i.completed).length,
      totalCount: personalItems.length,
    });
  }

  // Group by item_type within each bucket_type for more granularity
  const taskItems = items.filter((i) => i.item_type === 'task' && !i.completed);
  const goalItems = items.filter((i) => i.item_type === 'goal' && !i.completed);
  const habitItems = items.filter((i) => i.item_type === 'habit' && !i.completed);

  if (taskItems.length > 0) {
    buckets.push({
      id: 'tasks',
      name: 'Tasks',
      color: BucketColors[7],
      icon: '\u2705',
      type: 'joint',
      items: taskItems,
      completedCount: 0,
      totalCount: taskItems.length,
    });
  }

  if (goalItems.length > 0) {
    buckets.push({
      id: 'goals',
      name: 'Goals',
      color: BucketColors[6],
      icon: '\uD83C\uDFF3\uFE0F',
      type: 'joint',
      items: goalItems,
      completedCount: 0,
      totalCount: goalItems.length,
    });
  }

  if (habitItems.length > 0) {
    buckets.push({
      id: 'habits',
      name: 'Habits',
      color: BucketColors[4],
      icon: '\uD83D\uDD01',
      type: 'personal',
      items: habitItems,
      completedCount: 0,
      totalCount: habitItems.length,
    });
  }

  return buckets;
}

export default function BucketsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = useThemeColors();
  const { updateCoins } = useAuthStore();
  const [filter, setFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data: items, isLoading, refetch } = useQuery({
    queryKey: ['items', filter],
    queryFn: () =>
      itemsApi
        .getAll({
          bucket_type: filter === 'all' ? undefined : filter,
          archived: false,
        })
        .then((r) => r.data),
  });

  const completeMutation = useMutation({
    mutationFn: (itemId: string) => itemsApi.complete(itemId),
    onSuccess: (response) => {
      const data = response.data as any;
      if (data?.coins_joint !== undefined) {
        updateCoins(data.coins_joint, data.coins_personal);
      }
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['snapshot'] });
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const buckets = groupItemsIntoBuckets(items || []);

  const renderBucketCard = ({ item }: { item: BucketGroup }) => {
    const progress =
      item.totalCount > 0 ? item.completedCount / item.totalCount : 0;
    const pendingCount = item.totalCount - item.completedCount;

    return (
      <Card
        style={{
            width: CARD_WIDTH,
            marginBottom: CARD_GAP,
          }}
        padded={false}
        onPress={() => router.push('/(tabs)/add')}
      >
        {/* Color accent bar */}
        <View
          style={{
            height: 4,
            backgroundColor: item.color,
            borderTopLeftRadius: BorderRadius.card,
            borderTopRightRadius: BorderRadius.card,
          }}
        />

        <View style={{ padding: Spacing.md }}>
          {/* Icon and lock */}
          <View style={[Layout.rowBetween, { marginBottom: Spacing.sm }]}>
            <Text style={{ fontSize: 28 }}>{item.icon}</Text>
            {item.type === 'personal' && (
              <Ionicons
                name="lock-closed"
                size={14}
                color={colors.textMuted}
              />
            )}
          </View>

          {/* Bucket name */}
          <Text
            style={{
              ...Typography.h3,
              color: colors.text,
              marginBottom: Spacing.xs,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>

          {/* Task count */}
          <Text
            style={{
              ...Typography.caption,
              color: colors.textSecondary,
              marginBottom: Spacing.sm,
            }}
          >
            {pendingCount} {pendingCount === 1 ? 'item' : 'items'} pending
          </Text>

          {/* Progress bar */}
          <View
            style={{
              height: 4,
              backgroundColor: Palette.white06,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: `${Math.round(progress * 100)}%`,
                backgroundColor: item.color,
                borderRadius: 2,
              }}
            />
          </View>
        </View>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[Typography.h1, { color: colors.text }]}>Buckets</Text>
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterRow}>
            <Chip
              label="All"
              selected={filter === 'all'}
              onPress={() => setFilter('all')}
            />
            <Chip
              label="Joint"
              selected={filter === 'joint'}
              onPress={() => setFilter('joint')}
              icon="people"
              color={Palette.coinGold}
            />
            <Chip
              label="Personal"
              selected={filter === 'personal'}
              onPress={() => setFilter('personal')}
              icon="person"
            />
          </View>
        </ScrollView>
      </View>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : buckets.length > 0 ? (
        <FlatList
          data={buckets}
          renderItem={renderBucketCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            paddingHorizontal: Spacing.lg,
          }}
          contentContainerStyle={{ paddingTop: Spacing.sm, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      ) : (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: colors.card },
            ]}
          >
            <Ionicons
              name="clipboard-outline"
              size={48}
              color={colors.textMuted}
            />
          </View>
          <Text
            style={{
              ...Typography.h3,
              color: colors.text,
              marginBottom: Spacing.xs,
            }}
          >
            No buckets yet
          </Text>
          <Text
            style={{
              ...Typography.body,
              color: colors.textSecondary,
              textAlign: 'center',
              marginBottom: Spacing.lg,
              paddingHorizontal: Spacing.xl,
            }}
          >
            Create your first bucket to start organizing tasks with your partner
          </Text>
          <GradientButton
            title="Create Bucket"
            icon="add"
            onPress={() => router.push('/(tabs)/add')}
            size="lg"
          />
        </View>
      )}

      {/* Floating add button */}
      {buckets.length > 0 && (
        <View style={styles.fab}>
          <GradientButton
            title=""
            icon="add"
            onPress={() => router.push('/(tabs)/add')}
            size="lg"
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
            }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  filters: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: Spacing.xxl,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.lg,
  },
});
