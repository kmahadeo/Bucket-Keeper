import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { Colors, BorderRadius, Shadows } from '../constants/theme';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  noPadding?: boolean;
  glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  style,
  intensity = 20,
  noPadding = false,
  glowColor,
}) => {
  return (
    <View style={[
      styles.container,
      glowColor && Shadows.glow(glowColor),
      style,
    ]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blur}>
        <View style={[
          styles.content,
          noPadding && { padding: 0 },
        ]}>
          {children}
        </View>
      </BlurView>
      {/* Glass border */}
      <View style={styles.border} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    backgroundColor: Colors.glass,
  },
  blur: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
});
