import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../src/constants/theme';
import { AnimatedGradientBackground } from '../../src/components/AnimatedGradientBackground';
import { GlassCard } from '../../src/components/GlassCard';
import { CoinDisplayPremium } from '../../src/components/CoinDisplayPremium';
import { SkeuomorphicButton, Icon3D } from '../../src/components/SkeuomorphicElements';
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
      Alert.alert('Congratulations! 🎉', response.data.message);
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
    const coinType = reward.reward_type === 'joint' ? 'joint' : 'personal';
    const currentCoins = reward.reward_type === 'joint' ? user?.coins_joint : user?.coins_personal;
    
    if ((currentCoins || 0) < reward.cost) {
      Alert.alert('Not enough coins', `You need ${reward.cost} coins but only have ${currentCoins || 0}`);
      return;
    }

    Alert.alert(
      'Redeem Reward',
      `Spend ${reward.cost} ${coinType} coins for "${reward.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Redeem 🎉', onPress: () => redeemMutation.mutate(reward.reward_id) },
      ]
    );
  };

  const jointRewards = rewards?.filter(r => r.reward_type === 'joint' && !r.is_goal) || [];
  const personalRewards = rewards?.filter(r => r.reward_type === 'personal' && !r.is_goal) || [];
  const goals = rewards?.filter(r => r.is_goal) || [];

  const RewardCard = ({ reward }: { reward: Reward }) => (
    <GlassCard style={styles.rewardCard}>
      <View style={styles.rewardIcon}>
        <Icon3D 
          icon={reward.reward_type === 'joint' ? 'gift' : 'star'}
          color={reward.reward_type === 'joint' ? '#F59E0B' : '#A855F7'}
          size={44}
        />
      </View>
      <View style={styles.rewardInfo}>
        <Text style={styles.rewardTitle}>{reward.title}</Text>
        <View style={styles.rewardCost}>
          <Text style={styles.costEmoji}>🪙</Text>
          <Text style={styles.costText}>{reward.cost}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleRedeem(reward)}>
        <LinearGradient
          colors={reward.reward_type === 'joint' ? ['#F59E0B', '#D97706'] : ['#A855F7', '#7C3AED']}
          style={styles.redeemBtn}
        >
          <Text style={styles.redeemText}>Redeem</Text>
        </LinearGradient>
      </TouchableOpacity>
    </GlassCard>
  );

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Rewards</Text>
          <TouchableOpacity onPress={() => setShowAddModal(true)}>
            <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.addBtn}>
              <Ionicons name="add" size={24} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
        >
          {/* Coins */}
          <CoinDisplayPremium 
            jointCoins={user?.coins_joint || 0} 
            personalCoins={user?.coins_personal || 0}
          />

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.accent} />
            </View>
          ) : (
            <>
              {/* Goals */}
              {goals.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>🎯 SAVINGS GOALS</Text>
                  {goals.map((reward) => <RewardCard key={reward.reward_id} reward={reward} />)}
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
                  jointRewards.map((reward) => <RewardCard key={reward.reward_id} reward={reward} />)
                ) : (
                  <GlassCard style={styles.emptySection}>
                    <Icon3D icon="gift-outline" color="#6B7280" size={40} />
                    <Text style={styles.emptyText}>No joint rewards yet</Text>
                  </GlassCard>
                )}
              </View>

              {/* Personal Rewards */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>✨ TREAT YOURSELF</Text>
                  <TouchableOpacity onPress={() => { setNewReward(r => ({ ...r, reward_type: 'personal' })); setShowAddModal(true); }}>
                    <Text style={styles.addLink}>+ Add</Text>
                  </TouchableOpacity>
                </View>
                {personalRewards.length > 0 ? (
                  personalRewards.map((reward) => <RewardCard key={reward.reward_id} reward={reward} />)
                ) : (
                  <GlassCard style={styles.emptySection}>
                    <Icon3D icon="star-outline" color="#6B7280" size={40} />
                    <Text style={styles.emptyText}>No personal rewards yet</Text>
                  </GlassCard>
                )}
              </View>
            </>
          )}

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>

        {/* Add Reward Modal */}
        <Modal visible={showAddModal} transparent animationType="fade" onRequestClose={() => setShowAddModal(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAddModal(false)}>
            <GlassCard style={styles.modalContent}>
              <Text style={styles.modalTitle}>Create Reward</Text>

              <View style={styles.inputContainer}>
                <Ionicons name="gift-outline" size={20} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  placeholder="Reward name (e.g., Movie Night)"
                  placeholderTextColor={Colors.textMuted}
                  value={newReward.title}
                  onChangeText={(text) => setNewReward(r => ({ ...r, title: text }))}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.coinEmoji}>🪙</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Cost (coins)"
                  placeholderTextColor={Colors.textMuted}
                  value={newReward.cost}
                  onChangeText={(text) => setNewReward(r => ({ ...r, cost: text }))}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeBtn, newReward.reward_type === 'personal' && styles.typeBtnActive]}
                  onPress={() => setNewReward(r => ({ ...r, reward_type: 'personal' }))}
                >
                  {newReward.reward_type === 'personal' && (
                    <LinearGradient colors={['#A855F7', '#7C3AED']} style={StyleSheet.absoluteFill} />
                  )}
                  <Ionicons name="person" size={20} color={newReward.reward_type === 'personal' ? '#FFF' : Colors.textMuted} />
                  <Text style={[styles.typeText, newReward.reward_type === 'personal' && { color: '#FFF' }]}>Personal</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, newReward.reward_type === 'joint' && styles.typeBtnActive]}
                  onPress={() => setNewReward(r => ({ ...r, reward_type: 'joint' }))}
                >
                  {newReward.reward_type === 'joint' && (
                    <LinearGradient colors={['#F59E0B', '#D97706']} style={StyleSheet.absoluteFill} />
                  )}
                  <Ionicons name="people" size={20} color={newReward.reward_type === 'joint' ? '#FFF' : Colors.textMuted} />
                  <Text style={[styles.typeText, newReward.reward_type === 'joint' && { color: '#FFF' }]}>Joint</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.goalToggle, newReward.is_goal && styles.goalToggleActive]}
                onPress={() => setNewReward(r => ({ ...r, is_goal: !r.is_goal }))}
              >
                <Ionicons name={newReward.is_goal ? 'checkbox' : 'square-outline'} size={24} color={newReward.is_goal ? Colors.success : Colors.textMuted} />
                <Text style={[styles.goalText, newReward.is_goal && { color: Colors.success }]}>This is a savings goal</Text>
              </TouchableOpacity>

              <SkeuomorphicButton
                title={createMutation.isPending ? 'Creating...' : 'Create Reward'}
                icon="gift"
                onPress={() => createMutation.mutate()}
                disabled={createMutation.isPending || !newReward.title}
                variant="primary"
              />
            </GlassCard>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: { fontSize: FontSize.xxl, fontWeight: '700', color: Colors.text },
  addBtn: {
    width: 44, height: 44, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
    ...Shadows.medium,
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
  sectionTitle: {
    fontSize: FontSize.xs, fontWeight: '600',
    color: Colors.textMuted, letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  addLink: { fontSize: FontSize.sm, color: Colors.accent, fontWeight: '500' },
  emptySection: { alignItems: 'center', padding: Spacing.lg },
  emptyText: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: Spacing.sm },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  rewardIcon: { marginRight: Spacing.md },
  rewardInfo: { flex: 1 },
  rewardTitle: { fontSize: FontSize.md, fontWeight: '600', color: Colors.text, marginBottom: 4 },
  rewardCost: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  costEmoji: { fontSize: 14 },
  costText: { fontSize: FontSize.sm, color: Colors.gold, fontWeight: '600' },
  redeemBtn: {
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  redeemText: { fontSize: FontSize.sm, fontWeight: '600', color: '#FFF' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: { width: '100%', padding: Spacing.lg },
  modalTitle: {
    fontSize: FontSize.xl, fontWeight: '700', color: Colors.text,
    textAlign: 'center', marginBottom: Spacing.lg,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.glassDark,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: Spacing.sm,
  },
  coinEmoji: { fontSize: 18 },
  input: { flex: 1, height: 48, fontSize: FontSize.md, color: Colors.text },
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  typeBtn: {
    flex: 1, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    gap: Spacing.sm, padding: Spacing.md,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    borderWidth: 1, borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  typeBtnActive: { borderWidth: 0 },
  typeText: { fontSize: FontSize.sm, fontWeight: '500', color: Colors.textSecondary },
  goalToggle: {
    flexDirection: 'row', alignItems: 'center',
    gap: Spacing.sm, padding: Spacing.md,
    backgroundColor: Colors.glass,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  goalToggleActive: { borderWidth: 1, borderColor: Colors.success },
  goalText: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
