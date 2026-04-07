// Bucket Keeper - AI Chat Interface

import React, { useState, useRef } from 'react';
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
import { Typography, Spacing, BorderRadius, Layout } from '../src/constants/theme';
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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
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
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.response,
        createdAt: Date.now(),
      };
      setConversationId(response.data.conversationId);
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Sorry, I couldn't process that. Please try again.",
        createdAt: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';

    return (
      <View
        style={{
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          maxWidth: '80%',
          marginBottom: Spacing.sm,
        }}
      >
        {isUser ? (
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm + 2,
              borderRadius: BorderRadius.lg,
              borderBottomRightRadius: 4,
            }}
          >
            <Text style={{ ...Typography.body, color: '#FFF' }}>{item.content}</Text>
          </LinearGradient>
        ) : (
          <View
            style={{
              backgroundColor: colors.card,
              paddingHorizontal: Spacing.md,
              paddingVertical: Spacing.sm + 2,
              borderRadius: BorderRadius.lg,
              borderBottomLeftRadius: 4,
              borderWidth: 1,
              borderColor: colors.cardBorder,
            }}
          >
            <Text style={{ ...Typography.body, color: colors.text }}>{item.content}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          ...Layout.row,
          paddingHorizontal: Spacing.screenHorizontal,
          paddingVertical: Spacing.md,
          gap: Spacing.md,
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
          <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
        </Pressable>
        <View style={Layout.row}>
          <Text style={{ fontSize: 18, marginRight: Spacing.sm }}>✨</Text>
          <Text style={{ ...Typography.h3, color: colors.text }}>AI Assistant</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          padding: Spacing.screenHorizontal,
          paddingTop: Spacing.md,
          flexGrow: 1,
          justifyContent: messages.length === 0 ? 'center' : 'flex-end',
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 40, marginBottom: Spacing.md }}>✨</Text>
            <Text style={{ ...Typography.h3, color: colors.text, textAlign: 'center' }}>
              AI Assistant
            </Text>
            <Text
              style={{
                ...Typography.body,
                color: colors.textMuted,
                textAlign: 'center',
                marginTop: Spacing.sm,
                maxWidth: 260,
              }}
            >
              Ask me for date ideas, conflict resolution tips, or productivity coaching.
            </Text>
          </View>
        }
      />

      {isLoading && (
        <View style={{ paddingHorizontal: Spacing.screenHorizontal, paddingBottom: Spacing.sm }}>
          <View style={{ ...Layout.row, alignSelf: 'flex-start' }}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={{ ...Typography.caption, color: colors.textMuted, marginLeft: Spacing.sm }}>
              Thinking...
            </Text>
          </View>
        </View>
      )}

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View
          style={{
            ...Layout.row,
            paddingHorizontal: Spacing.screenHorizontal,
            paddingVertical: Spacing.sm,
            gap: Spacing.sm,
            borderTopWidth: 1,
            borderTopColor: colors.cardBorder,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything..."
            placeholderTextColor={colors.textMuted}
            style={{
              flex: 1,
              height: 44,
              backgroundColor: Palette.white06,
              borderRadius: BorderRadius.md,
              paddingHorizontal: Spacing.md,
              color: colors.text,
              ...Typography.body,
            }}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <Pressable
            onPress={sendMessage}
            disabled={!input.trim() || isLoading}
            style={({ pressed }) => ({
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: input.trim() ? colors.primary : Palette.white06,
              ...Layout.center,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons
              name="send"
              size={18}
              color={input.trim() ? '#FFF' : colors.textMuted}
            />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
