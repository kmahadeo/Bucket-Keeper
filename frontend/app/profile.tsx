// Bucket Keeper - Profile / Settings Screen
// Theme switching, partner linking, account management

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Share,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useThemeColors,
  Card,
  GradientButton,
  StyledTextInput,
  Chip,
  Divider,
} from '../src/components/UIKit';
import { Typography, Spacing, BorderRadius, Layout, Shadows } from '../src/constants/theme';
import { Palette, getThemeNames } from '../src/constants/colors';
import { useAuthStore } from '../src/store/authStore';
import { useAppStore } from '../src/store/appStore';
import type { ThemeMode, ThemeName } from '../src/types';

const THEME_OPTIONS: { name: ThemeName; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { name: 'default', label: 'Default', icon: 'color-palette' },
  { name: 'couples', label: 'Couples', icon: 'heart' },
  { name: 'friends', label: 'Friends', icon: 'people' },
  { name: 'family', label: 'Family', icon: 'home' },
  { name: 'roommates', label: 'Roommates', icon: 'bed' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { user, logout, linkPartner } = useAuthStore();
  const { themeMode, themeName, setThemeMode, setThemeName } = useAppStore();

  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  const handleLinkPartner = async () => {
    if (!partnerCode.trim()) {
      setLinkError('Please enter a partner code');
      return;
    }
    setLinking(true);
    setLinkError('');
    try {
      const partnerName = await linkPartner(partnerCode.trim());
      setShowPartnerModal(false);
      setPartnerCode('');
      Alert.alert('Connected!', `You're now linked with ${partnerName}!`);
    } catch (error: any) {
      setLinkError(error.message);
    } finally {
      setLinking(false);
    }
  };

  const sharePartnerCode = async () => {
    if (user?.partner_code) {
      try {
        await Share.share({
          message: `Join me on Bucket Keeper! Use my partner code: ${user.partner_code}`,
        });
      } catch {
        Alert.alert('Partner Code', user.partner_code);
      }
    }
  };

  const toggleThemeMode = async () => {
    const newMode: ThemeMode = themeMode === 'dark' ? 'light' : 'dark';
    await setThemeMode(newMode);
  };

  const selectThemeName = async (name: ThemeName) => {
    await setThemeName(name);
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          ...Layout.rowBetween,
          paddingHorizontal: Spacing.screenHorizontal,
          paddingTop: Spacing.md,
          paddingBottom: Spacing.sm,
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
        <Text style={{ ...Typography.h3, color: colors.text }}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: Spacing.xxxl }}
        showsVerticalScrollIndicator={false}
      >
        {/* Gradient Header Area with Avatar */}
        <View style={{ paddingHorizontal: Spacing.screenHorizontal, marginTop: Spacing.md }}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: BorderRadius.card,
              paddingVertical: Spacing.xl,
              alignItems: 'center',
              ...Shadows.elevated,
            }}
          >
            {/* Large Avatar */}
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: 'rgba(255,255,255,0.2)',
                ...Layout.center,
                marginBottom: Spacing.md,
              }}
            >
              <Text style={{ fontSize: 36, color: '#FFF', fontWeight: '700' }}>
                {user?.mood_emoji || userInitial}
              </Text>
            </View>

            {/* User Name & Email */}
            <Text style={{ ...Typography.h2, color: '#FFF' }}>
              {user?.name || 'User'}
            </Text>
            <Text
              style={{
                ...Typography.bodySmall,
                color: 'rgba(255,255,255,0.75)',
                marginTop: Spacing.xs,
              }}
            >
              {user?.email || ''}
            </Text>
          </LinearGradient>
        </View>

        {/* Stats Row */}
        <View
          style={{
            ...Layout.row,
            gap: Spacing.md,
            paddingHorizontal: Spacing.screenHorizontal,
            marginTop: Spacing.lg,
          }}
        >
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ ...Typography.h2, color: Palette.coinGold }}>
              {user?.coins_joint ?? 0}
            </Text>
            <Text style={{ ...Typography.caption, color: colors.textSecondary, marginTop: Spacing.xs }}>
              Joint Coins
            </Text>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ ...Typography.h2, color: colors.primary }}>
              {user?.coins_personal ?? 0}
            </Text>
            <Text style={{ ...Typography.caption, color: colors.textSecondary, marginTop: Spacing.xs }}>
              Personal Coins
            </Text>
          </Card>
        </View>

        {/* Partner Section */}
        <View style={{ paddingHorizontal: Spacing.screenHorizontal, marginTop: Spacing.sectionGap }}>
          <Text style={{ ...Typography.label, color: colors.textSecondary, marginBottom: Spacing.md }}>
            PARTNER
          </Text>

          {user?.partner_id ? (
            <Card>
              <View style={Layout.row}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    backgroundColor: Palette.error + '15',
                    ...Layout.center,
                    marginRight: Spacing.md,
                  }}
                >
                  <Ionicons name="heart" size={24} color={Palette.error} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...Typography.bodyMedium, color: colors.text }}>
                    Linked with {user.partner_name || 'Partner'}
                  </Text>
                  <Text style={{ ...Typography.caption, color: colors.textSecondary, marginTop: 2 }}>
                    Sharing tasks & earning together
                  </Text>
                </View>
              </View>
            </Card>
          ) : (
            <View>
              {/* Partner Code Display */}
              <Card style={{ marginBottom: Spacing.md }}>
                <Text style={{ ...Typography.caption, color: colors.textSecondary }}>
                  Your Partner Code
                </Text>
                <View style={{ ...Layout.rowBetween, marginTop: Spacing.sm }}>
                  <Text
                    style={{
                      ...Typography.h1,
                      color: colors.primary,
                      letterSpacing: 4,
                    }}
                  >
                    {user?.partner_code || '------'}
                  </Text>
                  <Pressable
                    onPress={sharePartnerCode}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      backgroundColor: Palette.indigo15,
                      ...Layout.center,
                    }}
                  >
                    <Ionicons name="share-outline" size={20} color={colors.primary} />
                  </Pressable>
                </View>
                <Text style={{ ...Typography.caption, color: colors.textMuted, marginTop: Spacing.sm }}>
                  Share this code with your partner
                </Text>
              </Card>

              <GradientButton
                title="Link Partner"
                onPress={() => setShowPartnerModal(true)}
                icon="link"
              />
            </View>
          )}
        </View>

        {/* Appearance Section */}
        <View style={{ paddingHorizontal: Spacing.screenHorizontal, marginTop: Spacing.sectionGap }}>
          <Text style={{ ...Typography.label, color: colors.textSecondary, marginBottom: Spacing.md }}>
            APPEARANCE
          </Text>

          {/* Theme Mode Toggle */}
          <Card>
            <View style={Layout.rowBetween}>
              <View style={Layout.row}>
                <Ionicons
                  name={themeMode === 'dark' ? 'moon' : 'sunny'}
                  size={20}
                  color={colors.primary}
                  style={{ marginRight: Spacing.md }}
                />
                <Text style={{ ...Typography.bodyMedium, color: colors.text }}>
                  {themeMode === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
              <Pressable
                onPress={toggleThemeMode}
                style={{
                  width: 52,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: themeMode === 'dark' ? colors.primary : Palette.white10,
                  justifyContent: 'center',
                  paddingHorizontal: 3,
                }}
              >
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#FFF',
                    alignSelf: themeMode === 'dark' ? 'flex-end' : 'flex-start',
                    ...Shadows.subtle,
                  }}
                />
              </Pressable>
            </View>
          </Card>

          {/* Theme Name Selector - Horizontal Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: Spacing.sm, marginTop: Spacing.md, paddingVertical: Spacing.xs }}
          >
            {THEME_OPTIONS.map((option) => (
              <Chip
                key={option.name}
                label={option.label}
                icon={option.icon}
                selected={themeName === option.name}
                onPress={() => selectThemeName(option.name)}
              />
            ))}
          </ScrollView>
        </View>

        {/* Integrations Section */}
        <View style={{ paddingHorizontal: Spacing.screenHorizontal, marginTop: Spacing.sectionGap }}>
          <Text style={{ ...Typography.label, color: colors.textSecondary, marginBottom: Spacing.md }}>
            INTEGRATIONS
          </Text>

          <Card onPress={() => router.push('/calendar-sync')}>
            <View style={Layout.rowBetween}>
              <View style={Layout.row}>
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    backgroundColor: Palette.indigo15,
                    ...Layout.center,
                    marginRight: Spacing.md,
                  }}
                >
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                </View>
                <View>
                  <Text style={{ ...Typography.bodyMedium, color: colors.text }}>
                    Google Calendar
                  </Text>
                  <Text style={{ ...Typography.caption, color: colors.textSecondary, marginTop: 2 }}>
                    Sync tasks with your calendar
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </View>
          </Card>
        </View>

        {/* Sign Out */}
        <View style={{ paddingHorizontal: Spacing.screenHorizontal, marginTop: Spacing.sectionGap }}>
          <GradientButton
            title="Sign Out"
            onPress={handleLogout}
            icon="log-out-outline"
            variant="outline"
            style={{ borderColor: colors.error }}
          />
        </View>
      </ScrollView>

      {/* Link Partner Modal */}
      <Modal visible={showPartnerModal} transparent animationType="fade">
        <Pressable
          onPress={() => setShowPartnerModal(false)}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: Spacing.lg,
          }}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              backgroundColor: colors.card,
              borderRadius: BorderRadius.card,
              padding: Spacing.lg,
              width: '100%',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: Palette.error + '15',
                  ...Layout.center,
                  marginBottom: Spacing.md,
                }}
              >
                <Ionicons name="heart" size={28} color={Palette.error} />
              </View>
              <Text style={{ ...Typography.h2, color: colors.text }}>Link with Partner</Text>
              <Text
                style={{
                  ...Typography.bodySmall,
                  color: colors.textSecondary,
                  textAlign: 'center',
                  marginTop: Spacing.xs,
                }}
              >
                Enter your partner's code to connect
              </Text>
            </View>

            <StyledTextInput
              placeholder="Enter 6-character code"
              value={partnerCode}
              onChangeText={setPartnerCode}
              autoCapitalize="characters"
              maxLength={6}
              error={linkError || undefined}
              style={{ ...Typography.h2, textAlign: 'center', letterSpacing: 4 }}
            />

            <GradientButton
              title={linking ? 'Linking...' : 'Connect'}
              onPress={handleLinkPartner}
              loading={linking}
              disabled={linking}
              style={{ marginTop: Spacing.lg }}
              size="lg"
            />
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
