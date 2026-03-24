import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/colors';

interface CoinDisplayProps {
  jointCoins: number;
  personalCoins: number;
  onPress?: () => void;
}

export const CoinDisplay: React.FC<CoinDisplayProps> = ({ 
  jointCoins, 
  personalCoins,
  onPress 
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.coinBox} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconCircle, { backgroundColor: Colors.secondary + '20' }]}>
          <Ionicons name="people" size={16} color={Colors.secondary} />
        </View>
        <Text style={styles.label}>JOINT</Text>
        <Text style={styles.amount}>{jointCoins}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.coinBox} onPress={onPress} activeOpacity={0.7}>
        <View style={[styles.iconCircle, { backgroundColor: Colors.primary + '20' }]}>
          <Ionicons name="person" size={16} color={Colors.primary} />
        </View>
        <Text style={styles.label}>PERSONAL</Text>
        <Text style={styles.amount}>{personalCoins}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  coinBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
  },
  amount: {
    fontSize: FontSize.xl,
    color: Colors.text,
    fontWeight: '700',
    marginTop: 2,
  },
});
