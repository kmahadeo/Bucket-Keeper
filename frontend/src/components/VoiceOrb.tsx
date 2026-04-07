// Bucket Keeper - VoiceOrb
// Mic button with ripple rings when recording, breathing pulse when idle

import React, { useEffect } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from 'react-native-reanimated';

import { Shadows, Layout } from '../constants/theme';
import { Duration, Easings } from '../constants/animations';
import { useThemeColors } from './UIKit';

// ── Props ─────────────────────────────────────────────────────

interface VoiceOrbProps {
  onRecordStart: () => void;
  onRecordStop: () => void;
  isRecording: boolean;
  size?: number;
}

// ── Ripple Ring ───────────────────────────────────────────────

function RippleRing({
  size,
  delay,
  isRecording,
  color,
}: {
  size: number;
  delay: number;
  isRecording: boolean;
  color: string;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isRecording) {
      scale.value = withDelay(
        delay,
        withRepeat(
          withTiming(2.5, { duration: Duration.micRipple, easing: Easings.decelerate }),
          -1,
          false,
        ),
      );
      opacity.value = withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(0.6, { duration: 100 }),
            withTiming(0, {
              duration: Duration.micRipple - 100,
              easing: Easings.decelerate,
            }),
          ),
          -1,
          false,
        ),
      );
    } else {
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: color,
        },
        animatedStyle,
      ]}
    />
  );
}

// ── Component ─────────────────────────────────────────────────

export function VoiceOrb({
  onRecordStart,
  onRecordStop,
  isRecording,
  size = 64,
}: VoiceOrbProps) {
  const colors = useThemeColors();

  // Idle breathing pulse
  const breatheScale = useSharedValue(1);

  useEffect(() => {
    if (!isRecording) {
      breatheScale.value = withRepeat(
        withSequence(
          withTiming(1.06, {
            duration: Duration.micPulse / 2,
            easing: Easings.standard,
          }),
          withTiming(1.0, {
            duration: Duration.micPulse / 2,
            easing: Easings.standard,
          }),
        ),
        -1,
        false,
      );
    } else {
      breatheScale.value = withTiming(1, { duration: 150 });
    }
  }, [isRecording]);

  const breatheStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breatheScale.value }],
  }));

  const handlePress = () => {
    if (isRecording) {
      onRecordStop();
    } else {
      onRecordStart();
    }
  };

  return (
    <View style={[styles.wrapper, { width: size * 2.5, height: size * 2.5 }]}>
      {/* Ripple rings (visible when recording) */}
      <RippleRing
        size={size}
        delay={0}
        isRecording={isRecording}
        color={colors.gradientStart}
      />
      <RippleRing
        size={size}
        delay={400}
        isRecording={isRecording}
        color={colors.gradientEnd}
      />
      <RippleRing
        size={size}
        delay={800}
        isRecording={isRecording}
        color={colors.gradientStart}
      />

      {/* Main button */}
      <Animated.View style={breatheStyle}>
        <Pressable
          onPress={handlePress}
          style={({ pressed }) => ({
            opacity: pressed ? 0.85 : 1,
          })}
        >
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              {
                width: size,
                height: size,
                borderRadius: size / 2,
              },
              Layout.center,
              Shadows.fab,
            ]}
          >
            <Ionicons name="mic" size={size * 0.4} color="#FFF" />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    ...Layout.center,
  },
});
