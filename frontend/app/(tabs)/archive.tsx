// Bucket Keeper - Memory Archive Screen
// Timeline of completed tasks grouped by date

import React, { useCallback } from 'react';
import {
  View,
  Text,
  SectionList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useThemeColors, Card, Badge } from '../../src/components/UIKit';
import { Typography, Spacing, BorderRadius, Layout, Shadows } from '../../src/constants/theme';
import { Palette } from '../../src/constants/colors';
import { itemsApi, type BucketItem } from '../../src/utils/api';

interface ArchiveSection {
  title: string;
  data: BucketItem[];
}

function groupByDate(items: BucketItem[]): ArchiveSection[] {
  const groups = new Map<string, BucketItem[]>();

  const sorted = [...items].sort((a, b) => {
    const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0;
    const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0;
    return dateB - dateA;
  });

  for (const item of sorted) {
    const dateStr = item.completed_at
      ? format(new Date(item.completed_at), 'MMMM d, yyyy')
      : 'Unknown Date';

    if (!groups.has(dateStr)) {
      groups.set(dateStr, []);
    }
    groups.get(dateStr)!.push(item);
  }

  return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
}

export default function ArchiveScreen() {
  const colors = useThemeColors();

  const {
    data: completedItems,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['archived-items'],
    queryFn: () => itemsApi.getAll({ completed: true }).then((r) => r.data),
  });

  const sections = completedItems ? groupByDate(completedItems) : [];

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: Spacing.screenHorizontal,
          paddingTop: Spacing.md,
          paddingBottom: Spacing.sm,
        }}
      >
        <Text style={{ ...Typography.h1, color: colors.text }}>
          Memory Archive
        </Text>
        <Text
          style={{
            ...Typography.body,
            color: colors.textSecondary,
            marginTop: Spacing.xs,
          }}
        >
          Everything you've accomplished together.
        </Text>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={{ flex: 1, ...Layout.center }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* Content */}
      {!isLoading && (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.item_id}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderSectionHeader={({ section: { title } }) => (
            <View
              style={{
                paddingHorizontal: Spacing.screenHorizontal,
                paddingTop: Spacing.lg,
                paddingBottom: Spacing.sm,
                backgroundColor: colors.background,
              }}
            >
              <Text style={{ ...Typography.h3, color: colors.text }}>
                {title}
              </Text>
            </View>
          )}
          renderItem={({ item, index, section }) => {
            const isLast = index === section.data.length - 1;

            return (
              <View
                style={{
                  paddingHorizontal: Spacing.screenHorizontal,
                  flexDirection: 'row',
                }}
              >
                {/* Timeline: green dot + connecting line */}
                <View style={{ width: 32, alignItems: 'center', marginRight: Spacing.sm }}>
                  {/* Green checkmark circle */}
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: Palette.success + '20',
                      ...Layout.center,
                      zIndex: 1,
                    }}
                  >
                    <Ionicons name="checkmark" size={14} color={Palette.success} />
                  </View>
                  {/* Vertical connecting line */}
                  {!isLast && (
                    <View
                      style={{
                        width: 2,
                        flex: 1,
                        backgroundColor: Palette.success + '30',
                        marginTop: -2,
                      }}
                    />
                  )}
                </View>

                {/* Task Card */}
                <View style={{ flex: 1, marginBottom: Spacing.sm }}>
                  <Card>
                    <Text
                      style={{ ...Typography.bodyMedium, color: colors.text }}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>

                    <View style={{ ...Layout.row, gap: Spacing.sm, marginTop: Spacing.sm, flexWrap: 'wrap' }}>
                      <Badge
                        text={item.bucket_type === 'joint' ? 'JOINT BUCKET' : 'PERSONAL BUCKET'}
                        color={item.bucket_type === 'joint' ? Palette.indigo15 : Palette.white10}
                        textColor={item.bucket_type === 'joint' ? colors.primary : colors.textSecondary}
                      />
                      <Badge
                        text={`+${item.reward} \u{1F315}`}
                        color={Palette.coinGold + '20'}
                        textColor={Palette.coinGold}
                      />
                    </View>

                    {item.completed_at && (
                      <Text
                        style={{
                          ...Typography.tiny,
                          color: colors.textMuted,
                          marginTop: Spacing.xs,
                        }}
                      >
                        {(() => {
                          try {
                            return format(new Date(item.completed_at), 'h:mm a');
                          } catch {
                            return '';
                          }
                        })()}
                      </Text>
                    )}
                  </Card>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View
              style={{
                ...Layout.center,
                paddingVertical: Spacing.xxxl,
                paddingHorizontal: Spacing.xl,
              }}
            >
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: Palette.white06,
                  ...Layout.center,
                  marginBottom: Spacing.lg,
                }}
              >
                <Ionicons name="file-tray-outline" size={36} color={colors.textMuted} />
              </View>
              <Text
                style={{
                  ...Typography.h3,
                  color: colors.text,
                  textAlign: 'center',
                }}
              >
                No completed tasks yet
              </Text>
              <Text
                style={{
                  ...Typography.body,
                  color: colors.textMuted,
                  textAlign: 'center',
                  marginTop: Spacing.sm,
                }}
              >
                Complete some tasks and they will appear here as memories.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
