// Bucket Keeper - AI Chat Interface
// Conversational AI assistant for task management

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors } from '../src/components/UIKit';
import { Typography, Spacing, BorderRadius, Layout, Shadows } from '../src/constants/theme';
import { Palette } from '../src/constants/colors';
import { aiApi } from '../src/utils/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export default function AIChatScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi! I'm your Bucket Keeper assistant. I can help you manage tasks, set priorities, plan your day, or answer questions about your progress. What would you like to do?",
      createdAt: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await aiApi.chat(text, conversationId);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.data.response,
        createdAt: Date.now(),
      };
      setConversationId(response.data.conversationId);
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, conversationId]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={{
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          maxWidth: '80%',
          marginBottom: Spacing.sm,
          paddingHorizontal: Spacing.screenHorizontal,
        }}
      >
        {/* Sender label for AI */}
        {!isUser && (
          <View style={{ ...Layout.row, marginBottom: Spacing.xs }}>
            <Ionicons name="sparkles" size={12} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={{ ...Typography.tiny, color: colors.primary, fontWeight: '600' }}>
              AI Assistant
            </Text>
          </View>
        )}

        {/* Message bubble */}
        {isUser ? (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm + 2,
              borderRadius: BorderRadius.lg,
              borderBottomRightRadius: BorderRadius.xs,
            }}
          >
            <Text style={{ ...Typography.body, color: '#FFF', lineHeight: 22 }}>
              {item.content}
            </Text>
          </LinearGradient>
        ) : (
          <View
            style={{
              backgroundColor: colors.card,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm + 2,
              borderRadius: BorderRadius.lg,
              borderBottomLeftRadius: BorderRadius.xs,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <Text style={{ ...Typography.body, color: colors.text, lineHeight: 22 }}>
              {item.content}
            </Text>
          </View>
        )}

        {/* Timestamp */}
        <Text
          style={{
            ...Typography.tiny,
            color: colors.textMuted,
            marginTop: 2,
            alignSelf: isUser ? 'flex-end' : 'flex-start',
          }}
        >
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          ...Layout.rowBetween,
          paddingHorizontal: Spacing.screenHorizontal,
          paddingTop: Spacing.md,
          paddingBottom: Spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: colors.cardBorder,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: Palette.white06,
            ...Layout.center,
          }}
        >
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>

        <View style={Layout.row}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: Palette.indigo15,
              ...Layout.center,
              marginRight: Spacing.sm,
            }}
          >
            <Ionicons name="sparkles" size={16} color={colors.primary} />
          </View>
          <Text style={{ ...Typography.h3, color: colors.text }}>AI Assistant</Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingTop: Spacing.md,
            paddingBottom: Spacing.md,
            flexGrow: 1,
          }}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }}
          ListFooterComponent={
            isLoading ? (
              <View
                style={{
                  paddingHorizontal: Spacing.screenHorizontal,
                  paddingVertical: Spacing.sm,
                  alignSelf: 'flex-start',
                }}
              >
                <View
                  style={{
                    ...Layout.row,
                    backgroundColor: colors.card,
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.sm + 2,
                    borderRadius: BorderRadius.lg,
                    borderBottomLeftRadius: BorderRadius.xs,
                    borderWidth: 1,
                    borderColor: colors.cardBorder,
                    gap: Spacing.sm,
                  }}
                >
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={{ ...Typography.bodySmall, color: colors.textMuted }}>
                    Thinking...
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Input Area */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            paddingHorizontal: Spacing.screenHorizontal,
            paddingVertical: Spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
            backgroundColor: colors.background,
            gap: Spacing.sm,
          }}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: Palette.white06,
              borderRadius: BorderRadius.card,
              borderWidth: 1,
              borderColor: colors.cardBorder,
              paddingHorizontal: Spacing.md,
              paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 0,
              maxHeight: 120,
            }}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask me anything..."
              placeholderTextColor={colors.textMuted}
              style={{
                ...Typography.body,
                color: colors.text,
                maxHeight: 100,
              }}
              multiline
              returnKeyType="default"
              editable={!isLoading}
            />
          </View>

          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
            style={({ pressed }) => ({
              opacity: !input.trim() || isLoading ? 0.4 : pressed ? 0.8 : 1,
            })}
          >
            <LinearGradient
              colors={[colors.gradientStart, colors.gradientEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                ...Layout.center,
                ...Shadows.fab,
              }}
            >
              <Ionicons name="send" size={18} color="#FFF" />
            </LinearGradient>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
