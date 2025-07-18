import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

const backIcon = require('../assets/icons/back.png');
const checkIcon = require('../assets/icons/checkmark.png');

const CURRENCIES = [
  { code: 'DOP', name: 'Peso Dominicano' },
  { code: 'USD', name: 'Dólar Estadounidense' },
  { code: 'EUR', name: 'Euro' },
];

type RootStackParamList = {
  Profile: undefined;
};

const CurrencyScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [selected, setSelected] = useState('DOP');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('currency');
      if (saved) setSelected(saved);
    })();
  }, []);

  const handleSelect = async (code: string) => {
    setSelected(code);
    await AsyncStorage.setItem('currency', code);
    navigation.goBack();
  };

  // Get currency names from translations
  const getCurrencyName = (code: string) => {
    return t(`currency.${code}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backIcon} style={[styles.backIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('currency.title')}</Text>
        <View style={{ width: 28 }} />
      </View>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{t('currency.subtitle')}</Text>
      <FlatList
        data={CURRENCIES}
        keyExtractor={item => item.code}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.currencyRow, { backgroundColor: theme.card }]} onPress={() => handleSelect(item.code)}>
            <Text style={[styles.currencyCode, { color: theme.primary }]}>{item.code}</Text>
            <Text style={[styles.currencyName, { color: theme.text }]}>{getCurrencyName(item.code)}</Text>
            {selected === item.code && <Image source={checkIcon} style={[styles.checkIcon, { tintColor: theme.primary }]} />}
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
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
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginHorizontal: 16,
    marginBottom: 14,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    width: 60,
  },
  currencyName: {
    fontSize: 16,
    color: '#222',
    flex: 1,
  },
  checkIcon: {
    width: 24,
    height: 24,
    tintColor: '#10B981',
  },
});

export default CurrencyScreen; 