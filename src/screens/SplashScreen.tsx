// src/screens/Splash/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const SplashScreen = ({ navigation }: any) => {
  const { t } = useTranslation();

  useEffect(() => {
    // Espera 3 segundos y navega a Login (a definir luego)
    const timer = setTimeout(() => {
      navigation.replace('Login'); // ← más adelante configuraremos esta pantalla
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>{t('splash.title')}</Text>
      <Text style={styles.subtitle}>{t('splash.subtitle')}</Text>
      <Text style={styles.author}>{t('splash.author')} <Text style={styles.authorBold}>{t('splash.authorName')}</Text></Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1CC88A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 288,
    height: 288,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 60,
  },
  author: {
    position: 'absolute',
    bottom: 30,
    fontSize: 14,
    color: '#f5f5f5',
  },
  authorBold: {
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default SplashScreen;
