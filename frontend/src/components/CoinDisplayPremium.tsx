import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../constants/theme';
import { GlassCard } from './GlassCard';

interface CoinDisplayPremiumProps {
  jointCoins: number;
  personalCoins: number;
  onPress?: () => void;
}

export const CoinDisplayPremium: React.FC<CoinDisplayPremiumProps> = ({
  jointCoins,
  personalCoins,
}) => {
  return (
    <View style={styles.container}>
      {/* Joint Coins */}
      <GlassCard style={styles.coinCard} glowColor={Colors.gold}>
        <View style={styles.coinContent}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              style={styles.iconGradient}
            >
              <Ionicons name="people" size={18} color="#FFF" />
            </LinearGradient>
          </View>
          <Text style={styles.label}>JOINT</Text>
          <Text style={styles.amount}>{jointCoins}</Text>
          <View style={styles.coinIcon}>
            <Text style={styles.coinEmoji}>🪙</Text>
          </View>
        </View>
      </GlassCard>

      {/* Personal Coins */}
      <GlassCard style={styles.coinCard} glowColor={Colors.accent}>
        <View style={styles.coinContent}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#A855F7', '#7C3AED']}
              style={styles.iconGradient}
            >
              <Ionicons name="person" size={18} color="#FFF" />
            </LinearGradient>
          </View>
          <Text style={styles.label}>PERSONAL</Text>
          <Text style={styles.amount}>{personalCoins}</Text>
          <View style={styles.coinIcon}>
            <Text style={styles.coinEmoji}>💎</Text>
          </View>
        </View>
      </GlassCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  coinCard: {
    flex: 1,
  },
  coinContent: {
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    marginBottom: Spacing.sm,
    ...Shadows.soft,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  amount: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  coinIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  coinEmoji: {
    fontSize: 20,
  },
});
