import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, FontSize, BorderRadius, Shadows, CoupleColorPresets } from '../../src/constants/theme';
import { AnimatedGradientBackground } from '../../src/components/AnimatedGradientBackground';
import { GlassCard } from '../../src/components/GlassCard';
import { MoodOrbAvatar } from '../../src/components/MoodOrbAvatar';
import { SkeuomorphicButton } from '../../src/components/SkeuomorphicElements';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, linkPartner } = useAuthStore();
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
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

  const sharePartnerCode = async () => {
    if (user?.partner_code) {
      try {
        await Share.share({
          message: `Join me on Bucket Keeper! 💕 Use my partner code: ${user.partner_code}`,
        });
      } catch (error) {
        Alert.alert('Partner Code', `Share this code: ${user.partner_code}`);
      }
    }
  };

  return (
    <AnimatedGradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

          {/* Profile Card with 3D Avatar */}
          <GlassCard style={styles.profileCard} glowColor={Colors.accent}>
            <View style={styles.avatarContainer}>
              <MoodOrbAvatar
                name={user?.name || 'User'}
                mood={user?.mood || 'happy'}
                moodEmoji={user?.mood_emoji || '😊'}
                isMe={true}
                size="large"
              />
            </View>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
            
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.statIcon}>
                  <Ionicons name="people" size={16} color="#FFF" />
                </LinearGradient>
                <Text style={styles.statValue}>{user?.coins_joint || 0}</Text>
                <Text style={styles.statLabel}>Joint</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.statIcon}>
                  <Ionicons name="person" size={16} color="#FFF" />
                </LinearGradient>
                <Text style={styles.statValue}>{user?.coins_personal || 0}</Text>
                <Text style={styles.statLabel}>Personal</Text>
              </View>
            </View>
          </GlassCard>

          {/* Partner Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>❤️ PARTNER CONNECTION</Text>
            
            {user?.partner_id ? (
              <GlassCard style={styles.partnerLinkedCard} glowColor="#EC4899">
                <View style={styles.partnerLinkedContent}>
                  <LinearGradient colors={['#EC4899', '#BE185D']} style={styles.partnerIcon}>
                    <Ionicons name="heart" size={24} color="#FFF" />
                  </LinearGradient>
                  <View style={styles.partnerInfo}>
                    <Text style={styles.partnerName}>Linked with {user.partner_name || 'Partner'}</Text>
                    <Text style={styles.partnerStatus}>Sharing tasks & earning rewards together!</Text>
                  </View>
                </View>
              </GlassCard>
            ) : (
              <>
                <GlassCard style={styles.codeCard}>
                  <Text style={styles.codeLabel}>Your Partner Code</Text>
                  <View style={styles.codeRow}>
                    <Text style={styles.codeValue}>{user?.partner_code || '------'}</Text>
                    <TouchableOpacity style={styles.shareBtn} onPress={sharePartnerCode}>
                      <LinearGradient colors={['#A855F7', '#7C3AED']} style={styles.shareBtnGradient}>
                        <Ionicons name="share-outline" size={20} color="#FFF" />
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.codeHint}>Share this code with your partner to connect</Text>
                </GlassCard>
                
                <View style={{ marginTop: Spacing.md }}>
                  <SkeuomorphicButton
                    title="Link with Partner"
                    icon="link"
                    onPress={() => setShowPartnerModal(true)}
                    variant="primary"
                  />
                </View>
              </>
            )}
          </View>

          {/* Theme Customization */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎨 THEME</Text>
            <GlassCard>
              <TouchableOpacity style={styles.menuItem} onPress={() => setShowColorPicker(true)}>
                <View style={styles.menuLeft}>
                  <LinearGradient colors={['#667EEA', '#764BA2']} style={styles.menuIcon}>
                    <Ionicons name="color-palette" size={18} color="#FFF" />
                  </LinearGradient>
                  <Text style={styles.menuLabel}>Couple Colors</Text>
                </View>
                <View style={styles.colorPreview}>
                  <View style={[styles.colorDot, { backgroundColor: '#667EEA' }]} />
                  <View style={[styles.colorDot, { backgroundColor: '#764BA2' }]} />
                  <View style={[styles.colorDot, { backgroundColor: '#F093FB' }]} />
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </GlassCard>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACCOUNT</Text>
            <GlassCard>
              <View style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.info + '30' }]}>
                    <Ionicons name="person" size={18} color={Colors.info} />
                  </View>
                  <Text style={styles.menuLabel}>{user?.name}</Text>
                </View>
              </View>
              <View style={styles.menuDivider} />
              <View style={styles.menuItem}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.success + '30' }]}>
                    <Ionicons name="mail" size={18} color={Colors.success} />
                  </View>
                  <Text style={styles.menuLabel}>{user?.email}</Text>
                </View>
              </View>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: Colors.error + '30' }]}>
                    <Ionicons name="log-out" size={18} color={Colors.error} />
                  </View>
                  <Text style={[styles.menuLabel, { color: Colors.error }]}>Sign Out</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.error} />
              </TouchableOpacity>
            </GlassCard>
          </View>

          <View style={{ height: Spacing.xxl }} />
        </ScrollView>

        {/* Link Partner Modal */}
        <Modal
          visible={showPartnerModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowPartnerModal(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPartnerModal(false)}
          >
            <GlassCard style={styles.modalContent}>
              <LinearGradient colors={['#EC4899', '#BE185D']} style={styles.modalIcon}>
                <Ionicons name="heart" size={32} color="#FFF" />
              </LinearGradient>
              <Text style={styles.modalTitle}>Link with Partner</Text>
              <Text style={styles.modalSubtitle}>
                Enter your partner's code to connect and start sharing
              </Text>

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

              <SkeuomorphicButton
                title={linking ? 'Linking...' : 'Connect Hearts'}
                icon="heart"
                onPress={handleLinkPartner}
                disabled={linking}
                variant="primary"
              />
            </GlassCard>
          </TouchableOpacity>
        </Modal>

        {/* Color Picker Modal */}
        <Modal
          visible={showColorPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowColorPicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowColorPicker(false)}
          >
            <GlassCard style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choose Theme</Text>
              <View style={styles.colorGrid}>
                {CoupleColorPresets.map((preset) => (
                  <TouchableOpacity
                    key={preset.name}
                    style={styles.colorOption}
                    onPress={() => setShowColorPicker(false)}
                  >
                    <LinearGradient
                      colors={preset.colors as [string, string, string]}
                      style={styles.colorOptionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                    />
                    <Text style={styles.colorOptionLabel}>{preset.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </AnimatedGradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '700',
    color: Colors.text,
  },
  profileCard: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginTop: Spacing.md,
  },
  userEmail: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.glassBorder,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  partnerLinkedCard: {
    padding: Spacing.md,
  },
  partnerLinkedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
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
    padding: Spacing.md,
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
    color: Colors.accent,
    letterSpacing: 6,
  },
  shareBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  shareBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeHint: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: Spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuLabel: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.glassBorder,
    marginLeft: 52,
  },
  colorPreview: {
    flexDirection: 'row',
    marginRight: Spacing.sm,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -4,
    borderWidth: 2,
    borderColor: Colors.backgroundDeep,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadows.glow('#EC4899'),
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  codeInputContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  codeInput: {
    backgroundColor: Colors.glassDark,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.xxl,
    color: Colors.text,
    textAlign: 'center',
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  colorOption: {
    alignItems: 'center',
    width: 80,
  },
  colorOptionGradient: {
    width: 60,
    height: 60,
    borderRadius: 16,
    marginBottom: Spacing.xs,
  },
  colorOptionLabel: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
});
