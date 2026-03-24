import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../constants/theme';

interface MoodOrbAvatarProps {
  name: string;
  mood: string;
  moodEmoji: string;
  imageUrl?: string;
  isMe?: boolean;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
}

const MOOD_CONFIG = {
  energized: { colors: ['#F59E0B', '#FBBF24', '#FDE047'], icon: 'flash' },
  happy: { colors: ['#10B981', '#34D399', '#6EE7B7'], icon: 'happy' },
  calm: { colors: ['#3B82F6', '#60A5FA', '#93C5FD'], icon: 'leaf' },
  romantic: { colors: ['#EC4899', '#F472B6', '#FBCFE8'], icon: 'heart' },
  tired: { colors: ['#8B5CF6', '#A78BFA', '#C4B5FD'], icon: 'moon' },
  stressed: { colors: ['#EF4444', '#F87171', '#FCA5A5'], icon: 'alert-circle' },
};

const SIZES = {
  small: { avatar: 48, ring: 60, fontSize: FontSize.xs },
  medium: { avatar: 72, ring: 90, fontSize: FontSize.sm },
  large: { avatar: 100, ring: 124, fontSize: FontSize.md },
};

export const MoodOrbAvatar: React.FC<MoodOrbAvatarProps> = ({
  name,
  mood = 'happy',
  moodEmoji,
  imageUrl,
  isMe = false,
  size = 'medium',
  onPress,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  const moodConfig = MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG] || MOOD_CONFIG.happy;
  const sizeConfig = SIZES[size];

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation for ring
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 0.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      {/* Outer glow */}
      <Animated.View
        style={[
          styles.glowOuter,
          {
            width: sizeConfig.ring + 24,
            height: sizeConfig.ring + 24,
            borderRadius: (sizeConfig.ring + 24) / 2,
            backgroundColor: moodConfig.colors[0],
            opacity: glowAnim,
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* Rotating mood ring */}
      <Animated.View
        style={[
          styles.ringContainer,
          {
            width: sizeConfig.ring,
            height: sizeConfig.ring,
            transform: [{ rotate }, { scale: pulseAnim }],
          },
        ]}
      >
        <LinearGradient
          colors={[...moodConfig.colors, moodConfig.colors[0]]}
          style={styles.ring}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        {/* Inner cut-out */}
        <View style={[
          styles.ringInner,
          {
            width: sizeConfig.avatar + 8,
            height: sizeConfig.avatar + 8,
            borderRadius: (sizeConfig.avatar + 8) / 2,
          }
        ]} />
      </Animated.View>

      {/* Avatar */}
      <View style={[
        styles.avatar,
        {
          width: sizeConfig.avatar,
          height: sizeConfig.avatar,
          borderRadius: sizeConfig.avatar / 2,
        },
        Shadows.medium,
      ]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatarImage} />
        ) : (
          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.avatarGradient}
          >
            <Text style={[styles.avatarEmoji, { fontSize: sizeConfig.avatar * 0.5 }]}>
              {moodEmoji || '😊'}
            </Text>
          </LinearGradient>
        )}
      </View>

      {/* Name & mood indicator */}
      <View style={styles.info}>
        <Text style={[styles.name, { fontSize: sizeConfig.fontSize }]}>
          {isMe ? 'You' : name?.split(' ')[0]}
        </Text>
        <View style={styles.moodBadge}>
          <Ionicons 
            name={moodConfig.icon as any} 
            size={12} 
            color={moodConfig.colors[0]} 
          />
          <Text style={[styles.moodText, { color: moodConfig.colors[0] }]}>
            {mood.charAt(0).toUpperCase() + mood.slice(1)}
          </Text>
        </View>
      </View>

      {/* Edit indicator for own avatar */}
      {isMe && onPress && (
        <View style={[styles.editBadge, { backgroundColor: moodConfig.colors[0] }]}>
          <Ionicons name="pencil" size={10} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  glowOuter: {
    position: 'absolute',
    top: -12,
  },
  ringContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
  },
  ringInner: {
    backgroundColor: Colors.backgroundDeep,
  },
  avatar: {
    overflow: 'hidden',
    backgroundColor: '#1F2937',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    textAlign: 'center',
  },
  info: {
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  name: {
    color: Colors.text,
    fontWeight: '600',
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  moodText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  editBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.backgroundDeep,
  },
});
