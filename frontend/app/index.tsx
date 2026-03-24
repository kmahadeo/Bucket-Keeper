import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuthStore } from '../src/store/authStore';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../src/constants/theme';
import { AnimatedGradientBackground } from '../src/components/AnimatedGradientBackground';
import { GlassCard } from '../src/components/GlassCard';
import { SkeuomorphicButton } from '../src/components/SkeuomorphicElements';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login, register, processOAuthSession } = useAuthStore();
  
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle deep link from OAuth
  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const url = event.url;
      if (url.includes('session_id=')) {
        const sessionId = url.split('session_id=')[1]?.split('&')[0]?.split('#')[0];
        if (sessionId) {
          try {
            setSubmitting(true);
            await processOAuthSession(sessionId);
            router.replace('/(tabs)');
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

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading]);

  const handleGoogleLogin = async () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
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
      router.replace('/(tabs)');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <AnimatedGradientBackground>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.accent} />
        </View>
      </AnimatedGradientBackground>
    );
  }

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logo & Title */}
            <View style={styles.header}>
              <LinearGradient
                colors={['#EC4899', '#A855F7', '#6366F1']}
                style={styles.logoContainer}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="heart" size={48} color="#FFF" />
              </LinearGradient>
              <Text style={styles.title}>Bucket Keeper</Text>
              <Text style={styles.subtitle}>Gamify your love story</Text>
            </View>

            {/* Form */}
            <GlassCard style={styles.formCard}>
              {!isLoginMode && (
                <View style={styles.inputContainer}>
                  <Ionicons name="person-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Your name"
                    placeholderTextColor={Colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <SkeuomorphicButton
                title={isLoginMode ? 'Sign In' : 'Create Account'}
                onPress={handleSubmit}
                loading={submitting}
                variant="primary"
                size="large"
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.googleButton}
                onPress={handleGoogleLogin}
              >
                <LinearGradient
                  colors={[Colors.glass, Colors.glassDark]}
                  style={styles.googleGradient}
                >
                  <Ionicons name="logo-google" size={20} color={Colors.text} />
                  <Text style={styles.googleButtonText}>Continue with Google</Text>
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>

            <TouchableOpacity 
              style={styles.switchButton}
              onPress={() => {
                setIsLoginMode(!isLoginMode);
                setError('');
              }}
            >
              <Text style={styles.switchText}>
                {isLoginMode 
                  ? "Don't have an account? " 
                  : "Already have an account? "}
                <Text style={styles.switchTextBold}>
                  {isLoginMode ? 'Sign Up' : 'Sign In'}
                </Text>
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.strong,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  formCard: {
    padding: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassDark,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.glassBorder,
  },
  dividerText: {
    color: Colors.textMuted,
    marginHorizontal: Spacing.md,
    fontSize: FontSize.sm,
  },
  googleButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  googleGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  googleButtonText: {
    color: Colors.text,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  switchButton: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  switchText: {
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
  },
  switchTextBold: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
