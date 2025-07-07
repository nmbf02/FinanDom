import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  LoanList: undefined;
  PaymentSuccessScreen: undefined;
  Dashboard: undefined;
  // ...other screens
};

const checkIcon = require('../assets/icons/checkmark.png');

const PaymentSuccessScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.navigate('LoanList');
    }, 2500);
    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.checkCircle}>
        <Image source={checkIcon} style={styles.checkIcon} />
      </View>
      <Text style={styles.title}>¡Felicidades!</Text>
      <Text style={styles.subtitle}>El pago se registró exitosamente</Text>
      {/* Puedes agregar más detalles aquí si lo deseas */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1CC88A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  checkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  checkIcon: {
    width: 70,
    height: 70,
    tintColor: '#1CC88A',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default PaymentSuccessScreen; 