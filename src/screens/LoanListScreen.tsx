import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, ActivityIndicator, Alert, Modal } from 'react-native';
import { API_BASE_URL } from '../api/config';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Iconos
const menuIcon = require('../assets/icons/menu.png');
const cancelIcon = require('../assets/icons/cancel.png');
const avatarDefault = require('../assets/icons/avatar.png');
const filterIcon = require('../assets/icons/filter.png');


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
  RecordPaymentScreen: { loan: any };
};

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
  const [filters, setFilters] = useState({
    activos: true,
    cancelados: false,
    pagados: false,
    atrasados: false
  });
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    let filtered = Array.isArray(loans) ? loans : [];
    
    // Aplicar filtros de estado
    const statusFilters: string[] = [];
    if (filters.activos) statusFilters.push('activo');
    if (filters.cancelados) statusFilters.push('cancelado');
    if (filters.pagados) statusFilters.push('pagado');
    if (filters.atrasados) statusFilters.push('atrasado');
    
    if (statusFilters.length > 0) {
      filtered = filtered.filter(l => statusFilters.includes(l.status?.toLowerCase() || ''));
    }
    
    // Aplicar búsqueda
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
  }, [loans, search, filters]);

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

  const handleCancelLoan = async (loan: any) => {
    Alert.alert(
      'Cancelar Préstamo',
      `¿Estás seguro de que quieres cancelar el préstamo #${loan.id}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/loans/${loan.id}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                Alert.alert('Éxito', 'Préstamo cancelado correctamente.');
                fetchLoans();
              } else {
                Alert.alert('Error', 'No se pudo cancelar el préstamo.');
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo conectar con el servidor.');
            }
          },
        },
      ]
    );
  };

  const renderLoan = ({ item }: { item: any }) => (
    <View style={styles.loanCard}>
      <View style={styles.avatarContainer}>
        <Image 
          source={avatarDefault} 
          style={styles.avatar} 
        />
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: item.status === 'activo' ? '#10B981' : '#EF4444' }
        ]} />
      </View>
      <View style={styles.loanInfo}>
        <Text style={styles.loanTitle}>Préstamo #{item.id}</Text>
        <Text style={styles.loanLabel}>Cliente: <Text style={styles.loanValue}>{item.client_name || `ID: ${item.client_id}`}</Text></Text>
        <Text style={styles.loanLabel}>Monto: <Text style={styles.loanValue}>RD$ {parseFloat(item.amount).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text></Text>
        <Text style={styles.loanLabel}>Interés: <Text style={styles.loanValue}>{item.interest_rate}%</Text></Text>
        <Text style={styles.loanLabel}>Cuotas: <Text style={styles.loanValue}>{item.num_installments}</Text></Text>
        <Text style={styles.loanLabel}>Total a pagar: <Text style={styles.loanValue}>RD$ {parseFloat(item.total_with_interest || item.amount).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text></Text>
        <Text style={styles.loanLabel}>Estado: <Text style={styles.loanValue}>{item.status}</Text></Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleCancelLoan(item)}>
          <Image source={cancelIcon} style={styles.actionIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('RecordPaymentScreen', { loan: item })}>
          <Text style={styles.plusIcon}>➕</Text>
        </TouchableOpacity>
      </View>
    </View>
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
      {/* Buscador con icono de filtros */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por ID, nombre del cliente o estado..."
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity 
          style={styles.filterIconButton}
          onPress={() => setShowFiltersModal(true)}
        >
          <Image source={filterIcon} style={styles.filterIconImage} />
        </TouchableOpacity>
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
      {/* Modal de Filtros */}
      <Modal
        visible={showFiltersModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtros</Text>
            
            <TouchableOpacity
              style={[styles.modalFilterBtn, filters.activos && styles.modalFilterBtnActive]}
              onPress={() => setFilters(prev => ({ ...prev, activos: !prev.activos }))}
            >
              <Text style={[styles.modalFilterText, filters.activos && styles.modalFilterTextActive]}>Activos</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalFilterBtn, filters.cancelados && styles.modalFilterBtnInactive]}
              onPress={() => setFilters(prev => ({ ...prev, cancelados: !prev.cancelados }))}
            >
              <Text style={[styles.modalFilterText, filters.cancelados && styles.modalFilterTextInactive]}>Cancelados</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalFilterBtn, filters.pagados && styles.modalFilterBtnPaid]}
              onPress={() => setFilters(prev => ({ ...prev, pagados: !prev.pagados }))}
            >
              <Text style={[styles.modalFilterText, filters.pagados && styles.modalFilterTextPaid]}>Pagados</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalFilterBtn, filters.atrasados && styles.modalFilterBtnLate]}
              onPress={() => setFilters(prev => ({ ...prev, atrasados: !prev.atrasados }))}
            >
              <Text style={[styles.modalFilterText, filters.atrasados && styles.modalFilterTextLate]}>Atrasados</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowFiltersModal(false)}
            >
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    paddingRight: 8,
  },
  filterIconButton: {
    padding: 8,
    borderRadius: 6,
  },
  filterIconImage: {
    width: 16,
    height: 16,
    tintColor: '#10B981',
  },
  loanCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  loanInfo: {
    flex: 1,
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: '#6B7280',
  },
  plusIcon: {
    fontSize: 20,
    color: '#10B981',
    fontWeight: 'bold',
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterBtnInactive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  filterBtnPaid: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterBtnLate: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterTextInactive: {
    color: '#FFFFFF',
  },
  filterTextPaid: {
    color: '#FFFFFF',
  },
  filterTextLate: {
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1F2937',
  },
  modalFilterBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    marginBottom: 8,
    alignItems: 'center',
  },
  modalFilterBtnActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  modalFilterBtnInactive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  modalFilterBtnPaid: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  modalFilterBtnLate: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  modalFilterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalFilterTextActive: {
    color: '#FFFFFF',
  },
  modalFilterTextInactive: {
    color: '#FFFFFF',
  },
  modalFilterTextPaid: {
    color: '#FFFFFF',
  },
  modalFilterTextLate: {
    color: '#FFFFFF',
  },
  modalCloseButton: {
    backgroundColor: '#6B7280',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LoanListScreen; 