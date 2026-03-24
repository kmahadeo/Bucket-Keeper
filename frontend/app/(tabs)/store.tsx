import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { Card, Button } from '../../src/components/UIKit';
import { CoinDisplay } from '../../src/components/CoinDisplay';
import { rewardsApi, Reward } from '../../src/utils/api';

export default function StoreScreen() {
  const queryClient = useQueryClient();
  const { user, updateCoins } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newReward, setNewReward] = useState({ title: '', cost: '50', reward_type: 'personal' as 'personal' | 'joint', is_goal: false });

  const { data: rewards, isLoading, refetch } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => rewardsApi.getAll().then(r => r.data),
  });

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
  });

  const redeemMutation = useMutation({
    mutationFn: (rewardId: string) => rewardsApi.redeem(rewardId),
    onSuccess: (response) => {
      updateCoins(response.data.coins_joint, response.data.coins_personal);
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      Alert.alert('Redeemed!', response.data.message);
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
    const currentCoins = reward.reward_type === 'joint' ? user?.coins_joint : user?.coins_personal;
    if ((currentCoins || 0) < reward.cost) {
      Alert.alert('Not enough coins', `You need ${reward.cost} coins`);
      return;
    }
    Alert.alert('Redeem', `Spend ${reward.cost} coins for "${reward.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Redeem', onPress: () => redeemMutation.mutate(reward.reward_id) },
    ]);
  };

  const jointRewards = rewards?.filter(r => r.reward_type === 'joint' && !r.is_goal) || [];
  const personalRewards = rewards?.filter(r => r.reward_type === 'personal' && !r.is_goal) || [];
  const goals = rewards?.filter(r => r.is_goal) || [];

  const RewardCard = ({ reward }: { reward: Reward }) => (
    <Card style={styles.rewardCard}>
      <View style={[styles.rewardIcon, { backgroundColor: reward.reward_type === 'joint' ? Colors.accent + '15' : Colors.primary + '15' }]}>
        <Ionicons 
          name={reward.is_goal ? 'flag' : 'gift'} 
          size={20} 
          color={reward.reward_type === 'joint' ? Colors.accent : Colors.primary} 
        />
      </View>
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardTitle}>{reward.title}</Text>
        <View style={styles.rewardCost}>
          <Ionicons name="star" size={14} color={Colors.gold} />
          <Text style={styles.costText}>{reward.cost}</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.redeemBtn} onPress={() => handleRedeem(reward)}>
        <Text style={styles.redeemText}>Redeem</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Rewards</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        <CoinDisplay jointCoins={user?.coins_joint || 0} personalCoins={user?.coins_personal || 0} />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : (
          <>
            {goals.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Savings Goals</Text>
                {goals.map((reward) => <RewardCard key={reward.reward_id} reward={reward} />)}
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Joint Rewards</Text>
                <TouchableOpacity onPress={() => { setNewReward(r => ({ ...r, reward_type: 'joint' })); setShowAddModal(true); }}>
                  <Text style={styles.addLink}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {jointRewards.length > 0 ? (
                jointRewards.map((reward) => <RewardCard key={reward.reward_id} reward={reward} />)
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No joint rewards yet</Text>
                </Card>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Personal Rewards</Text>
                <TouchableOpacity onPress={() => { setNewReward(r => ({ ...r, reward_type: 'personal' })); setShowAddModal(true); }}>
                  <Text style={styles.addLink}>+ Add</Text>
                </TouchableOpacity>
              </View>
              {personalRewards.length > 0 ? (
                personalRewards.map((reward) => <RewardCard key={reward.reward_id} reward={reward} />)
              ) : (
                <Card style={styles.emptyCard}>
                  <Text style={styles.emptyText}>No personal rewards yet</Text>
                </Card>
              )}
            </View>
          </>
        )}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAddModal(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create Reward</Text>
            
            <Text style={styles.modalLabel}>Name</Text>
            <View style={styles.modalInput}>
              <TextInput
                style={styles.input}
                placeholder="e.g., Movie Night"
                placeholderTextColor={Colors.textMuted}
                value={newReward.title}
                onChangeText={(text) => setNewReward(r => ({ ...r, title: text }))}
              />
            </View>

            <Text style={styles.modalLabel}>Cost (coins)</Text>
            <View style={styles.modalInput}>
              <TextInput
                style={styles.input}
                placeholder="50"
                placeholderTextColor={Colors.textMuted}
                value={newReward.cost}
                onChangeText={(text) => setNewReward(r => ({ ...r, cost: text }))}
                keyboardType="numeric"
              />
            </View>

            <Text style={styles.modalLabel}>Type</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[styles.typeBtn, newReward.reward_type === 'personal' && styles.typeBtnActive]}
                onPress={() => setNewReward(r => ({ ...r, reward_type: 'personal' }))}
              >
                <Ionicons name="person" size={18} color={newReward.reward_type === 'personal' ? '#FFF' : Colors.primary} />
                <Text style={[styles.typeText, newReward.reward_type === 'personal' && { color: '#FFF' }]}>Personal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, newReward.reward_type === 'joint' && styles.typeBtnActive]}
                onPress={() => setNewReward(r => ({ ...r, reward_type: 'joint' }))}
              >
                <Ionicons name="people" size={18} color={newReward.reward_type === 'joint' ? '#FFF' : Colors.accent} />
                <Text style={[styles.typeText, newReward.reward_type === 'joint' && { color: '#FFF' }]}>Joint</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.goalToggle}
              onPress={() => setNewReward(r => ({ ...r, is_goal: !r.is_goal }))}
            >
              <Ionicons name={newReward.is_goal ? 'checkbox' : 'square-outline'} size={22} color={newReward.is_goal ? Colors.primary : Colors.textMuted} />
              <Text style={styles.goalText}>This is a savings goal</Text>
            </TouchableOpacity>

            <Button
              title={createMutation.isPending ? 'Creating...' : 'Create Reward'}
              onPress={() => createMutation.mutate()}
              disabled={createMutation.isPending || !newReward.title}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { ...Typography.h1, color: Colors.text },
  addBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1 },
  contentContainer: { padding: Spacing.lg },
  loadingContainer: { paddingVertical: Spacing.xxl, alignItems: 'center' },
  section: { marginTop: Spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  addLink: { ...Typography.caption, color: Colors.primary },
  emptyCard: { alignItems: 'center', padding: Spacing.lg },
  emptyText: { ...Typography.body, color: Colors.textMuted },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rewardIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rewardInfo: { flex: 1 },
  rewardTitle: { ...Typography.bodyMedium, color: Colors.text, marginBottom: 2 },
  rewardCost: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  costText: { ...Typography.caption, color: Colors.gold, fontWeight: '600' },
  redeemBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  redeemText: { ...Typography.caption, color: '#FFF', fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
  },
  modalTitle: { ...Typography.h2, color: Colors.text, textAlign: 'center', marginBottom: Spacing.lg },
  modalLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.xs, marginTop: Spacing.sm },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: { height: 48, paddingHorizontal: Spacing.md, ...Typography.body, color: Colors.text },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  typeBtn: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  typeBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { ...Typography.caption, color: Colors.textSecondary },
  goalToggle: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  goalText: { ...Typography.body, color: Colors.text },
});
