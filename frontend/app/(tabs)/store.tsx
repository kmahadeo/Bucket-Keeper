import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { Typography, Spacing, BorderRadius, Layout, Shadows } from '../../src/constants/theme';
import { Palette } from '../../src/constants/colors';
import {
  Card,
  GradientButton,
  Chip,
  SectionHeader,
  Badge,
  useThemeColors,
} from '../../src/components/UIKit';
import { CoinDisplay } from '../../src/components/CoinDisplay';
import { rewardsApi, Reward } from '../../src/utils/api';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TREAT_CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2;

export default function StoreScreen() {
  const colors = useThemeColors();
  const queryClient = useQueryClient();
  const { user, updateCoins } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    cost: '50',
    reward_type: 'personal' as 'personal' | 'joint',
    is_goal: false,
  });

  const {
    data: rewards,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => rewardsApi.getAll().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      rewardsApi.create({
        title: newReward.title,
        cost: parseInt(newReward.cost) || 50,
        reward_type: newReward.reward_type,
        is_goal: newReward.is_goal,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      setShowAddModal(false);
      setNewReward({ title: '', cost: '50', reward_type: 'personal', is_goal: false });
    },
  });

  const redeemMutation = useMutation({
    mutationFn: (rewardId: string) => rewardsApi.redeem(rewardId) as Promise<any>,
    onSuccess: (response) => {
      const data = response?.data as any;
      if (data?.coins_joint !== undefined) {
        updateCoins(data.coins_joint, data.coins_personal);
      }
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      Alert.alert('Redeemed!', data?.message || 'Enjoy your reward!');
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to redeem');
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRedeem = (reward: Reward) => {
    const currentCoins =
      reward.reward_type === 'joint' ? user?.coins_joint : user?.coins_personal;
    if ((currentCoins || 0) < reward.cost) {
      Alert.alert('Not enough coins', `You need ${reward.cost} coins`);
      return;
    }
    Alert.alert('Redeem', `Spend ${reward.cost} coins for "${reward.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Redeem', onPress: () => redeemMutation.mutate(reward.reward_id) },
    ]);
  };

  const goals = rewards?.filter((r) => r.is_goal) || [];
  const treats = rewards?.filter((r) => !r.is_goal) || [];

  const jointCoins = user?.coins_joint ?? 0;
  const personalCoins = user?.coins_personal ?? 0;

  const renderGoalCard = (reward: Reward) => (
    <Card key={reward.reward_id} style={{ marginBottom: Spacing.sm }}>
      <View style={Layout.row}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: BorderRadius.md,
            backgroundColor:
              reward.reward_type === 'joint'
                ? Palette.coinGold + '18'
                : Palette.indigo15,
            ...Layout.center,
            marginRight: Spacing.md,
          }}
        >
          <Text style={{ fontSize: 22 }}>
            {reward.reward_type === 'joint' ? '\uD83C\uDFC6' : '\uD83C\uDFAF'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ ...Typography.bodyMedium, color: colors.text }}
            numberOfLines={1}
          >
            {reward.title}
          </Text>
          <View style={[Layout.row, { marginTop: 2, gap: Spacing.xs }]}>
            <Ionicons name="star" size={14} color={Palette.coinGold} />
            <Text
              style={{
                ...Typography.caption,
                color: Palette.coinGold,
                fontWeight: '700',
              }}
            >
              {reward.cost}
            </Text>
          </View>
        </View>
        {reward.reward_type === 'joint' && (
          <Ionicons
            name="lock-closed"
            size={16}
            color={colors.textMuted}
            style={{ marginLeft: Spacing.sm }}
          />
        )}
      </View>
    </Card>
  );

  const renderTreatCard = (reward: Reward, index: number) => (
    <View
      key={reward.reward_id}
      style={{
        width: TREAT_CARD_WIDTH,
        marginBottom: Spacing.sm,
        marginRight: index % 2 === 0 ? Spacing.sm : 0,
      }}
    >
      <Card padded={false}>
        <View style={{ padding: Spacing.md, alignItems: 'center' }}>
          <Text style={{ fontSize: 32, marginBottom: Spacing.sm }}>
            {reward.reward_type === 'joint' ? '\uD83C\uDF81' : '\uD83C\uDF89'}
          </Text>
          <Text
            style={{
              ...Typography.bodyMedium,
              color: colors.text,
              textAlign: 'center',
              marginBottom: Spacing.xs,
            }}
            numberOfLines={2}
          >
            {reward.title}
          </Text>
          <Badge
            text={`${reward.cost} coins`}
            color={Palette.coinGold + '20'}
            textColor={Palette.coinGold}
          />
          <View style={{ marginTop: Spacing.sm, width: '100%' }}>
            <GradientButton
              title="Redeem"
              onPress={() => handleRedeem(reward)}
              size="sm"
            />
          </View>
        </View>
      </Card>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[Typography.h1, { color: colors.text }]}>Rewards</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Coin display pills */}
        <CoinDisplay
          jointCoins={jointCoins}
          personalCoins={personalCoins}
        />

        {/* AI Recommendation card */}
        <Card style={{ marginTop: Spacing.lg }}>
          <View style={Layout.row}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Palette.indigo15,
                ...Layout.center,
                marginRight: Spacing.md,
              }}
            >
              <Ionicons name="sparkles" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  ...Typography.label,
                  color: colors.primary,
                  marginBottom: 2,
                }}
              >
                AI RECOMMENDATION
              </Text>
              <Text
                style={{
                  ...Typography.bodySmall,
                  color: colors.textSecondary,
                }}
              >
                Analyzing your rewards...
              </Text>
            </View>
          </View>
        </Card>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Joint Goals */}
            <View style={{ marginTop: Spacing.sectionGap }}>
              <SectionHeader
                title="JOINT GOALS"
                action="Add Custom"
                onAction={() => {
                  setNewReward((r) => ({
                    ...r,
                    reward_type: 'joint',
                    is_goal: true,
                  }));
                  setShowAddModal(true);
                }}
              />
              {goals.length > 0 ? (
                goals.map(renderGoalCard)
              ) : (
                <Card style={{ alignItems: 'center' as const }}>
                  <Ionicons
                    name="flag-outline"
                    size={28}
                    color={colors.textMuted}
                  />
                  <Text
                    style={{
                      ...Typography.bodySmall,
                      color: colors.textMuted,
                      marginTop: Spacing.xs,
                    }}
                  >
                    No goals yet. Set one to start saving!
                  </Text>
                </Card>
              )}
            </View>

            {/* Treat Yourself */}
            <View style={{ marginTop: Spacing.sectionGap }}>
              <SectionHeader
                title="TREAT YOURSELF"
                action="Add Custom"
                onAction={() => {
                  setNewReward((r) => ({
                    ...r,
                    reward_type: 'personal',
                    is_goal: false,
                  }));
                  setShowAddModal(true);
                }}
              />
              {treats.length > 0 ? (
                <View style={styles.treatGrid}>
                  {treats.map((reward, index) =>
                    renderTreatCard(reward, index)
                  )}
                </View>
              ) : (
                <Card style={{ alignItems: 'center' as const }}>
                  <Ionicons
                    name="gift-outline"
                    size={28}
                    color={colors.textMuted}
                  />
                  <Text
                    style={{
                      ...Typography.bodySmall,
                      color: colors.textMuted,
                      marginTop: Spacing.xs,
                    }}
                  >
                    Add rewards to motivate yourselves!
                  </Text>
                </Card>
              )}
            </View>
          </>
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Add Reward Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <TouchableOpacity
          style={[
            styles.modalOverlay,
            { backgroundColor: 'rgba(0,0,0,0.6)' },
          ]}
          activeOpacity={1}
          onPress={() => setShowAddModal(false)}
        >
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <TouchableOpacity activeOpacity={1}>
              <Text
                style={{
                  ...Typography.h2,
                  color: colors.text,
                  textAlign: 'center',
                  marginBottom: Spacing.lg,
                }}
              >
                Create Reward
              </Text>

              <Text
                style={{
                  ...Typography.label,
                  color: colors.textSecondary,
                  marginBottom: Spacing.xs,
                }}
              >
                NAME
              </Text>
              <View
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <TextInput
                  style={[
                    styles.input,
                    { color: colors.text },
                  ]}
                  placeholder="e.g., Movie Night"
                  placeholderTextColor={colors.textMuted}
                  value={newReward.title}
                  onChangeText={(text) =>
                    setNewReward((r) => ({ ...r, title: text }))
                  }
                />
              </View>

              <Text
                style={{
                  ...Typography.label,
                  color: colors.textSecondary,
                  marginBottom: Spacing.xs,
                  marginTop: Spacing.md,
                }}
              >
                COST (COINS)
              </Text>
              <View
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="50"
                  placeholderTextColor={colors.textMuted}
                  value={newReward.cost}
                  onChangeText={(text) =>
                    setNewReward((r) => ({ ...r, cost: text }))
                  }
                  keyboardType="numeric"
                />
              </View>

              <Text
                style={{
                  ...Typography.label,
                  color: colors.textSecondary,
                  marginBottom: Spacing.xs,
                  marginTop: Spacing.md,
                }}
              >
                TYPE
              </Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor:
                        newReward.reward_type === 'personal'
                          ? colors.primary
                          : colors.background,
                      borderColor:
                        newReward.reward_type === 'personal'
                          ? colors.primary
                          : colors.cardBorder,
                    },
                  ]}
                  onPress={() =>
                    setNewReward((r) => ({ ...r, reward_type: 'personal' }))
                  }
                >
                  <Ionicons
                    name="person"
                    size={18}
                    color={
                      newReward.reward_type === 'personal'
                        ? '#FFF'
                        : colors.primary
                    }
                  />
                  <Text
                    style={[
                      Typography.caption,
                      {
                        color:
                          newReward.reward_type === 'personal'
                            ? '#FFF'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    Personal
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor:
                        newReward.reward_type === 'joint'
                          ? Palette.coinGold
                          : colors.background,
                      borderColor:
                        newReward.reward_type === 'joint'
                          ? Palette.coinGold
                          : colors.cardBorder,
                    },
                  ]}
                  onPress={() =>
                    setNewReward((r) => ({ ...r, reward_type: 'joint' }))
                  }
                >
                  <Ionicons
                    name="people"
                    size={18}
                    color={
                      newReward.reward_type === 'joint'
                        ? '#FFF'
                        : Palette.coinGold
                    }
                  />
                  <Text
                    style={[
                      Typography.caption,
                      {
                        color:
                          newReward.reward_type === 'joint'
                            ? '#FFF'
                            : colors.textSecondary,
                      },
                    ]}
                  >
                    Joint
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.goalToggle}
                onPress={() =>
                  setNewReward((r) => ({ ...r, is_goal: !r.is_goal }))
                }
              >
                <Ionicons
                  name={newReward.is_goal ? 'checkbox' : 'square-outline'}
                  size={22}
                  color={newReward.is_goal ? colors.primary : colors.textMuted}
                />
                <Text style={{ ...Typography.body, color: colors.text }}>
                  This is a savings goal
                </Text>
              </TouchableOpacity>

              <GradientButton
                title={createMutation.isPending ? 'Creating...' : 'Create Reward'}
                onPress={() => createMutation.mutate()}
                disabled={createMutation.isPending || !newReward.title.trim()}
                loading={createMutation.isPending}
                size="lg"
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  content: { flex: 1 },
  contentContainer: { padding: Spacing.lg },
  loadingContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  treatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    borderRadius: BorderRadius.card,
    padding: Spacing.lg,
    width: '100%',
    borderWidth: 1,
  },
  modalInput: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  input: {
    height: 48,
    paddingHorizontal: Spacing.md,
    ...Typography.body,
  },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  goalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
});
