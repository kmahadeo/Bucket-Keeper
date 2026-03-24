import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius } from '../constants/colors';

const MOODS = [
  { id: 'energized', label: 'Energized', emoji: '⚡', color: Colors.moodEnergized },
  { id: 'happy', label: 'Happy', emoji: '😊', color: Colors.moodHappy },
  { id: 'calm', label: 'Calm', emoji: '😌', color: Colors.moodCalm },
  { id: 'tired', label: 'Tired', emoji: '😴', color: Colors.moodTired },
  { id: 'stressed', label: 'Stressed', emoji: '😰', color: Colors.moodStressed },
];

interface MoodCardProps {
  name: string;
  mood?: string;
  moodEmoji?: string;
  isMe?: boolean;
  onMoodSelect?: (mood: string, emoji: string) => void;
}

export const MoodCard: React.FC<MoodCardProps> = ({ 
  name, 
  mood = 'happy', 
  moodEmoji = '😊',
  isMe = false,
  onMoodSelect 
}) => {
  const [showPicker, setShowPicker] = React.useState(false);
  
  const currentMood = MOODS.find(m => m.id === mood) || MOODS[1];

  const handleMoodSelect = (selectedMood: typeof MOODS[0]) => {
    onMoodSelect?.(selectedMood.id, selectedMood.emoji);
    setShowPicker(false);
  };

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => isMe && setShowPicker(true)}
        activeOpacity={isMe ? 0.7 : 1}
      >
        <View style={[styles.emojiCircle, { borderColor: currentMood.color }]}>
          <Text style={styles.emoji}>{moodEmoji}</Text>
        </View>
        <Text style={styles.name}>{isMe ? 'You' : name}</Text>
        <View style={[styles.moodBadge, { backgroundColor: currentMood.color + '20' }]}>
          <Text style={[styles.moodText, { color: currentMood.color }]}>
            {currentMood.label}
          </Text>
        </View>
        {isMe && (
          <View style={styles.editHint}>
            <Ionicons name="pencil" size={12} color={Colors.textMuted} />
          </View>
        )}
      </TouchableOpacity>
      
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>How are you feeling?</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.moodGrid}>
                {MOODS.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[
                      styles.moodOption,
                      mood === m.id && { borderColor: m.color, borderWidth: 2 }
                    ]}
                    onPress={() => handleMoodSelect(m)}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, { color: m.color }]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    minWidth: 100,
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundCard,
    marginBottom: Spacing.sm,
  },
  emoji: {
    fontSize: 28,
  },
  name: {
    fontSize: FontSize.sm,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  moodBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  moodText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  editHint: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    color: Colors.text,
    fontWeight: '600',
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  moodGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  moodOption: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    minWidth: 80,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  moodLabel: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
});
