// Bucket Keeper - Voice Capture Modal
// Full-screen voice recording with AI task extraction

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors, Card, GradientButton, Badge } from '../src/components/UIKit';
import { Typography, Spacing, BorderRadius, Layout, Shadows } from '../src/constants/theme';
import { Palette } from '../src/constants/colors';
import {
  initVoice,
  destroyVoice,
  startListening,
  stopListening,
  cancelListening,
  setOnTranscript,
  setOnError,
  extractTasksFromTranscript,
} from '../src/services/voiceService';
import { itemsApi } from '../src/utils/api';
import type { ExtractedTask } from '../src/types';

type CapturePhase = 'idle' | 'recording' | 'extracting' | 'preview';

export default function VoiceCaptureScreen() {
  const router = useRouter();
  const colors = useThemeColors();

  const [phase, setPhase] = useState<CapturePhase>('idle');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [addingAll, setAddingAll] = useState(false);

  useEffect(() => {
    try {
      initVoice();
      setOnTranscript((text: string) => {
        setTranscript(text);
      });
      setOnError((err: string) => {
        setError(err);
        setIsRecording(false);
        setPhase('idle');
      });
    } catch {
      setError('Voice recognition is not available on this device.');
    }

    return () => {
      try {
        destroyVoice();
      } catch {
        // Voice may not be initialized
      }
    };
  }, []);

  const handleStartRecording = async () => {
    setError(null);
    setTranscript('');
    try {
      await startListening();
      setIsRecording(true);
      setPhase('recording');
    } catch (e: any) {
      setError(e.message || 'Failed to start voice recognition');
    }
  };

  const handleStopRecording = async () => {
    try {
      const finalTranscript = await stopListening();
      setIsRecording(false);
      setTranscript(finalTranscript);

      if (finalTranscript.trim()) {
        setPhase('extracting');
        try {
          const tasks = await extractTasksFromTranscript(finalTranscript);
          setExtractedTasks(tasks);
          setPhase('preview');
        } catch {
          setError('Failed to extract tasks. Please try again.');
          setPhase('idle');
        }
      } else {
        setPhase('idle');
      }
    } catch (e: any) {
      setIsRecording(false);
      setError(e.message || 'Failed to stop recording');
      setPhase('idle');
    }
  };

  const handleCancel = async () => {
    try {
      await cancelListening();
    } catch {
      // Ignore
    }
    setIsRecording(false);
    router.back();
  };

  const handleDone = async () => {
    if (isRecording) {
      await handleStopRecording();
    } else if (phase === 'preview') {
      await handleAddAll();
    } else {
      router.back();
    }
  };

  const handleAddAll = async () => {
    if (extractedTasks.length === 0) {
      router.back();
      return;
    }

    setAddingAll(true);
    try {
      for (const task of extractedTasks) {
        await itemsApi.create({
          title: task.title,
          bucket_type: task.isJoint ? 'joint' : 'personal',
          item_type: 'task',
          priority: task.priority === 'urgent' ? 'high' : task.priority,
          reward: task.priority === 'high' || task.priority === 'urgent' ? 15 : 10,
          assignee: task.assignedTo === 'partner' ? 'partner' : 'me',
          frequency: task.isRecurring ? 'weekly' : 'once',
        });
      }
      router.back();
    } catch {
      setError('Failed to add tasks. Please try again.');
    } finally {
      setAddingAll(false);
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'urgent':
        return Palette.priorityUrgent;
      case 'high':
        return Palette.priorityHigh;
      case 'low':
        return Palette.priorityLow;
      default:
        return Palette.priorityNormal;
    }
  };

  const renderTaskCard = ({ item, index }: { item: ExtractedTask; index: number }) => (
    <Card style={{ marginBottom: Spacing.sm }}>
      <View style={Layout.rowBetween}>
        <View style={{ flex: 1, marginRight: Spacing.md }}>
          <Text style={{ ...Typography.bodyMedium, color: colors.text }} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={{ ...Layout.row, gap: Spacing.sm, marginTop: Spacing.sm }}>
            <Badge
              text={item.isJoint ? 'JOINT' : 'PERSONAL'}
              color={item.isJoint ? Palette.indigo15 : Palette.white10}
              textColor={item.isJoint ? colors.primary : colors.textSecondary}
            />
            <Badge
              text={item.priority.toUpperCase()}
              color={getPriorityColor(item.priority) + '20'}
              textColor={getPriorityColor(item.priority)}
            />
            {item.category && (
              <Badge
                text={item.category.toUpperCase()}
                color={Palette.white06}
                textColor={colors.textMuted}
              />
            )}
          </View>
          {item.dateText && (
            <Text style={{ ...Typography.caption, color: colors.textMuted, marginTop: Spacing.xs }}>
              {item.dateText}
              {item.timeText ? ` at ${item.timeText}` : ''}
            </Text>
          )}
        </View>
        <Ionicons name="checkmark-circle" size={24} color={colors.success} />
      </View>
    </Card>
  );

  // Ripple ring sizes
  const rippleRings = [
    { size: 160, opacity: 0.15 },
    { size: 200, opacity: 0.08 },
    { size: 240, opacity: 0.04 },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background + 'F5' }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top Bar */}
        <View style={{ ...Layout.rowBetween, paddingHorizontal: Spacing.screenHorizontal, paddingTop: Spacing.md }}>
          <Pressable
            onPress={handleCancel}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: Palette.white10,
              ...Layout.center,
            }}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>

          <Pressable
            onPress={handleDone}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: phase === 'preview' ? colors.success + '20' : Palette.white10,
              ...Layout.center,
            }}
          >
            <Ionicons
              name="checkmark"
              size={24}
              color={phase === 'preview' ? colors.success : colors.text}
            />
          </Pressable>
        </View>

        {/* Main Content */}
        {(phase === 'idle' || phase === 'recording') && (
          <View style={{ flex: 1, ...Layout.center }}>
            {/* Ripple Rings */}
            <View style={{ ...Layout.center, width: 260, height: 260 }}>
              {isRecording &&
                rippleRings.map((ring, i) => (
                  <View
                    key={i}
                    style={{
                      position: 'absolute',
                      width: ring.size,
                      height: ring.size,
                      borderRadius: ring.size / 2,
                      borderWidth: 2,
                      borderColor: colors.primary,
                      opacity: ring.opacity,
                    }}
                  />
                ))}

              {/* Mic Orb */}
              <Pressable onPress={handleMicPress}>
                <LinearGradient
                  colors={[colors.gradientStart, colors.gradientEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    ...Layout.center,
                    ...Shadows.fab,
                  }}
                >
                  <Ionicons name="mic" size={48} color="#FFF" />
                </LinearGradient>
              </Pressable>
            </View>

            {/* Status Text */}
            <Text
              style={{
                ...Typography.h3,
                color: isRecording ? colors.primary : colors.textSecondary,
                marginTop: Spacing.xl,
              }}
            >
              {isRecording ? 'Listening...' : 'Tap to speak'}
            </Text>

            {/* Transcript */}
            {transcript.length > 0 && (
              <View
                style={{
                  marginTop: Spacing.xl,
                  paddingHorizontal: Spacing.xl,
                  maxHeight: 200,
                }}
              >
                <Text
                  style={{
                    ...Typography.body,
                    color: colors.text,
                    textAlign: 'center',
                    lineHeight: 24,
                  }}
                >
                  {transcript}
                </Text>
              </View>
            )}

            {/* Error */}
            {error && (
              <Text
                style={{
                  ...Typography.bodySmall,
                  color: colors.error,
                  textAlign: 'center',
                  marginTop: Spacing.md,
                  paddingHorizontal: Spacing.xl,
                }}
              >
                {error}
              </Text>
            )}
          </View>
        )}

        {/* Extracting State */}
        {phase === 'extracting' && (
          <View style={{ flex: 1, ...Layout.center }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={{
                ...Typography.h3,
                color: colors.text,
                marginTop: Spacing.lg,
              }}
            >
              Extracting tasks...
            </Text>
            <Text
              style={{
                ...Typography.bodySmall,
                color: colors.textSecondary,
                marginTop: Spacing.sm,
              }}
            >
              AI is analyzing your voice input
            </Text>
          </View>
        )}

        {/* Preview State */}
        {phase === 'preview' && (
          <View style={{ flex: 1, paddingTop: Spacing.lg }}>
            <View style={{ paddingHorizontal: Spacing.screenHorizontal, marginBottom: Spacing.md }}>
              <Text style={{ ...Typography.h2, color: colors.text }}>
                Extracted Tasks
              </Text>
              <Text style={{ ...Typography.bodySmall, color: colors.textSecondary, marginTop: Spacing.xs }}>
                {extractedTasks.length} task{extractedTasks.length !== 1 ? 's' : ''} found from your voice input
              </Text>
            </View>

            <FlatList
              data={extractedTasks}
              renderItem={renderTaskCard}
              keyExtractor={(_, index) => `task-${index}`}
              contentContainerStyle={{
                paddingHorizontal: Spacing.screenHorizontal,
                paddingBottom: 120,
              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={{ ...Layout.center, paddingVertical: Spacing.xxl }}>
                  <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
                  <Text style={{ ...Typography.body, color: colors.textMuted, marginTop: Spacing.md }}>
                    No tasks could be extracted. Try again.
                  </Text>
                </View>
              }
            />

            {/* Add All Button */}
            {extractedTasks.length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  paddingHorizontal: Spacing.screenHorizontal,
                  paddingBottom: Spacing.xl,
                  paddingTop: Spacing.md,
                  backgroundColor: colors.background + 'F0',
                }}
              >
                <GradientButton
                  title={`Add All ${extractedTasks.length} Task${extractedTasks.length !== 1 ? 's' : ''}`}
                  onPress={handleAddAll}
                  icon="checkmark-done"
                  size="lg"
                  loading={addingAll}
                  disabled={addingAll}
                />
              </View>
            )}
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
