import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../constants/theme';
import { GlassCard } from './GlassCard';

interface SkeuomorphicButtonProps {
  title: string;
  icon?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
}

const VARIANTS = {
  primary: {
    gradient: ['#A855F7', '#7C3AED'],
    glow: '#A855F7',
  },
  secondary: {
    gradient: ['#6B7280', '#4B5563'],
    glow: '#6B7280',
  },
  success: {
    gradient: ['#10B981', '#059669'],
    glow: '#10B981',
  },
  danger: {
    gradient: ['#EF4444', '#DC2626'],
    glow: '#EF4444',
  },
};

const SIZES = {
  small: { height: 40, fontSize: FontSize.sm, iconSize: 16, padding: Spacing.md },
  medium: { height: 52, fontSize: FontSize.md, iconSize: 20, padding: Spacing.lg },
  large: { height: 60, fontSize: FontSize.lg, iconSize: 24, padding: Spacing.xl },
};

export const SkeuomorphicButton: React.FC<SkeuomorphicButtonProps> = ({
  title,
  icon,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
}) => {
  const variantConfig = VARIANTS[variant];
  const sizeConfig = SIZES[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.container,
        {
          height: sizeConfig.height,
          opacity: disabled ? 0.5 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
      ]}
    >
      {/* Outer shadow/bevel */}
      <View style={[styles.outerShadow, Shadows.medium]} />
      
      {/* Main button */}
      <LinearGradient
        colors={variantConfig.gradient as [string, string]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Inner highlight */}
        <View style={styles.innerHighlight} />
        
        {/* Content */}
        <View style={[styles.content, { paddingHorizontal: sizeConfig.padding }]}>
          {icon && (
            <Ionicons 
              name={icon as any} 
              size={sizeConfig.iconSize} 
              color={Colors.text}
              style={{ marginRight: Spacing.sm }}
            />
          )}
          <Text style={[styles.title, { fontSize: sizeConfig.fontSize }]}>
            {loading ? 'Loading...' : title}
          </Text>
        </View>
        
        {/* Bottom shadow for depth */}
        <View style={styles.bottomShadow} />
      </LinearGradient>
    </Pressable>
  );
};

// 3D Icon Button for tasks
interface Icon3DProps {
  icon: string;
  color: string;
  size?: number;
  onPress?: () => void;
}

export const Icon3D: React.FC<Icon3DProps> = ({
  icon,
  color,
  size = 48,
  onPress,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;
  
  return (
    <Wrapper 
      onPress={onPress}
      style={[
        styles.icon3dContainer,
        {
          width: size,
          height: size,
          borderRadius: size * 0.3,
        },
        Shadows.medium,
      ]}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[color, adjustColor(color, -30)]}
        style={styles.icon3dGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Top highlight */}
        <View style={styles.icon3dHighlight} />
        <Ionicons name={icon as any} size={size * 0.5} color="#FFF" />
      </LinearGradient>
    </Wrapper>
  );
};

// Helper to darken/lighten colors
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  outerShadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.md,
  },
  gradient: {
    flex: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  innerHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Colors.text,
    fontWeight: '600',
  },
  bottomShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  icon3dContainer: {
    overflow: 'hidden',
  },
  icon3dGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  icon3dHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderTopLeftRadius: BorderRadius.md,
    borderTopRightRadius: BorderRadius.md,
  },
});
