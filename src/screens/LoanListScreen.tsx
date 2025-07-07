import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, ActivityIndicator } from 'react-native';
import { API_BASE_URL } from '../api/config';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
  CreateLoan: undefined;
  ContractPreviewScreen: any;
  LoanDetails: any;
  LoanList: undefined;
};

const menuIcon = require('../assets/icons/menu.png');
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');

const LoanListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loans, setLoans] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filteredLoans, setFilteredLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    let filtered = Array.isArray(loans) ? loans : [];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(l =>
        l.id?.toString().includes(s) ||
        l.client_id?.toString().includes(s) ||
        (l.client_name || '').toLowerCase().includes(s) ||
        (l.status || '').toLowerCase().includes(s)
      );
    }
    setFilteredLoans(filtered);
  }, [loans, search]);

  const fetchLoans = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching loans from:', `${API_BASE_URL}/api/loans`);
      const res = await fetch(`${API_BASE_URL}/api/loans`);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Backend error:', res.status, errorText);
        setError(`Error ${res.status}: ${errorText}`);
        setLoans([]);
        return;
      }
      
      const data = await res.json();
      console.log('Loans data:', data);
      setLoans(Array.isArray(data) ? data : data.loans || []);
    } catch (err) {
      console.error('Network error:', err);
      setLoans([]);
      setError(`Error de conexión: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
    setLoading(false);
  };

  const renderLoan = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.loanCard} onPress={() => navigation.navigate('LoanDetails', item)}>
      <View style={styles.loanInfo}>
        <Text style={styles.loanTitle}>Préstamo #{item.id}</Text>
        <Text style={styles.loanLabel}>Cliente: <Text style={styles.loanValue}>{item.client_name || `ID: ${item.client_id}`}</Text></Text>
        <Text style={styles.loanLabel}>Monto: <Text style={styles.loanValue}>RD$ {parseFloat(item.amount).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text></Text>
        <Text style={styles.loanLabel}>Interés: <Text style={styles.loanValue}>{item.interest_rate}%</Text></Text>
        <Text style={styles.loanLabel}>Cuotas: <Text style={styles.loanValue}>{item.num_installments}</Text></Text>
        <Text style={styles.loanLabel}>Estado: <Text style={styles.loanValue}>{item.status}</Text></Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Header con título y menú hamburguesa */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Lista de Préstamos</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={menuIcon} style={styles.menuIcon} />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Cuotas</Text>
      {/* Buscador */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ID, nombre del cliente o estado..."
          value={search}
          onChangeText={setSearch}
        />
      </View>
      {/* Lista de préstamos */}
      {loading ? (
        <ActivityIndicator size="large" color="#1CC88A" style={{ marginTop: 32 }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchLoans}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredLoans}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={renderLoan}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={chat} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={calendar} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={user} style={styles.navIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 64,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'left',
    paddingHorizontal: 16,
    marginTop: 8,
  },
  menuIcon: {
    width: 28,
    height: 28,
    tintColor: '#10B981',
    marginLeft: 0,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  loanCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  loanInfo: {
    flex: 1,
  },
  loanTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1CC88A',
    marginBottom: 4,
  },
  loanLabel: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  loanValue: {
    fontWeight: 'bold',
    color: '#222',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 16,
  },
  retryButton: {
    backgroundColor: '#1CC88A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
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

export default LoanListScreen; 