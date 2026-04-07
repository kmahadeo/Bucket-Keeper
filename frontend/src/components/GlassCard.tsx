// Bucket Keeper - Glass Card Component

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeColors } from './UIKit';
import { BorderRadius, Shadows, Spacing } from '../constants/theme';
import { Palette } from '../constants/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  noPadding?: boolean;
}

export function GlassCard({
  children,
  style,
  intensity = 20,
  noPadding = false,
}: GlassCardProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[
        {
          borderRadius: BorderRadius.card,
          overflow: 'hidden',
          ...Shadows.card,
        },
        style,
      ]}
    >
      <BlurView intensity={intensity} tint="dark" style={{ flex: 1 }}>
        <View style={[{ flex: 1 }, !noPadding && { padding: Spacing.md }]}>
          {children}
        </View>
      </BlurView>
      {/* Glass border */}
      <View
        pointerEvents="none"
        style={{
          ...StyleSheet.absoluteFillObject,
          borderRadius: BorderRadius.card,
          borderWidth: 1,
          borderColor: Palette.white06,
        }}
      />
    </View>
  );
}
