// Bucket Keeper - Onboarding (3 slides)

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../src/store/authStore';
import { useThemeColors, GradientButton, StyledTextInput } from '../src/components/UIKit';
import { Typography, Spacing, BorderRadius, Layout, Shadows } from '../src/constants/theme';
import { Palette } from '../src/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    title: 'Say it. Done.',
    subtitle: "Add tasks with your voice, and let AI organize them for you. It's that simple.",
    icon: 'mic' as const,
  },
  {
    title: 'Better Together',
    subtitle: 'Add your partner or household members to share tasks, goals, and rewards.',
    icon: 'people' as const,
  },
  {
    title: 'Stay in Sync',
    subtitle: 'Connect your calendar to keep everything organized in one place.',
    icon: 'calendar' as const,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { completeOnboarding, linkPartner } = useAuthStore();
  const scrollRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [partnerCode, setPartnerCode] = useState('');
  const [linkError, setLinkError] = useState('');

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setCurrentSlide(index);
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1);
    }
  };

  const handleFinish = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleLinkPartner = async () => {
    if (!partnerCode.trim()) return;
    setLinkError('');
    try {
      await linkPartner(partnerCode.trim());
      handleNext();
    } catch (e: any) {
      setLinkError(e.message);
    }
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentSlide(index);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Slide 1: Welcome */}
        <View style={{ width: SCREEN_WIDTH, flex: 1, justifyContent: 'center', padding: Spacing.lg }}>
          <View style={{ alignItems: 'center' }}>
            {/* Animated mic orb */}
            <View style={{ marginBottom: Spacing.xxl }}>
              <LinearGradient
                colors={[colors.gradientStart, colors.gradientEnd]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  ...Layout.center,
                  ...Shadows.fab,
                }}
              >
                <Ionicons name="mic" size={48} color="#FFF" />
              </LinearGradient>
            </View>
            <Text style={{ ...Typography.h1, color: colors.text, textAlign: 'center' }}>
              {slides[0].title}
            </Text>
            <Text
              style={{
                ...Typography.body,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: Spacing.md,
                maxWidth: 280,
              }}
            >
              {slides[0].subtitle}
            </Text>
          </View>
        </View>

        {/* Slide 2: Add Members */}
        <View style={{ width: SCREEN_WIDTH, flex: 1, justifyContent: 'center', padding: Spacing.lg }}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: Palette.indigo15,
                ...Layout.center,
                marginBottom: Spacing.xxl,
              }}
            >
              <Ionicons name="people" size={48} color={colors.primary} />
            </View>
            <Text style={{ ...Typography.h1, color: colors.text, textAlign: 'center' }}>
              {slides[1].title}
            </Text>
            <Text
              style={{
                ...Typography.body,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: Spacing.md,
                maxWidth: 280,
                marginBottom: Spacing.xl,
              }}
            >
              {slides[1].subtitle}
            </Text>

            <View style={{ width: '100%', maxWidth: 300 }}>
              <StyledTextInput
                label="Partner's Code"
                placeholder="Enter 6-character code"
                value={partnerCode}
                onChangeText={setPartnerCode}
                autoCapitalize="characters"
                maxLength={6}
                error={linkError || undefined}
              />
              <GradientButton
                title="Link Partner"
                onPress={handleLinkPartner}
                style={{ marginTop: Spacing.md }}
              />
              <Pressable
                onPress={handleNext}
                style={{ alignItems: 'center', marginTop: Spacing.md }}
              >
                <Text style={{ ...Typography.bodyMedium, color: colors.textMuted }}>
                  Skip for now
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Slide 3: Calendar */}
        <View style={{ width: SCREEN_WIDTH, flex: 1, justifyContent: 'center', padding: Spacing.lg }}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: Palette.indigo15,
                ...Layout.center,
                marginBottom: Spacing.xxl,
              }}
            >
              <Ionicons name="calendar" size={48} color={colors.primary} />
            </View>
            <Text style={{ ...Typography.h1, color: colors.text, textAlign: 'center' }}>
              {slides[2].title}
            </Text>
            <Text
              style={{
                ...Typography.body,
                color: colors.textSecondary,
                textAlign: 'center',
                marginTop: Spacing.md,
                maxWidth: 280,
                marginBottom: Spacing.xl,
              }}
            >
              {slides[2].subtitle}
            </Text>

            <GradientButton
              title="Connect Google Calendar"
              onPress={() => {}} // Calendar connect logic
              icon="logo-google"
              style={{ width: '100%', maxWidth: 300 }}
            />
            <Pressable
              onPress={handleFinish}
              style={{ alignItems: 'center', marginTop: Spacing.lg }}
            >
              <Text style={{ ...Typography.bodyMedium, color: colors.textMuted }}>
                Skip & Get Started
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Dot pagination */}
      <View
        style={{
          ...Layout.row,
          justifyContent: 'center',
          paddingBottom: Spacing.xxl,
          gap: Spacing.sm,
        }}
      >
        {slides.map((_, i) => (
          <View
            key={i}
            style={{
              width: currentSlide === i ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: currentSlide === i ? colors.primary : colors.textMuted,
            }}
          />
        ))}
      </View>

      {/* Bottom CTA for slide 1 */}
      {currentSlide === 0 && (
        <View style={{ paddingHorizontal: Spacing.lg, paddingBottom: Spacing.lg }}>
          <GradientButton title="Get Started" onPress={handleNext} size="lg" />
        </View>
      )}
    </SafeAreaView>
  );
}
