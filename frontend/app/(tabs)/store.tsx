import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';
import { CoinDisplay } from '../../src/components/CoinDisplay';
import { rewardsApi, Reward } from '../../src/utils/api';

export default function StoreScreen() {
  const queryClient = useQueryClient();
  const { user, updateCoins } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReward, setNewReward] = useState({ title: '', cost: '50', reward_type: 'personal' as 'personal' | 'joint', is_goal: false });

  // Fetch rewards
  const { data: rewards, isLoading, refetch } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => rewardsApi.getAll().then(r => r.data),
  });

  // Create reward mutation
  const createMutation = useMutation({
    mutationFn: () => rewardsApi.create({
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
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to create reward');
    },
  });

  // Redeem mutation
  const redeemMutation = useMutation({
    mutationFn: (rewardId: string) => rewardsApi.redeem(rewardId),
    onSuccess: (response) => {
      updateCoins(response.data.coins_joint, response.data.coins_personal);
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      Alert.alert('Congratulations! 🎉', response.data.message);
    },
    onError: (error: any) => {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to redeem reward');
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleRedeem = (reward: Reward) => {
    const coinType = reward.reward_type === 'joint' ? 'joint' : 'personal';
    const currentCoins = reward.reward_type === 'joint' ? user?.coins_joint : user?.coins_personal;
    
    if ((currentCoins || 0) < reward.cost) {
      Alert.alert('Not enough coins', `You need ${reward.cost} ${coinType} coins but only have ${currentCoins || 0}`);
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Spend ${reward.cost} ${coinType} coins for "${reward.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Redeem', onPress: () => redeemMutation.mutate(reward.reward_id) },
      ]
    );
  };

  const jointRewards = rewards?.filter(r => r.reward_type === 'joint' && !r.is_goal) || [];
  const personalRewards = rewards?.filter(r => r.reward_type === 'personal' && !r.is_goal) || [];
  const goals = rewards?.filter(r => r.is_goal) || [];

  const RewardCard = ({ reward }: { reward: Reward }) => (
    <View style={styles.rewardCard}>
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardTitle}>{reward.title}</Text>
        <View style={styles.rewardCost}>
          <Ionicons name="sparkles" size={14} color={Colors.secondary} />
          <Text style={styles.costText}>{reward.cost}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.redeemBtn}
        onPress={() => handleRedeem(reward)}
        disabled={redeemMutation.isPending}
      >
        <Text style={styles.redeemText}>Redeem</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rewards</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* Coins */}
        <CoinDisplay 
          jointCoins={user?.coins_joint || 0} 
          personalCoins={user?.coins_personal || 0}
        />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {/* Goals */}
            {goals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🎯 GOALS</Text>
                {goals.map((reward) => (
                  <RewardCard key={reward.reward_id} reward={reward} />
                ))}
              </View>
            )}

            {/* Joint Rewards */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👥 JOINT REWARDS</Text>
                <TouchableOpacity onPress={() => { setNewReward(r => ({ ...r, reward_type: 'joint' })); setShowAddModal(true); }}>
                  <Text style={styles.addLink}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {jointRewards.length > 0 ? (
                jointRewards.map((reward) => (
                  <RewardCard key={reward.reward_id} reward={reward} />
                ))
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>No joint rewards yet</Text>
                </View>
              )}
            </View>

            {/* Personal Rewards */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🌟 TREAT YOURSELF</Text>
                <TouchableOpacity onPress={() => { setNewReward(r => ({ ...r, reward_type: 'personal' })); setShowAddModal(true); }}>
                  <Text style={styles.addLink}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {personalRewards.length > 0 ? (
                personalRewards.map((reward) => (
                  <RewardCard key={reward.reward_id} reward={reward} />
                ))
              ) : (
                <View style={styles.emptySection}>
                  <Text style={styles.emptyText}>No personal rewards yet</Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Add Reward Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Reward</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Reward name (e.g., Movie Night)"
              placeholderTextColor={Colors.textMuted}
              value={newReward.title}
              onChangeText={(text) => setNewReward(r => ({ ...r, title: text }))}
            />

            <TextInput
              style={styles.modalInput}
              placeholder="Cost (coins)"
              placeholderTextColor={Colors.textMuted}
              value={newReward.cost}
              onChangeText={(text) => setNewReward(r => ({ ...r, cost: text }))}
              keyboardType="numeric"
            />

            <View style={styles.modalRow}>
              <TouchableOpacity
                style={[styles.typeBtn, newReward.reward_type === 'personal' && styles.typeBtnActive]}
                onPress={() => setNewReward(r => ({ ...r, reward_type: 'personal' }))}
              >
                <Ionicons name="person" size={20} color={newReward.reward_type === 'personal' ? Colors.primary : Colors.textMuted} />
                <Text style={[styles.typeText, newReward.reward_type === 'personal' && { color: Colors.primary }]}>Personal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, newReward.reward_type === 'joint' && styles.typeBtnActive]}
                onPress={() => setNewReward(r => ({ ...r, reward_type: 'joint' }))}
              >
                <Ionicons name="people" size={20} color={newReward.reward_type === 'joint' ? Colors.secondary : Colors.textMuted} />
                <Text style={[styles.typeText, newReward.reward_type === 'joint' && { color: Colors.secondary }]}>Joint</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.goalToggle, newReward.is_goal && styles.goalToggleActive]}
              onPress={() => setNewReward(r => ({ ...r, is_goal: !r.is_goal }))}
            >
              <Ionicons name={newReward.is_goal ? 'checkbox' : 'square-outline'} size={24} color={newReward.is_goal ? Colors.success : Colors.textMuted} />
              <Text style={[styles.goalText, newReward.is_goal && { color: Colors.success }]}>This is a savings goal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createBtn}
              onPress={() => createMutation.mutate()}
              disabled={createMutation.isPending || !newReward.title}
            >
              <Text style={styles.createBtnText}>
                {createMutation.isPending ? 'Creating...' : 'Create Reward'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  loadingContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  addLink: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptySection: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  rewardCost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  costText: {
    fontSize: FontSize.sm,
    color: Colors.secondary,
    fontWeight: '600',
  },
  redeemBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  redeemText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    color: Colors.text,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
  },
  modalInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  modalRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeBtnActive: {
    borderColor: Colors.primary,
  },
  typeText: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  goalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  goalToggleActive: {
    borderWidth: 2,
    borderColor: Colors.success,
  },
  goalText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  createBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  createBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
});
