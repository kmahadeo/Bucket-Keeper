// Bucket Keeper - Auth Screen
// Dark themed with gradient accents

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../src/store/authStore';
import { useThemeColors, StyledTextInput, GradientButton } from '../src/components/UIKit';
import { Typography, Spacing, BorderRadius, Shadows, Layout } from '../src/constants/theme';
import { Palette } from '../src/constants/colors';

export default function AuthScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login, register, processOAuthSession } = useAuthStore();
  const colors = useThemeColors();

  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const url = event.url;
      if (url.includes('session_id=')) {
        const sessionId = url.split('session_id=')[1]?.split('&')[0]?.split('#')[0];
        if (sessionId) {
          try {
            setSubmitting(true);
            await processOAuthSession(sessionId);
          } catch (e: any) {
            setError(e.message);
          } finally {
            setSubmitting(false);
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => subscription.remove();
  }, []);

  const handleGoogleLogin = async () => {
    const redirectUrl = Linking.createURL('/');
    const authUrl = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    try {
      await WebBrowser.openBrowserAsync(authUrl);
    } catch (e) {
      console.error('Failed to open browser:', e);
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || (!isLoginMode && !name)) {
      setError('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      if (isLoginMode) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, ...Layout.center }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Decorative gradient orbs */}
      <View style={{ position: 'absolute', top: -80, right: -60, opacity: 0.15 }}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={{ width: 200, height: 200, borderRadius: 100 }}
        />
      </View>
      <View style={{ position: 'absolute', bottom: 60, left: -40, opacity: 0.1 }}>
        <LinearGradient
          colors={[colors.gradientEnd, colors.gradientStart]}
          style={{ width: 160, height: 160, borderRadius: 80 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: Spacing.lg, justifyContent: 'center' }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo & Tagline */}
          <View style={{ alignItems: 'center', marginBottom: Spacing.xxl }}>
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 20,
                ...Layout.center,
                marginBottom: Spacing.md,
                ...Shadows.fab,
              }}
            >
              <Ionicons name="heart" size={36} color="#FFF" />
            </LinearGradient>
            <Text style={{ ...Typography.h1, color: colors.text, marginBottom: Spacing.xs }}>
              Bucket Keeper
            </Text>
            <Text style={{ ...Typography.body, color: colors.textSecondary }}>
              Let's Gamify Your Relationship
            </Text>
          </View>

          {/* Form */}
          <View style={{ gap: Spacing.md }}>
            {!isLoginMode && (
              <StyledTextInput
                label="Name"
                placeholder="Your name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}

            <StyledTextInput
              label="Email"
              placeholder="hello@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <StyledTextInput
              label="Password"
              placeholder="Your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={error || undefined}
            />

            <GradientButton
              title={submitting ? 'Please wait...' : isLoginMode ? 'Sign In' : 'Create Account'}
              onPress={handleSubmit}
              disabled={submitting}
              loading={submitting}
              size="lg"
              style={{ marginTop: Spacing.sm }}
            />

            {/* Divider */}
            <View style={{ ...Layout.row, marginVertical: Spacing.sm }}>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.cardBorder }} />
              <Text style={{ ...Typography.caption, color: colors.textMuted, marginHorizontal: Spacing.md }}>
                or
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: colors.cardBorder }} />
            </View>

            {/* Google */}
            <Pressable
              onPress={handleGoogleLogin}
              style={({ pressed }) => ({
                ...Layout.row,
                justifyContent: 'center',
                backgroundColor: colors.card,
                height: 48,
                borderRadius: BorderRadius.button,
                borderWidth: 1,
                borderColor: colors.cardBorder,
                gap: Spacing.sm,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Ionicons name="logo-google" size={20} color={colors.text} />
              <Text style={{ ...Typography.bodyMedium, color: colors.text }}>
                Continue with Google
              </Text>
            </Pressable>

            {/* Switch mode */}
            <Pressable
              onPress={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
              style={{ alignItems: 'center', paddingVertical: Spacing.md }}
            >
              <Text style={{ ...Typography.body, color: colors.textSecondary }}>
                {isLoginMode ? "Don't have an account? " : 'Already have an account? '}
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  {isLoginMode ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
