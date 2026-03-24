import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/colors';
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
  
  const getTypeIcon = () => {
    switch (item.item_type) {
      case 'goal': return 'flag';
      case 'habit': return 'refresh';
      default: return 'checkbox-outline';
    }
  };

  return (
    <Pressable 
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed
      ]}
      onPress={onPress}
    >
      <TouchableOpacity 
        style={[styles.checkBox, item.completed && styles.checkBoxCompleted]}
        onPress={onComplete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        {item.completed && (
          <Ionicons name="checkmark" size={16} color={Colors.text} />
        )}
      </TouchableOpacity>
      
      <View style={styles.content}>
        <Text style={[styles.title, item.completed && styles.titleCompleted]} numberOfLines={2}>
          {item.title}
        </Text>
        
        <View style={styles.meta}>
          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor() }]} />
          <Text style={styles.metaText}>{item.priority}</Text>
          
          <View style={styles.rewardBadge}>
            <Ionicons name="sparkles" size={12} color={Colors.secondary} />
            <Text style={styles.rewardText}>{item.reward}</Text>
          </View>
        </View>
      </View>
      
      <View style={[styles.typeBadge, { 
        backgroundColor: item.bucket_type === 'joint' ? Colors.secondary + '20' : Colors.primary + '20' 
      }]}>
        <Ionicons 
          name={item.bucket_type === 'joint' ? 'people' : 'person'} 
          size={14} 
          color={item.bucket_type === 'joint' ? Colors.secondary : Colors.primary} 
        />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkBoxCompleted: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSize.md,
    color: Colors.text,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'capitalize',
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
    backgroundColor: Colors.secondary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  rewardText: {
    fontSize: FontSize.xs,
    color: Colors.secondary,
    fontWeight: '600',
    marginLeft: 4,
  },
  typeBadge: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
});
