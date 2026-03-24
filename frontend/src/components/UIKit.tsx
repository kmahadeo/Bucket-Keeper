import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';

// Clean Card Component
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  if (onPress) {
    return (
      <TouchableOpacity 
        style={[styles.card, Shadows.sm, style]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={[styles.card, Shadows.sm, style]}>{children}</View>;
};

// Primary Button
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  size = 'medium',
}) => {
  const heights = { small: 40, medium: 48, large: 56 };
  const fontSizes = { small: 14, medium: 16, large: 17 };
  
  const bgColors = {
    primary: Colors.primary,
    secondary: Colors.accent,
    outline: 'transparent',
  };
  
  const textColors = {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    outline: Colors.primary,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: bgColors[variant],
          height: heights[size],
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: Colors.primary,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && (
        <Ionicons 
          name={icon as any} 
          size={size === 'small' ? 16 : 20} 
          color={textColors[variant]}
          style={{ marginRight: Spacing.sm }}
        />
      )}
      <Text style={[styles.buttonText, { color: textColors[variant], fontSize: fontSizes[size] }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

// Stat Card (Ultrahuman-inspired)
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color = Colors.primary,
  subtitle,
}) => {
  return (
    <Card style={styles.statCard}>
      <View style={styles.statHeader}>
        {icon && (
          <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
            <Ionicons name={icon as any} size={18} color={color} />
          </View>
        )}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </Card>
  );
};

// Avatar with mood ring
interface AvatarProps {
  name: string;
  emoji?: string;
  moodColor?: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  emoji = '😊',
  moodColor = Colors.moods.happy,
  size = 'medium',
  onPress,
}) => {
  const sizes = { small: 40, medium: 56, large: 80 };
  const emojiSizes = { small: 18, medium: 26, large: 38 };
  const avatarSize = sizes[size];
  
  const Wrapper = onPress ? TouchableOpacity : View;
  
  return (
    <Wrapper onPress={onPress} activeOpacity={0.8}>
      <View style={[
        styles.avatarContainer,
        {
          width: avatarSize + 6,
          height: avatarSize + 6,
          borderRadius: (avatarSize + 6) / 2,
          borderColor: moodColor,
        }
      ]}>
        <View style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          }
        ]}>
          <Text style={{ fontSize: emojiSizes[size] }}>{emoji}</Text>
        </View>
      </View>
      {name && <Text style={styles.avatarName}>{name}</Text>}
    </Wrapper>
  );
};

// Chip/Tag
interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  color = Colors.primary,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        selected && { backgroundColor: color, borderColor: color },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && { color: '#FFF' }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
  },
  buttonText: {
    fontWeight: '600',
  },
  statCard: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  statValue: {
    ...Typography.h1,
  },
  statSubtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  avatarContainer: {
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarName: {
    ...Typography.caption,
    color: Colors.text,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.text,
  },
});
