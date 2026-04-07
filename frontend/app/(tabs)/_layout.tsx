// Bucket Keeper - Tab Navigation Layout
// 5 tabs: Home, Buckets, + (FAB), Store, Archive

import React from 'react';
import { View, Platform } from 'react-native';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../src/store/appStore';
import { getTheme } from '../../src/constants/colors';
import { Spacing, BorderRadius, Shadows, TabBar } from '../../src/constants/theme';

export default function TabsLayout() {
  const { themeMode, themeName } = useAppStore();
  const colors = getTheme(themeMode, themeName);
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 1,
          borderTopColor: colors.tabBarBorder,
          height: TabBar.height,
          paddingTop: Spacing.xs,
          paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.sm,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={TabBar.iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="buckets"
        options={{
          title: 'Buckets',
          tabBarIcon: ({ color }) => (
            <Ionicons name="grid-outline" size={TabBar.iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={{
              marginBottom: Platform.OS === 'ios' ? 20 : 8,
              ...Shadows.fab,
            }}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: TabBar.fabSize,
                  height: TabBar.fabSize,
                  borderRadius: BorderRadius.lg,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="add" size={28} color="#FFF" />
              </LinearGradient>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="store"
        options={{
          title: 'Store',
          tabBarIcon: ({ color }) => (
            <Ionicons name="storefront-outline" size={TabBar.iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color }) => (
            <Ionicons name="file-tray-full-outline" size={TabBar.iconSize} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
