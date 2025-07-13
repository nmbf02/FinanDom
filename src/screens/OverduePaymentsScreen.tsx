import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, ScrollView, ActivityIndicator, Platform, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_BASE_URL } from '../api/config';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

type RootStackParamList = {
  Dashboard: undefined;
  RecordPaymentScreen: { loan: any };
  OverduePayments: undefined;
  Assistant: undefined;
};

const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');
const avatarDefault = require('../assets/icons/avatar.png');
const backIcon = require('../assets/icons/back.png');
const setting = require('../assets/icons/setting.png');
const printer = require('../assets/icons/printer.png');

const weekdays = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

function getWeekDates(date = new Date()) {
  const week = [];
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - ((day + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

const OverduePaymentsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState(getWeekDates(new Date()));
  const [payments, setPayments] = useState<any[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, overdue, paid
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const { theme } = useTheme();

  useEffect(() => {
    setWeekDates(getWeekDates(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    fetchPayments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedFilter, selectedPaymentMethod]);

  useEffect(() => {
    let filtered = Array.isArray(payments) ? payments : [];
    
    // Filtro por búsqueda
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(payment =>
        (payment.client_name || '').toLowerCase().includes(s) ||
        (payment.method || '').toLowerCase().includes(s) ||
        (payment.loan_id?.toString() || '').includes(s)
      );
    }
    
    setFilteredPayments(filtered);
  }, [payments, search]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/payments`;
      const params = new URLSearchParams();
      
      // Agregar filtros según selección
      if (selectedFilter === 'overdue') {
        // Para pagos en mora, usar endpoint específico
        url = `${API_BASE_URL}/api/payments/overdue`;
      } else if (selectedFilter === 'paid') {
        // Para pagos realizados, filtrar por método
        if (selectedPaymentMethod !== 'all') {
          params.append('method', selectedPaymentMethod);
        }
      } else {
        // Para todos los pagos, aplicar filtro de método si está seleccionado
        if (selectedPaymentMethod !== 'all') {
          params.append('method', selectedPaymentMethod);
        }
      }
      
      if (params.toString() && !url.includes('overdue')) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setPayments(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      Alert.alert(t('overduePayments.loadingError'), errorMsg);
      setPayments([]);
      console.error('Error cargando pagos:', err);
    }
    setLoading(false);
  };

  const handleCancelPayment = async (payment: any) => {
    Alert.alert(
      t('overduePayments.cancelPayment'),
      t('overduePayments.cancelConfirmation', { 
        amount: parseFloat(payment.amount_paid || payment.amount_due || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 }) 
      }),
      [
        { text: t('common.no'), style: 'cancel' },
        { 
          text: t('overduePayments.yesCancel'), 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/payments/${payment.id}/cancel`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  reason: t('overduePayments.cancelReason')
                })
              });
              
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
              }
              
              const result = await response.json();
              Alert.alert(t('overduePayments.paymentCancelled'), result.message);
              
              // Recargar la lista de pagos
              fetchPayments();
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              Alert.alert(t('common.error'), t('overduePayments.cancelError', { error: errorMsg }));
              console.error('Error cancelando pago:', error);
            }
          }
        }
      ]
    );
  };

  const handlePrintReceipt = async (payment: any) => {
    Alert.alert(
      t('overduePayments.generateReceipt'),
      t('overduePayments.receiptConfirmation', { 
        amount: parseFloat(payment.amount_paid || payment.amount_due || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 }) 
      }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('overduePayments.generate'), 
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/payments/${payment.id}/receipt`);
              
              if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errorText}`);
              }
              
              const result = await response.json();
              
              Alert.alert(
                t('overduePayments.receiptGenerated'), 
                t('overduePayments.receiptDetails', {
                  receiptNumber: result.receipt.receipt_number,
                  clientName: result.receipt.client_name,
                  amount: parseFloat(result.receipt.amount_paid).toLocaleString('es-DO', { minimumFractionDigits: 2 }),
                  method: result.receipt.method
                }),
                [
                  { text: t('common.ok') },
                  { 
                    text: t('overduePayments.downloadPDF'), 
                    onPress: () => {
                      // Aquí se podría implementar la descarga del PDF
                      Alert.alert(t('overduePayments.download'), t('overduePayments.downloadPending'));
                    }
                  }
                ]
              );
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              Alert.alert(t('common.error'), t('overduePayments.receiptError', { error: errorMsg }));
              console.error('Error generando recibo:', error);
            }
          }
        }
      ]
    );
  };

  const renderPayment = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Image source={avatarDefault} style={styles.avatar} />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: theme.primary }]}>{item.client_name || t('overduePayments.client')}</Text>
        <Text style={[styles.cardField, { color: theme.text }]}>{t('overduePayments.loanNumber')}: <Text style={[styles.cardValue, { color: theme.text }]}>{item.loan_id || '-'}</Text></Text>
        <Text style={[styles.cardField, { color: theme.text }]}>{t('overduePayments.amount')}: <Text style={[styles.cardValue, { color: theme.text }]}>RD$ {parseFloat(item.amount_paid || item.amount_due || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text></Text>
        <Text style={[styles.cardField, { color: theme.text }]}>{t('overduePayments.date')}: <Text style={[styles.cardValue, { color: theme.text }]}>{item.payment_date || item.due_date || '-'}</Text></Text>
        <Text style={[styles.cardField, { color: theme.text }]}>{t('overduePayments.method')}: <Text style={[styles.cardValue, { color: theme.text }]}>{item.method || '-'}</Text></Text>
        <Text style={[styles.cardField, { color: theme.text }]}>{t('overduePayments.status')}: <Text style={[styles.cardValue, { color: item.status === 'vencida' ? theme.accent : theme.primary }]}>{item.status || '-'}</Text></Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton, { backgroundColor: theme.accent }]} 
          onPress={() => handleCancelPayment(item)}
        >
          <Text style={[styles.cancelButtonText, { color: theme.card } ]}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.printButton, { backgroundColor: theme.secondary }]} 
          onPress={() => handlePrintReceipt(item)}
        >
          <Image source={printer} style={[styles.printButtonIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backIcon} style={[styles.backIcon, { tintColor: theme.muted }]} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('overduePayments.title')}</Text>
        <View style={{ width: 28 }} />
      </View>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{t('overduePayments.subtitle')}</Text>
      
      {/* Buscador */}
      <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={t('overduePayments.searchPlaceholder')}
          placeholderTextColor={theme.muted}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilterModal(true)}>
          <Image source={setting} style={[styles.filterIconImg, { tintColor: theme.primary }]} />
        </TouchableOpacity>
      </View>
      
      {/* Calendario horizontal */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendarRow}>
        {weekDates.map((date, idx) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          return (
            <TouchableOpacity
              key={idx}
              style={[styles.calendarBubble, { backgroundColor: isSelected ? theme.primary : theme.card }]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.calendarDay, { color: isSelected ? theme.card : theme.text }]}>{date.getDate()}</Text>
              <Text style={[styles.calendarWeek, { color: isSelected ? theme.card : theme.muted }]}>{weekdays[date.getDay()]}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      {/* Date picker opcional */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_, date) => {
            setShowDatePicker(false);
            if (date) setSelectedDate(date);
          }}
        />
      )}
      
      {/* Lista de pagos */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filteredPayments}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={renderPayment}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.muted }]}>{t('overduePayments.noPayments')}</Text>
              <Text style={[styles.emptySubtext, { color: theme.muted }]}>{t('overduePayments.tryFilters')}</Text>
            </View>
          }
        />
      )}
      
      {/* Modal de filtros */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('overduePayments.filters')}</Text>
            
            <Text style={[styles.filterLabel, { color: theme.text }]}>{t('overduePayments.paymentStatus')}:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, { backgroundColor: selectedFilter === 'all' ? theme.primary : theme.card, borderColor: selectedFilter === 'all' ? theme.primary : theme.border }]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={[styles.filterOptionText, { color: selectedFilter === 'all' ? theme.card : theme.text, fontWeight: selectedFilter === 'all' ? 'bold' : 'normal' }]}>{t('overduePayments.all')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, { backgroundColor: selectedFilter === 'overdue' ? theme.accent : theme.card, borderColor: selectedFilter === 'overdue' ? theme.accent : theme.border }]}
                onPress={() => setSelectedFilter('overdue')}
              >
                <Text style={[styles.filterOptionText, { color: selectedFilter === 'overdue' ? theme.card : theme.text, fontWeight: selectedFilter === 'overdue' ? 'bold' : 'normal' }]}>{t('overduePayments.overdue')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, { backgroundColor: selectedFilter === 'paid' ? theme.secondary : theme.card, borderColor: selectedFilter === 'paid' ? theme.secondary : theme.border }]}
                onPress={() => setSelectedFilter('paid')}
              >
                <Text style={[styles.filterOptionText, { color: selectedFilter === 'paid' ? theme.card : theme.text, fontWeight: selectedFilter === 'paid' ? 'bold' : 'normal' }]}>{t('overduePayments.paid')}</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.filterLabel, { color: theme.text }]}>{t('overduePayments.paymentMethod')}:</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, { backgroundColor: selectedPaymentMethod === 'all' ? theme.primary : theme.card, borderColor: selectedPaymentMethod === 'all' ? theme.primary : theme.border }]}
                onPress={() => setSelectedPaymentMethod('all')}
              >
                <Text style={[styles.filterOptionText, { color: selectedPaymentMethod === 'all' ? theme.card : theme.text, fontWeight: selectedPaymentMethod === 'all' ? 'bold' : 'normal' }]}>{t('overduePayments.all')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, { backgroundColor: selectedPaymentMethod === 'efectivo' ? theme.primary : theme.card, borderColor: selectedPaymentMethod === 'efectivo' ? theme.primary : theme.border }]}
                onPress={() => setSelectedPaymentMethod('efectivo')}
              >
                <Text style={[styles.filterOptionText, { color: selectedPaymentMethod === 'efectivo' ? theme.card : theme.text, fontWeight: selectedPaymentMethod === 'efectivo' ? 'bold' : 'normal' }]}>{t('overduePayments.cash')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterOption, { backgroundColor: selectedPaymentMethod === 'transferencia' ? theme.primary : theme.card, borderColor: selectedPaymentMethod === 'transferencia' ? theme.primary : theme.border }]}
                onPress={() => setSelectedPaymentMethod('transferencia')}
              >
                <Text style={[styles.filterOptionText, { color: selectedPaymentMethod === 'transferencia' ? theme.card : theme.text, fontWeight: selectedPaymentMethod === 'transferencia' ? 'bold' : 'normal' }]}>{t('overduePayments.transfer')}</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.modalCloseButton, { backgroundColor: theme.primary }]} 
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={[styles.modalCloseButtonText, { color: theme.card }]}>{t('overduePayments.applyFilters')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Assistant')}>
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
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#6B7280',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'center',
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
  filterButton: {
    marginLeft: 8,
  },
  filterIcon: {
    fontSize: 20,
    color: '#10B981',
  },
  filterIconImg: {
    width: 24,
    height: 24,
    tintColor: '#10B981',
  },
  calendarRow: {
    flexDirection: 'row',
    marginHorizontal: 8,
    marginBottom: 8,
    marginTop: 8,
  },
  calendarBubble: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    minWidth: 48,
  },
  calendarBubbleActive: {
    backgroundColor: '#10B981',
  },
  calendarDay: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  calendarDayActive: {
    color: '#fff',
  },
  calendarWeek: {
    fontSize: 12,
    color: '#6B7280',
  },
  calendarWeekActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1CC88A',
    marginBottom: 4,
  },
  cardField: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 2,
  },
  cardValue: {
    fontWeight: 'bold',
    color: '#222',
  },
  actionButtons: {
    flexDirection: 'column',
    gap: 8,
  },
  actionButton: {
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  printButton: {
    backgroundColor: '#ECFDF5',
  },
  printButtonText: {
    fontSize: 16,
  },
  printButtonIcon: {
    width: 20,
    height: 20,
    tintColor: '#10B981',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 350,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1F2937',
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    marginTop: 16,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterOptionActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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

export default OverduePaymentsScreen; 