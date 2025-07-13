import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
  CreateLoan: undefined;
  LoanList: undefined;
  Client: { clientId?: number };
  OverduePayments: undefined;
  Assistant: undefined;
  Profile: undefined;
  HelpCenter: undefined;
  Currency: undefined;
  EditProfile: undefined;
  Settings: undefined;
};

const avatar = require('../assets/icons/avatar.png');
const edit = require('../assets/icons/edit.png');
const user = require('../assets/icons/user-setting.png');
const currency = require('../assets/icons/wallet.png');
const setting = require('../assets/icons/setting.png');
const help = require('../assets/icons/chat.png');
const logout = require('../assets/icons/back.png');
const home = require('../assets/icons/home.png');
const calendar = require('../assets/icons/calendar.png');

const Option = ({ icon, label, onPress, theme }: { icon: any; label: string; onPress: () => void; theme: any }) => (
  <TouchableOpacity style={[styles.optionRow, { backgroundColor: theme.card }]} onPress={onPress}>
    <View style={[styles.optionIconContainer, { backgroundColor: theme.primary }]}>
      <Image source={icon} style={[styles.optionIcon, { tintColor: '#fff' }]} />
    </View>
    <Text style={[styles.optionLabel, { color: theme.text }]}>{label}</Text>
    <Text style={[styles.optionArrow, { color: theme.muted }]}>{'>'}</Text>
  </TouchableOpacity>
);

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const userName = 'Nathaly Berroa'; // Aquí puedes traer el nombre real del usuario
  const [logoutVisible, setLogoutVisible] = React.useState(false);
  const handleLogout = async () => {
    await AsyncStorage.clear();
    setLogoutVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={logout} style={[styles.backIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('profile.title')}</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false}>
        {/* Foto de perfil */}
        <View style={styles.avatarContainer}>
          <Image source={avatar} style={styles.avatar} />
          <TouchableOpacity style={[styles.editIconContainer, { backgroundColor: theme.card }]} onPress={() => Alert.alert('Info', t('profile.photoEdit')) }>
            <Image source={edit} style={[styles.editIcon, { tintColor: theme.primary }]} />
          </TouchableOpacity>
        </View>
        <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
        {/* Opciones */}
        <View style={styles.optionsList}>
          <Option icon={user} label={t('profile.editProfile')} onPress={() => navigation.navigate('EditProfile')} theme={theme} />
          <Option icon={currency} label={t('profile.currency')} onPress={() => navigation.navigate('Currency')} theme={theme} />
          <Option icon={setting} label={t('profile.settings')} onPress={() => navigation.navigate('Settings')} theme={theme} />
          <Option icon={help} label={t('profile.help')} onPress={() => navigation.navigate('HelpCenter')} theme={theme} />
          <Option icon={logout} label={t('profile.logout')} onPress={() => setLogoutVisible(true)} theme={theme} />
        </View>
      </ScrollView>
      {/* Modal de logout */}
      <Modal visible={logoutVisible} transparent animationType="slide" onRequestClose={() => setLogoutVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.logoutModal, { backgroundColor: theme.card }]}>
            <Text style={[styles.logoutTitle, { color: theme.text }]}>{t('profile.logout')}</Text>
            <Text style={[styles.logoutText, { color: theme.muted }]}>{t('profile.logoutConfirm')}</Text>
            <View style={styles.logoutButtonsRow}>
              <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.accent || theme.primary }]} onPress={() => setLogoutVisible(false)}>
                <Text style={[styles.cancelButtonText, { color: theme.primary }]}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.logoutButton, { backgroundColor: theme.primary }]} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>{t('common.yes')}, {t('profile.logout')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Barra de navegación inferior */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Assistant')}>
          <Image source={help} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={calendar} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={user} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 64,
    marginBottom: 8,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#10B981',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 120,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
  },
  editIcon: {
    width: 22,
    height: 22,
    tintColor: '#10B981',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsList: {
    width: '90%',
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    elevation: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2DD4BF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  optionLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
    flex: 1,
  },
  optionArrow: {
    fontSize: 22,
    color: '#BDBDBD',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  navIcon: {
    width: 28,
    height: 28,
    tintColor: '#10B981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logoutModal: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
  },
  logoutButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E7FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 6,
  },
  cancelButtonText: {
    color: '#6366F1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ProfileScreen; 