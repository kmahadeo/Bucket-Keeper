import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, FontSize, BorderRadius } from '../../src/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, linkPartner } = useAuthStore();
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerCode, setPartnerCode] = useState('');
  const [linking, setLinking] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          }
        },
      ]
    );
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
      Alert.alert('Success! ❤️', `You're now linked with ${partnerName}!`);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLinking(false);
    }
  };

  const copyPartnerCode = () => {
    if (user?.partner_code) {
      Alert.alert('Partner Code Copied!', `Share this code: ${user.partner_code}`);
    }
  };

  const MenuItem = ({ icon, label, value, onPress, color = Colors.text }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.menuIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      {value && <Text style={styles.menuValue}>{value}</Text>}
      {onPress && <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'User'}</Text>
          <Text style={styles.email}>{user?.email || ''}</Text>
        </View>

        {/* Partner Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PARTNER</Text>
          
          {user?.partner_id ? (
            <View style={styles.partnerLinked}>
              <Ionicons name="heart" size={24} color={Colors.error} />
              <View style={styles.partnerInfo}>
                <Text style={styles.partnerName}>Linked with {user.partner_name || 'Partner'}</Text>
                <Text style={styles.partnerStatus}>You can now share joint tasks and rewards!</Text>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.codeCard}>
                <Text style={styles.codeLabel}>Your Partner Code</Text>
                <View style={styles.codeRow}>
                  <Text style={styles.codeValue}>{user?.partner_code || '------'}</Text>
                  <TouchableOpacity style={styles.copyBtn} onPress={copyPartnerCode}>
                    <Ionicons name="copy-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.codeHint}>Share this code with your partner</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.linkBtn}
                onPress={() => setShowPartnerModal(true)}
              >
                <Ionicons name="link" size={20} color={Colors.text} />
                <Text style={styles.linkBtnText}>Link with Partner</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>YOUR COINS</Text>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color={Colors.secondary} />
              <Text style={styles.statValue}>{user?.coins_joint || 0}</Text>
              <Text style={styles.statLabel}>Joint</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="person" size={24} color={Colors.primary} />
              <Text style={styles.statValue}>{user?.coins_personal || 0}</Text>
              <Text style={styles.statLabel}>Personal</Text>
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.menu}>
            <MenuItem icon="person-outline" label="Name" value={user?.name} />
            <MenuItem icon="mail-outline" label="Email" value={user?.email} />
            <MenuItem 
              icon="log-out-outline" 
              label="Sign Out" 
              onPress={handleLogout}
              color={Colors.error}
            />
          </View>
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>

      {/* Link Partner Modal */}
      <Modal
        visible={showPartnerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPartnerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Link with Partner</Text>
              <TouchableOpacity onPress={() => setShowPartnerModal(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Enter your partner's code to connect your accounts
            </Text>

            <TextInput
              style={styles.codeInput}
              placeholder="Enter partner code"
              placeholderTextColor={Colors.textMuted}
              value={partnerCode}
              onChangeText={setPartnerCode}
              autoCapitalize="characters"
              maxLength={6}
            />

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleLinkPartner}
              disabled={linking}
            >
              <Text style={styles.confirmBtnText}>
                {linking ? 'Linking...' : 'Link Partner'}
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
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.text,
  },
  name: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
  },
  email: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  partnerLinked: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  partnerStatus: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  codeLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 4,
  },
  copyBtn: {
    padding: Spacing.sm,
  },
  codeHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  linkBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  menu: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.backgroundCard,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  menuValue: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
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
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '600',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  codeInput: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.xl,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 4,
    marginBottom: Spacing.lg,
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
  },
});
