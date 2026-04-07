// Bucket Keeper - CoinDisplay
// Side-by-side Joint and Personal coin counters

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Palette } from '../constants/colors';
import { Typography, Spacing, BorderRadius, Shadows, Layout } from '../constants/theme';
import { useThemeColors } from './UIKit';

// ── Props ─────────────────────────────────────────────────────

interface CoinDisplayProps {
  jointCoins: number;
  personalCoins: number;
  onPersonalPress?: () => void;
}

// ── Component ─────────────────────────────────────────────────

export function CoinDisplay({
  jointCoins,
  personalCoins,
  onPersonalPress,
}: CoinDisplayProps) {
  const colors = useThemeColors();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <View style={styles.container}>
      {/* Joint Coins */}
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
          },
          Shadows.subtle,
        ]}
      >
        <Ionicons name="globe-outline" size={18} color={Palette.coinGold} />
        <View style={styles.textCol}>
          <Text style={[Typography.tiny, { color: colors.textMuted }]}>JOINT</Text>
          <Text
            style={[
              styles.amount,
              { color: Palette.coinGold },
            ]}
          >
            {jointCoins}
          </Text>
        </View>
      </View>

      {/* Personal Coins */}
      <Pressable
        onPress={onPersonalPress}
        style={({ pressed }) => [
          styles.pill,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            opacity: pressed && onPersonalPress ? 0.85 : 1,
          },
          Shadows.subtle,
        ]}
      >
        <Ionicons name="wallet-outline" size={18} color={Palette.coinSilver} />
        <View style={styles.textCol}>
          <Text style={[Typography.tiny, { color: colors.textMuted }]}>PERSONAL</Text>
          <Text
            style={[
              styles.amount,
              { color: Palette.coinSilver },
            ]}
          >
            {personalCoins}
          </Text>
        </View>

        {/* Info icon for tooltip */}
        <Pressable
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => setShowTooltip((prev) => !prev)}
          style={styles.infoIcon}
        >
          <Ionicons
            name="information-circle-outline"
            size={16}
            color={colors.textMuted}
          />
        </Pressable>
      </Pressable>

      {/* Tooltip */}
      {showTooltip && (
        <View
          style={[
            styles.tooltip,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
            Shadows.card,
          ]}
        >
          <Text style={[Typography.bodySmall, { color: colors.text }]}>
            Personal Stash
          </Text>
          <Text style={[Typography.tiny, { color: colors.textSecondary, marginTop: 2 }]}>
            Coins earned from your own completed tasks. Spend them on personal rewards!
          </Text>
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  textCol: {
    flex: 1,
  },
  amount: {
    fontSize: 20,
    fontWeight: '700',
  },
  infoIcon: {
    marginLeft: Spacing.xs,
  },
  tooltip: {
    position: 'absolute',
    bottom: -64,
    right: 0,
    width: 220,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    zIndex: 10,
  },
});
