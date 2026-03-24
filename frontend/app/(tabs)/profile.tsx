import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, Typography, BorderRadius, Shadows } from '../../src/constants/theme';
import { Card, Avatar, Button } from '../../src/components/UIKit';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, linkPartner } = useAuthStore();
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [linking, setLinking] = useState(false);

  const handleLogout = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: async () => { await logout(); router.replace('/'); } },
    ]);
  };

  const handleLinkPartner = async () => {
    if (!partnerCode.trim()) {
      Alert.alert('Error', 'Please enter a partner code');
      return;
    }
    setLinking(true);
    try {
      const partnerName = await linkPartner(partnerCode.trim());
      setShowPartnerModal(false);
      setPartnerCode('');
      Alert.alert('Connected!', `You're now linked with ${partnerName}!`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLinking(false);
    }
  };

  const sharePartnerCode = async () => {
    if (user?.partner_code) {
      try {
        await Share.share({ message: `Join me on Bucket Keeper! Use my partner code: ${user.partner_code}` });
      } catch (error) {
        Alert.alert('Partner Code', user.partner_code);
      }
    }
  };

  const getMoodColor = (mood: string) => Colors.moods[mood as keyof typeof Colors.moods] || Colors.primary;

  const MenuItem = ({ icon, label, value, onPress, danger }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!onPress}>
      <View style={[styles.menuIcon, { backgroundColor: danger ? Colors.error + '15' : Colors.primary + '15' }]}>
        <Ionicons name={icon} size={18} color={danger ? Colors.error : Colors.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
        {value && <Text style={styles.menuValue}>{value}</Text>}
      </View>
      {onPress && <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <Card style={styles.profileCard}>
          <Avatar
            name={user?.name || 'User'}
            emoji={user?.mood_emoji || '😊'}
            moodColor={getMoodColor(user?.mood || 'happy')}
            size="large"
          />
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.accent }]}>{user?.coins_joint || 0}</Text>
              <Text style={styles.statLabel}>Joint Coins</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.primary }]}>{user?.coins_personal || 0}</Text>
              <Text style={styles.statLabel}>Personal Coins</Text>
            </View>
          </View>
        </Card>

        {/* Partner Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partner</Text>
          
          {user?.partner_id ? (
            <Card style={styles.partnerCard}>
              <View style={styles.partnerConnected}>
                <View style={[styles.partnerIcon, { backgroundColor: Colors.accent + '15' }]}>
                  <Ionicons name="heart" size={24} color={Colors.accent} />
                </View>
                <View style={styles.partnerInfo}>
                  <Text style={styles.partnerName}>Linked with {user.partner_name || 'Partner'}</Text>
                  <Text style={styles.partnerStatus}>Sharing tasks & earning together</Text>
                </View>
              </View>
            </Card>
          ) : (
            <>
              <Card style={styles.codeCard}>
                <Text style={styles.codeLabel}>Your Partner Code</Text>
                <View style={styles.codeRow}>
                  <Text style={styles.codeValue}>{user?.partner_code || '------'}</Text>
                  <TouchableOpacity style={styles.shareBtn} onPress={sharePartnerCode}>
                    <Ionicons name="share-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.codeHint}>Share this code with your partner</Text>
              </Card>
              <View style={{ marginTop: Spacing.md }}>
                <Button title="Link with Partner" icon="link" onPress={() => setShowPartnerModal(true)} />
              </View>
            </>
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Card>
            <MenuItem icon="person-outline" label="Name" value={user?.name} />
            <View style={styles.menuDivider} />
            <MenuItem icon="mail-outline" label="Email" value={user?.email} />
            <View style={styles.menuDivider} />
            <MenuItem icon="log-out-outline" label="Sign Out" onPress={handleLogout} danger />
          </Card>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Link Partner Modal */}
      <Modal visible={showPartnerModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPartnerModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIcon, { backgroundColor: Colors.accent + '15' }]}>
                <Ionicons name="heart" size={28} color={Colors.accent} />
              </View>
              <Text style={styles.modalTitle}>Link with Partner</Text>
              <Text style={styles.modalSubtitle}>Enter your partner's code to connect</Text>
            </View>

            <View style={styles.codeInputContainer}>
              <TextInput
                style={styles.codeInput}
                placeholder="Enter code"
                placeholderTextColor={Colors.textMuted}
                value={partnerCode}
                onChangeText={setPartnerCode}
                autoCapitalize="characters"
                maxLength={6}
              />
            </View>

            <Button title={linking ? 'Linking...' : 'Connect'} onPress={handleLinkPartner} disabled={linking} />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.lg },
  header: { marginBottom: Spacing.lg },
  title: { ...Typography.h1, color: Colors.text },
  profileCard: { alignItems: 'center', padding: Spacing.lg },
  userName: { ...Typography.h2, color: Colors.text, marginTop: Spacing.md },
  userEmail: { ...Typography.body, color: Colors.textSecondary, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...Typography.h1 },
  statLabel: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  section: { marginTop: Spacing.lg },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },
  partnerCard: { padding: Spacing.md },
  partnerConnected: { flexDirection: 'row', alignItems: 'center' },
  partnerIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  partnerInfo: { flex: 1 },
  partnerName: { ...Typography.bodyMedium, color: Colors.text },
  partnerStatus: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  codeCard: { padding: Spacing.md },
  codeLabel: { ...Typography.caption, color: Colors.textSecondary },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.xs },
  codeValue: { ...Typography.h1, color: Colors.primary, letterSpacing: 4 },
  shareBtn: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center', justifyContent: 'center',
  },
  codeHint: { ...Typography.caption, color: Colors.textMuted, marginTop: Spacing.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  menuContent: { flex: 1 },
  menuLabel: { ...Typography.body, color: Colors.text },
  menuValue: { ...Typography.caption, color: Colors.textMuted },
  menuDivider: { height: 1, backgroundColor: Colors.border, marginLeft: 52, marginVertical: Spacing.xs },
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
  modalHeader: { alignItems: 'center', marginBottom: Spacing.lg },
  modalIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md },
  modalTitle: { ...Typography.h2, color: Colors.text },
  modalSubtitle: { ...Typography.body, color: Colors.textSecondary, marginTop: Spacing.xs, textAlign: 'center' },
  codeInputContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  codeInput: {
    height: 56,
    ...Typography.h2,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 8,
  },
});
