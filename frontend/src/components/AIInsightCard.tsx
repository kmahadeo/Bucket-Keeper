import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';

interface AIInsightCardProps {
  insight: string;
  isLoading?: boolean;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({ insight, isLoading }) => {
  return (
    <View style={[styles.container, Shadows.sm]}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <Ionicons name="sparkles" size={14} color={Colors.primary} />
        </View>
        <Text style={styles.label}>AI INSIGHT</Text>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={Colors.primary} />
          <Text style={styles.loadingText}>Thinking...</Text>
        </View>
      ) : (
        <Text style={styles.insight}>{insight}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary + '08',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  label: {
    ...Typography.label,
    color: Colors.primary,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  loadingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  insight: {
    ...Typography.body,
    color: Colors.text,
  },
});
