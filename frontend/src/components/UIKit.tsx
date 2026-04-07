// Bucket Keeper - Core UI Kit
// Theme-aware primitive components

import React from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput as RNTextInput,
  type ViewStyle,
  type TextInputProps,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/appStore';
import { getTheme, Palette } from '../constants/colors';
import { Typography, Spacing, BorderRadius, Shadows, Layout } from '../constants/theme';
import type { ThemeColors } from '../types';

// ── Hook: useThemeColors ───────────────────────────────────────

export function useThemeColors(): ThemeColors {
  const { themeMode, themeName } = useAppStore();
  return getTheme(themeMode, themeName);
}

// ── Card ───────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  padded?: boolean;
}

export function Card({ children, style, onPress, padded = true }: CardProps) {
  const colors = useThemeColors();

  const cardStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(padded && {
      paddingVertical: Spacing.cardPaddingV,
      paddingHorizontal: Spacing.cardPaddingH,
    }),
    ...Shadows.card,
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [cardStyle, pressed && { opacity: 0.92 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

// ── GradientButton ─────────────────────────────────────────────

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function GradientButton({
  title,
  onPress,
  icon,
  loading,
  disabled,
  variant = 'primary',
  size = 'md',
  style,
}: GradientButtonProps) {
  const colors = useThemeColors();

  const heights = { sm: 36, md: 48, lg: 56 };
  const fontSizes = { sm: 13, md: 15, lg: 17 };
  const iconSizes = { sm: 16, md: 18, lg: 22 };

  if (variant === 'outline') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          {
            height: heights[size],
            borderRadius: BorderRadius.button,
            borderWidth: 1.5,
            borderColor: colors.primary,
            ...Layout.center,
            flexDirection: 'row' as const,
            paddingHorizontal: Spacing.lg,
            opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <>
            {icon && (
              <Ionicons name={icon} size={iconSizes[size]} color={colors.primary} style={{ marginRight: 8 }} />
            )}
            <Text style={{ color: colors.primary, fontSize: fontSizes[size], fontWeight: '600' }}>
              {title}
            </Text>
          </>
        )}
      </Pressable>
    );
  }

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          {
            height: heights[size],
            borderRadius: BorderRadius.button,
            backgroundColor: Palette.white10,
            ...Layout.center,
            flexDirection: 'row' as const,
            paddingHorizontal: Spacing.lg,
            opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colors.text} />
        ) : (
          <>
            {icon && (
              <Ionicons name={icon} size={iconSizes[size]} color={colors.text} style={{ marginRight: 8 }} />
            )}
            <Text style={{ color: colors.text, fontSize: fontSizes[size], fontWeight: '600' }}>
              {title}
            </Text>
          </>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [{ opacity: disabled ? 0.5 : pressed ? 0.9 : 1 }, style]}
    >
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: heights[size],
          borderRadius: BorderRadius.button,
          ...Layout.center,
          flexDirection: 'row' as const,
          paddingHorizontal: Spacing.lg,
          ...Shadows.fab,
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFF" />
        ) : (
          <>
            {icon && (
              <Ionicons name={icon} size={iconSizes[size]} color="#FFF" style={{ marginRight: 8 }} />
            )}
            <Text style={{ color: '#FFF', fontSize: fontSizes[size], fontWeight: '700' }}>
              {title}
            </Text>
          </>
        )}
      </LinearGradient>
    </Pressable>
  );
}

// ── Chip ───────────────────────────────────────────────────────

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md';
}

export function Chip({ label, selected, onPress, color, icon, size = 'md' }: ChipProps) {
  const colors = useThemeColors();
  const chipColor = color ?? colors.primary;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
        paddingHorizontal: size === 'sm' ? 10 : 14,
        paddingVertical: size === 'sm' ? 4 : 6,
        borderRadius: BorderRadius.pill,
        backgroundColor: selected ? chipColor : 'transparent',
        borderWidth: 1,
        borderColor: selected ? chipColor : colors.textMuted,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'sm' ? 12 : 14}
          color={selected ? '#FFF' : colors.textMuted}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={{
          fontSize: size === 'sm' ? 11 : 13,
          fontWeight: '600',
          color: selected ? '#FFF' : colors.textMuted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// ── Avatar ─────────────────────────────────────────────────────

interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
  emoji?: string;
}

export function Avatar({ name, color, size = 40, emoji }: AvatarProps) {
  const colors = useThemeColors();
  const bgColor = color ?? colors.primary;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        ...Layout.center,
      }}
    >
      <Text style={{ fontSize: size * 0.4, color: '#FFF', fontWeight: '700' }}>
        {emoji ?? name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

// ── StatCard ───────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
}

export function StatCard({ label, value, icon, color }: StatCardProps) {
  const colors = useThemeColors();

  return (
    <Card style={{ flex: 1 }}>
      <View style={Layout.row}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={color ?? colors.primary}
            style={{ marginRight: Spacing.sm }}
          />
        )}
        <Text style={{ ...Typography.caption, color: colors.textSecondary }}>{label}</Text>
      </View>
      <Text style={{ ...Typography.h2, color: colors.text, marginTop: Spacing.xs }}>
        {value}
      </Text>
    </Card>
  );
}

// ── TextInput ──────────────────────────────────────────────────

interface StyledTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function StyledTextInput({ label, error, style, ...props }: StyledTextInputProps) {
  const colors = useThemeColors();

  return (
    <View>
      {label && (
        <Text style={{ ...Typography.caption, color: colors.textSecondary, marginBottom: Spacing.xs }}>
          {label}
        </Text>
      )}
      <RNTextInput
        placeholderTextColor={colors.textMuted}
        style={[
          {
            height: 48,
            backgroundColor: Palette.white06,
            borderRadius: BorderRadius.md,
            paddingHorizontal: Spacing.md,
            color: colors.text,
            ...Typography.body,
            borderWidth: 1,
            borderColor: error ? colors.error : 'transparent',
          },
          style,
        ]}
        {...props}
      />
      {error && (
        <Text style={{ ...Typography.tiny, color: colors.error, marginTop: Spacing.xs }}>
          {error}
        </Text>
      )}
    </View>
  );
}

// ── SectionHeader ──────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  action?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, action, onAction }: SectionHeaderProps) {
  const colors = useThemeColors();

  return (
    <View style={[Layout.rowBetween, { marginBottom: Spacing.md }]}>
      <Text style={{ ...Typography.label, color: colors.textSecondary }}>{title}</Text>
      {action && onAction && (
        <Pressable onPress={onAction} style={Layout.row}>
          <Ionicons name="add" size={16} color={colors.primary} />
          <Text style={{ ...Typography.caption, color: colors.primary, marginLeft: 4 }}>
            {action}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Badge ──────────────────────────────────────────────────────

interface BadgeProps {
  text: string;
  color?: string;
  textColor?: string;
}

export function Badge({ text, color, textColor }: BadgeProps) {
  const colors = useThemeColors();

  return (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: BorderRadius.pill,
        backgroundColor: color ?? Palette.indigo15,
      }}
    >
      <Text style={{ ...Typography.tiny, color: textColor ?? colors.primary, fontWeight: '700' }}>
        {text}
      </Text>
    </View>
  );
}

// ── Divider ────────────────────────────────────────────────────

export function Divider({ style }: { style?: ViewStyle }) {
  const colors = useThemeColors();
  return (
    <View style={[{ height: 1, backgroundColor: colors.cardBorder, marginVertical: Spacing.md }, style]} />
  );
}
