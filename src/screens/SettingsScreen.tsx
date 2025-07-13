import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../hooks/useLanguage';
import { useTheme } from '../theme/ThemeContext';
// Puedes usar react-native-vector-icons para los íconos si lo tienes instalado
// Si no, usa imágenes locales o el componente Text con emojis como fallback

const avatar = require('../assets/icons/avatar.png');
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');
const back = require('../assets/icons/back.png');

const SettingsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { mode, setMode, theme } = useTheme();
  const [language, setLanguage] = useState<'es' | 'en' | 'system'>('es');
  const [userName, setUserName] = useState('Usuario');

  useEffect(() => {
    loadUserData();
    setLanguage(currentLanguage as 'es' | 'en' | 'system');
  }, [currentLanguage]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const userDataParsed = JSON.parse(userData);
        setUserName(userDataParsed.name || 'Usuario');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleLanguageChange = async (newLanguage: 'es' | 'en' | 'system') => {
    setLanguage(newLanguage);
    if (newLanguage === 'system') {
      // Usar el idioma del sistema
      const systemLanguage = 'es'; // Por defecto español
      await changeLanguage(systemLanguage);
    } else {
      await changeLanguage(newLanguage);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header con back */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={back} style={[styles.backIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('settings.title')}</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Foto y nombre */}
        <View style={styles.profileSection}>
          <Image source={avatar} style={styles.avatar} />
          <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
        </View>
        {/* Indicador de conexión
        <View style={styles.connectionRow}>
          <Text style={styles.connectionIcon}>↻</Text>
          <Text style={styles.connectionText}>
            {t('settings.connectionStatus')}
          </Text>
        </View> */}
        {/* Botón sincronizar
        <TouchableOpacity style={styles.syncButton} onPress={() => Alert.alert(t('settings.title'), t('settings.syncMessage')) }>
          <Text style={styles.syncButtonIcon}>↻</Text>
          <Text style={styles.syncButtonText}>{t('settings.syncButton')}</Text>
        </TouchableOpacity> */}
        {/* Tema */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings.theme')}</Text>
        <View style={[styles.pillRow, { backgroundColor: theme.card }]}>
          <TouchableOpacity style={[styles.pill, mode === 'light' && { backgroundColor: theme.primary }]} onPress={() => setMode('light')}>
            <Text
              style={[
                styles.pillText,
                { color: theme.text }
              ]}
            >
              {t('settings.themeOptions.light')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, mode === 'dark' && { backgroundColor: theme.primary }]} onPress={() => setMode('dark')}>
            <Text
              style={[
                styles.pillText,
                { color: theme.text }
              ]}
            >
              {t('settings.themeOptions.dark')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, mode === 'system' && { backgroundColor: theme.primary }]} onPress={() => setMode('system')}>
            <Text
              style={[
                styles.pillText,
                { color: theme.text }
              ]}
            >
              {t('settings.themeOptions.system')}
            </Text>
          </TouchableOpacity>
        </View>
        {/* Idioma */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('settings.language')}</Text>
        <View style={[styles.pillRow, { backgroundColor: theme.card }]}>
          <TouchableOpacity style={[styles.pill, language === 'es' && { backgroundColor: theme.primary }]} onPress={() => handleLanguageChange('es')}>
            <Text
              style={[
                styles.pillText,
                { color: theme.text }
              ]}
            >
              {t('settings.languageOptions.es')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, language === 'en' && { backgroundColor: theme.primary }]} onPress={() => handleLanguageChange('en')}>
            <Text
              style={[
                styles.pillText,
                { color: theme.text }
              ]}
            >
              {t('settings.languageOptions.en')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.pill, language === 'system' && { backgroundColor: theme.primary }]} onPress={() => handleLanguageChange('system')}>
            <Text
              style={[
                styles.pillText,
                { color: theme.text }
              ]}
            >
              {t('settings.languageOptions.system')}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { backgroundColor: theme.nav }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={[styles.navIcon, { tintColor: theme.navIcon }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Assistant')}>
          <Image source={chat} style={[styles.navIcon, { tintColor: theme.navIcon }]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={calendar} style={[styles.navIcon, { tintColor: theme.navIcon }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={user} style={[styles.navIcon, { tintColor: theme.navIcon }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 24,
    paddingTop: 64,
    marginBottom: 24, // antes 8
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
  profileSection: {
    alignItems: 'center',
    marginBottom: 24, // antes 8
    marginTop: 32,    // antes 16
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20, // antes 8
  },
  connectionIcon: {
    fontSize: 18,
    color: '#10B981',
    marginRight: 6,
  },
  connectionText: {
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 32, // antes 18
    width: '90%',
    alignSelf: 'center',
    marginTop: 2,
  },
  syncButtonIcon: {
    fontSize: 18,
    color: '#fff',
    marginRight: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12, // antes 8
    marginTop: 24,    // antes 4
    textAlign: 'center',
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    marginBottom: 16,
    width: '90%',
    alignSelf: 'center',
    padding: 3,
  },
  pill: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 24,
    paddingVertical: 8,
    marginHorizontal: 1,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: '#10B981',
  },
  pillText: {
    fontSize: 15,
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#fff',
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
});

export default SettingsScreen; 