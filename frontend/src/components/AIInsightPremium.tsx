import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/theme';

interface AIInsightPremiumProps {
  insight: string;
  isLoading?: boolean;
  type?: 'insight' | 'suggestion' | 'conflict';
}

const TYPE_CONFIG = {
  insight: {
    icon: 'sparkles',
    gradient: ['#667EEA', '#764BA2'],
    title: 'AI Insight',
  },
  suggestion: {
    icon: 'bulb',
    gradient: ['#F59E0B', '#D97706'],
    title: 'Smart Suggestion',
  },
  conflict: {
    icon: 'heart',
    gradient: ['#EC4899', '#BE185D'],
    title: 'Harmony Helper',
  },
};

export const AIInsightPremium: React.FC<AIInsightPremiumProps> = ({
  insight,
  isLoading = false,
  type = 'insight',
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const config = TYPE_CONFIG[type];

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const glowOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <View style={styles.container}>
      {/* Animated glow behind */}
      <Animated.View style={[styles.glowBg, { opacity: glowOpacity }]}>
        <LinearGradient
          colors={[config.gradient[0] + '40', config.gradient[1] + '20']}
          style={styles.glowGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>

      {/* Glass card */}
      <BlurView intensity={25} tint="dark" style={styles.blur}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <LinearGradient
              colors={config.gradient as [string, string]}
              style={styles.iconContainer}
            >
              <Ionicons name={config.icon as any} size={16} color="#FFF" />
            </LinearGradient>
            <Text style={styles.title}>{config.title}</Text>
            <View style={styles.aiPill}>
              <Text style={styles.aiText}>AI</Text>
            </View>
          </View>

          {/* Message */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={config.gradient[0]} />
              <Text style={styles.loadingText}>Analyzing your day...</Text>
            </View>
          ) : (
            <Text style={styles.insight}>{insight}</Text>
          )}
        </View>
      </BlurView>

      {/* Border */}
      <View style={styles.border} pointerEvents="none" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },
  glowBg: {
    ...StyleSheet.absoluteFillObject,
  },
  glowGradient: {
    flex: 1,
  },
  blur: {
    backgroundColor: Colors.glass,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  aiPill: {
    backgroundColor: Colors.glass,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  aiText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: Colors.accent,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  insight: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 22,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
});
