// Bucket Keeper - Calendar Sync Screen

import React from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useThemeColors, Card, GradientButton, Badge } from '../src/components/UIKit';
import { Typography, Spacing, Layout, BorderRadius } from '../src/constants/theme';
import { Palette } from '../src/constants/colors';
import { calendarApi } from '../src/utils/api';
import { format, parseISO } from 'date-fns';

export default function CalendarSyncScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['calendar-status'],
    queryFn: () => calendarApi.getStatus().then((r) => r.data),
  });

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: () => calendarApi.getEvents().then((r) => r.data),
    enabled: status?.connected === true,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          ...Layout.row,
          paddingHorizontal: Spacing.screenHorizontal,
          paddingVertical: Spacing.md,
          gap: Spacing.md,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: Palette.white06,
            ...Layout.center,
          }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </Pressable>
        <Text style={{ ...Typography.h2, color: colors.text }}>Calendar Sync</Text>
      </View>

      <View
        style={{
          paddingHorizontal: Spacing.screenHorizontal,
          gap: Spacing.sectionGap,
          flex: 1,
        }}
      >
        {/* Connection Status */}
        <Card>
          <View style={Layout.rowBetween}>
            <View style={Layout.row}>
              <Ionicons
                name="calendar"
                size={22}
                color={status?.connected ? Palette.success : colors.textMuted}
                style={{ marginRight: Spacing.md }}
              />
              <View>
                <Text style={{ ...Typography.bodyMedium, color: colors.text }}>
                  Google Calendar
                </Text>
                {status?.email && (
                  <Text style={{ ...Typography.caption, color: colors.textMuted }}>
                    {status.email}
                  </Text>
                )}
              </View>
            </View>
            <Badge
              text={status?.connected ? 'Connected' : 'Not Connected'}
              color={status?.connected ? Palette.success + '20' : Palette.white10}
              textColor={status?.connected ? Palette.success : colors.textMuted}
            />
          </View>
        </Card>

        {!status?.connected && !statusLoading && (
          <GradientButton
            title="Connect Google Calendar"
            onPress={() => {}}
            icon="logo-google"
            size="lg"
          />
        )}

        {/* Upcoming Events */}
        {status?.connected && (
          <>
            <Text style={{ ...Typography.label, color: colors.textSecondary }}>
              UPCOMING EVENTS
            </Text>

            {eventsLoading ? (
              <View style={{ ...Layout.center, paddingVertical: Spacing.xl }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : events && events.length > 0 ? (
              <FlatList
                data={events}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Card style={{ marginBottom: Spacing.sm }}>
                    <View style={Layout.row}>
                      <View
                        style={{
                          width: 4,
                          height: 36,
                          borderRadius: 2,
                          backgroundColor: colors.primary,
                          marginRight: Spacing.md,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...Typography.bodyMedium, color: colors.text }}>
                          {item.title}
                        </Text>
                        <Text style={{ ...Typography.caption, color: colors.textMuted }}>
                          {formatEventTime(item.startTime, item.endTime, item.isAllDay)}
                        </Text>
                      </View>
                    </View>
                  </Card>
                )}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Card>
                <Text
                  style={{
                    ...Typography.body,
                    color: colors.textMuted,
                    textAlign: 'center',
                    paddingVertical: Spacing.md,
                  }}
                >
                  No upcoming events
                </Text>
              </Card>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

function formatEventTime(start: string, end: string, isAllDay: boolean): string {
  if (isAllDay) return 'All day';
  try {
    return `${format(parseISO(start), 'h:mm a')} - ${format(parseISO(end), 'h:mm a')}`;
  } catch {
    return '';
  }
}
