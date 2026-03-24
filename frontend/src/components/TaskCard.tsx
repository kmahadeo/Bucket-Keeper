import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../constants/theme';
import type { BucketItem } from '../utils/api';

interface TaskCardProps {
  item: BucketItem;
  onComplete?: () => void;
  onPress?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ item, onComplete, onPress }) => {
  const getPriorityColor = () => {
    switch (item.priority) {
      case 'high': return Colors.priorityHigh;
      case 'medium': return Colors.priorityMedium;
      default: return Colors.priorityLow;
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.container, Shadows.sm]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Checkbox */}
      <TouchableOpacity 
        style={[styles.checkbox, item.completed && styles.checkboxCompleted]}
        onPress={onComplete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {item.completed && <Ionicons name="checkmark" size={14} color="#FFF" />}
      </TouchableOpacity>
      
      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, item.completed && styles.titleCompleted]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.meta}>
          {/* Priority indicator */}
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '15' }]}>
            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor() }]} />
            <Text style={[styles.priorityText, { color: getPriorityColor() }]}>
              {item.priority}
            </Text>
          </View>
          
          {/* Reward */}
          <View style={styles.rewardBadge}>
            <Ionicons name="star" size={12} color={Colors.gold} />
            <Text style={styles.rewardText}>{item.reward}</Text>
          </View>
          
          {/* Type badge */}
          <View style={[styles.typeBadge, { 
            backgroundColor: item.bucket_type === 'joint' ? Colors.accent + '15' : Colors.primary + '15' 
          }]}>
            <Ionicons 
              name={item.bucket_type === 'joint' ? 'people' : 'person'} 
              size={12} 
              color={item.bucket_type === 'joint' ? Colors.accent : Colors.primary} 
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkboxCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  content: {
    flex: 1,
  },
  title: {
    ...Typography.bodyMedium,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.gold,
  },
  typeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
