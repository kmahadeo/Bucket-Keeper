// Bucket Keeper - Google Calendar Sync Screen
// Connection status, event list, and sync controls

import React from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { useThemeColors, Card, GradientButton, Badge } from '../src/components/UIKit';
import { Typography, Spacing, BorderRadius, Layout, Shadows } from '../src/constants/theme';
import { Palette } from '../src/constants/colors';
import { calendarApi } from '../src/utils/api';

function formatEventTime(start: string, end: string, isAllDay: boolean): string {
  if (isAllDay) return 'All day';
  try {
    return `${format(parseISO(start), 'h:mm a')} - ${format(parseISO(end), 'h:mm a')}`;
  } catch {
    return '';
  }
}

function formatEventDate(dateStr: string): string {
  try {
    return format(parseISO(dateStr), 'EEEE, MMMM d');
  } catch {
    return '';
  }
}

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

  const isConnected = status?.connected === true;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          ...Layout.rowBetween,
          paddingHorizontal: Spacing.screenHorizontal,
          paddingTop: Spacing.md,
          paddingBottom: Spacing.md,
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
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={{ ...Typography.h3, color: colors.text }}>Calendar Sync</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing.screenHorizontal,
          paddingBottom: Spacing.xxxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Loading */}
        {statusLoading && (
          <View style={{ ...Layout.center, paddingVertical: Spacing.xxl }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {/* Connection Status Card */}
        {!statusLoading && (
          <Card style={{ marginBottom: Spacing.lg }}>
            <View style={Layout.rowBetween}>
              <View style={Layout.row}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: isConnected ? Palette.success + '15' : Palette.white10,
                    ...Layout.center,
                    marginRight: Spacing.md,
                  }}
                >
                  <Ionicons
                    name="calendar"
                    size={24}
                    color={isConnected ? Palette.success : colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...Typography.bodyMedium, color: colors.text }}>
                    Google Calendar
                  </Text>
                  {isConnected && status?.email && (
                    <Text
                      style={{
                        ...Typography.caption,
                        color: colors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      {status.email}
                    </Text>
                  )}
                </View>
              </View>
              <Badge
                text={isConnected ? 'Connected' : 'Not Connected'}
                color={isConnected ? Palette.success + '20' : Palette.white10}
                textColor={isConnected ? Palette.success : colors.textMuted}
              />
            </View>
          </Card>
        )}

        {/* Connect Button */}
        {!statusLoading && !isConnected && (
          <GradientButton
            title="Connect Google Calendar"
            onPress={() => {
              // Calendar OAuth flow would be triggered here
            }}
            icon="logo-google"
            size="lg"
            style={{ marginBottom: Spacing.sectionGap }}
          />
        )}

        {/* Upcoming Events */}
        {isConnected && (
          <View style={{ marginTop: Spacing.md }}>
            <Text
              style={{
                ...Typography.label,
                color: colors.textSecondary,
                marginBottom: Spacing.md,
              }}
            >
              UPCOMING EVENTS
            </Text>

            {eventsLoading && (
              <View style={{ ...Layout.center, paddingVertical: Spacing.xl }}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}

            {!eventsLoading && events && events.length > 0 && (
              <View style={{ gap: Spacing.sm }}>
                {events.map((event) => (
                  <Card key={event.id}>
                    <View style={Layout.row}>
                      {/* Accent bar */}
                      <View
                        style={{
                          width: 4,
                          height: 44,
                          borderRadius: 2,
                          backgroundColor: colors.primary,
                          marginRight: Spacing.md,
                        }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{ ...Typography.bodyMedium, color: colors.text }}
                          numberOfLines={1}
                        >
                          {event.title}
                        </Text>
                        <View style={{ ...Layout.row, gap: Spacing.sm, marginTop: Spacing.xs }}>
                          <View style={Layout.row}>
                            <Ionicons
                              name="time-outline"
                              size={12}
                              color={colors.textMuted}
                              style={{ marginRight: 3 }}
                            />
                            <Text style={{ ...Typography.caption, color: colors.textMuted }}>
                              {formatEventTime(event.startTime, event.endTime, event.isAllDay)}
                            </Text>
                          </View>
                          <View style={Layout.row}>
                            <Ionicons
                              name="calendar-outline"
                              size={12}
                              color={colors.textMuted}
                              style={{ marginRight: 3 }}
                            />
                            <Text style={{ ...Typography.caption, color: colors.textMuted }}>
                              {formatEventDate(event.startTime)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </Card>
                ))}
              </View>
            )}

            {!eventsLoading && (!events || events.length === 0) && (
              <Card>
                <View style={{ ...Layout.center, paddingVertical: Spacing.lg }}>
                  <Ionicons name="calendar-outline" size={36} color={colors.textMuted} />
                  <Text
                    style={{
                      ...Typography.body,
                      color: colors.textMuted,
                      textAlign: 'center',
                      marginTop: Spacing.md,
                    }}
                  >
                    No upcoming events
                  </Text>
                </View>
              </Card>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
