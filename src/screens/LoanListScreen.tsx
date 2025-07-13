import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, ActivityIndicator, Alert, Modal } from 'react-native';
import { API_BASE_URL } from '../api/config';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

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
  const { t } = useTranslation();
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
  const { theme } = useTheme();

  useEffect(() => {
    fetchLoans();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        setError(t('loanList.fetchError', { status: res.status, error: errorText }));
        setLoans([]);
        return;
      }
      
      const data = await res.json();
      console.log('Loans data:', data);
      setLoans(Array.isArray(data) ? data : data.loans || []);
    } catch (err) {
      console.error('Network error:', err);
      setLoans([]);
      setError(t('loanList.connectionError', { error: err instanceof Error ? err.message : t('common.unknownError') }));
    }
    setLoading(false);
  };

  const handleCancelLoan = async (loan: any) => {
    Alert.alert(
      t('loanList.cancelLoan'),
      t('loanList.cancelConfirmation', { loanId: loan.id }),
      [
        { text: t('common.no'), style: 'cancel' },
        {
          text: t('loanList.yesCancel'),
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/loans/${loan.id}`, {
                method: 'DELETE',
              });
              if (response.ok) {
                Alert.alert(t('common.success'), t('loanList.loanCancelled'));
                fetchLoans();
              } else {
                Alert.alert(t('common.error'), t('loanList.cancelError'));
              }
            } catch (error) {
              Alert.alert(t('common.error'), t('loanList.serverError'));
            }
          },
        },
      ]
    );
  };

  const renderLoan = ({ item }: { item: any }) => (
    <View style={[styles.loanCard, { backgroundColor: theme.card }]}>
      <View style={styles.avatarContainer}>
        <Image 
          source={avatarDefault} 
          style={styles.avatar} 
        />
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: item.status === 'activo' ? theme.primary : theme.accent, borderColor: theme.card }
        ]} />
      </View>
      <View style={styles.loanInfo}>
        <Text style={[styles.loanTitle, { color: theme.primary }]}>{t('loanList.loanNumber', { id: item.id })}</Text>
        <Text style={[styles.loanLabel, { color: theme.text }]}>{t('loanList.client')}: <Text style={[styles.loanValue, { color: theme.text }]}>{item.client_name || t('loanList.clientId', { id: item.client_id })}</Text></Text>
        <Text style={[styles.loanLabel, { color: theme.text }]}>{t('loanList.amount')}: <Text style={[styles.loanValue, { color: theme.text }]}>RD$ {parseFloat(item.amount).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text></Text>
        <Text style={[styles.loanLabel, { color: theme.text }]}>{t('loanList.interest')}: <Text style={[styles.loanValue, { color: theme.text }]}>{item.interest_rate}%</Text></Text>
        <Text style={[styles.loanLabel, { color: theme.text }]}>{t('loanList.installments')}: <Text style={[styles.loanValue, { color: theme.text }]}>{item.num_installments}</Text></Text>
        <Text style={[styles.loanLabel, { color: theme.text }]}>{t('loanList.totalToPay')}: <Text style={[styles.loanValue, { color: theme.text }]}>RD$ {parseFloat(item.total_with_interest || item.amount).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text></Text>
        <Text style={[styles.loanLabel, { color: theme.text }]}>{t('loanList.status')}: <Text style={[styles.loanValue, { color: theme.text }]}>{item.status}</Text></Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => handleCancelLoan(item)}>
          <Image source={cancelIcon} style={[styles.actionIcon, { tintColor: theme.accent }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('RecordPaymentScreen', { loan: item })}>
          <Text style={[styles.plusIcon, { color: theme.primary }]}>➕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      {/* Header con título y menú hamburguesa */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: theme.text }]}>{t('loanList.title')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={menuIcon} style={[styles.menuIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{t('loanList.subtitle')}</Text>
      {/* Buscador con icono de filtros */}
      <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={t('loanList.searchPlaceholder')}
          placeholderTextColor={theme.muted}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity 
          style={styles.filterIconButton}
          onPress={() => setShowFiltersModal(true)}
        >
          <Image source={filterIcon} style={[styles.filterIconImage, { tintColor: theme.primary }]} />
        </TouchableOpacity>
      </View>
      {/* Lista de préstamos */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 32 }} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.error, { color: theme.accent }]}>{error}</Text>
          <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.primary }]} onPress={fetchLoans}>
            <Text style={[styles.retryButtonText, { color: theme.text }]}>{t('loanList.retry')}</Text>
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
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('loanList.filters')}</Text>
            
            <TouchableOpacity
              style={[styles.modalFilterBtn, filters.activos && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => setFilters(prev => ({ ...prev, activos: !prev.activos }))}
            >
              <Text style={[styles.modalFilterText, filters.activos && { color: '#fff' }]}>{t('loanList.active')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalFilterBtn, filters.cancelados && { backgroundColor: theme.accent, borderColor: theme.accent }]}
              onPress={() => setFilters(prev => ({ ...prev, cancelados: !prev.cancelados }))}
            >
              <Text style={[styles.modalFilterText, filters.cancelados && { color: '#fff' }]}>{t('loanList.cancelled')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalFilterBtn, filters.pagados && { backgroundColor: theme.secondary, borderColor: theme.secondary }]}
              onPress={() => setFilters(prev => ({ ...prev, pagados: !prev.pagados }))}
            >
              <Text style={[styles.modalFilterText, filters.pagados && { color: '#fff' }]}>{t('loanList.paid')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalFilterBtn, filters.atrasados && { backgroundColor: theme.accent, borderColor: theme.accent }]}
              onPress={() => setFilters(prev => ({ ...prev, atrasados: !prev.atrasados }))}
            >
              <Text style={[styles.modalFilterText, filters.atrasados && { color: '#fff' }]}>{t('loanList.overdue')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalCloseButton, { backgroundColor: theme.muted }]}
              onPress={() => setShowFiltersModal(false)}
            >
              <Text style={[styles.modalCloseButtonText, { color: theme.text }]}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={chat} style={[styles.navIcon, { tintColor: theme.primary }]} />
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