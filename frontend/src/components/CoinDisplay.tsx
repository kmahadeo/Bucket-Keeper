import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';

interface CoinDisplayProps {
  jointCoins: number;
  personalCoins: number;
  onPress?: () => void;
}

export const CoinDisplay: React.FC<CoinDisplayProps> = ({ jointCoins, personalCoins, onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.coinCard, Shadows.sm]} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, { backgroundColor: Colors.accent + '15' }]}>
          <Ionicons name="people" size={18} color={Colors.accent} />
        </View>
        <View>
          <Text style={styles.label}>JOINT</Text>
          <Text style={[styles.value, { color: Colors.accent }]}>{jointCoins}</Text>
        </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.coinCard, Shadows.sm]} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '15' }]}>
          <Ionicons name="person" size={18} color={Colors.primary} />
        </View>
        <View>
          <Text style={styles.label}>PERSONAL</Text>
          <Text style={[styles.value, { color: Colors.primary }]}>{personalCoins}</Text>
        </View>
      </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...Typography.label,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  value: {
    fontSize: 22,
    fontWeight: '700',
  },
});
