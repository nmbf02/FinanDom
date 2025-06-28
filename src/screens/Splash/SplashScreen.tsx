// src/screens/Splash/SplashScreen.tsx
import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }: any) => {
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
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>FinanDom</Text>
      <Text style={styles.subtitle}>Tu préstamo fácil, claro y al día.</Text>
      <Text style={styles.author}>By <Text style={styles.authorBold}>NMBF</Text></Text>
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
