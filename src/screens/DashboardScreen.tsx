// src/screens/DashboardScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useFocusEffect, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../api/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

// ICONOS
const avatar = require('../assets/icons/avatar.png');
const user = require('../assets/icons/user-setting.png');
const bell = require('../assets/icons/bell.png');
const setting = require('../assets/icons/setting.png');
const wallet = require('../assets/icons/wallet.png');
const barChart = require('../assets/icons/bar-chart.png');
const dollarCross = require('../assets/icons/dollar-cross.png');
const pieChart = require('../assets/icons/pie-chart.png');
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const users = require('../assets/icons/user-group.png');
const loan = require('../assets/icons/hand-coin.png');
const payment = require('../assets/icons/installment.png');
const overdue = require('../assets/icons/warning-dollar.png');

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
  CommunicationHistory: undefined;
};

type AgendaItem = {
  installment_id: number;
  due_date: string;
  client_name: string;
  status: string;
  amount_due: number;
  loan_id: number;
};

const DashboardScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { t } = useTranslation();
  const [userName, setUserName] = useState(t('dashboard.defaultUserName'));
  const [greeting, setGreeting] = useState(t('dashboard.greeting.morning'));
  const [metrics, setMetrics] = useState({
    total_prestado: 0,
    total_recuperado: 0,
    total_mora: 0,
    prestamos_activos: 0,
    prestamos_en_mora: 0,
    clientes_activos: 0,
  });
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [agendaView, setAgendaView] = useState('semana');
  const [agendaDate, setAgendaDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState<false | 'start' | 'end' | true>(false);
  const [customRange, setCustomRange] = useState<{start: Date|null, end: Date|null}>({start: null, end: null});
  const [currency, setCurrency] = useState('DOP');
  const { theme } = useTheme();

  const loadUserData = React.useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const userDataParsed = JSON.parse(userData);
        setUserName(userDataParsed.name || t('dashboard.defaultUserName'));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }, [t]);

  const updateGreeting = React.useCallback(() => {
    const hour = new Date().getHours();
    let greetingText = t('dashboard.greeting.morning');
    
    if (hour >= 12 && hour < 18) {
      greetingText = t('dashboard.greeting.afternoon');
    } else if (hour >= 18 || hour < 6) {
      greetingText = t('dashboard.greeting.evening');
    }
    
    setGreeting(greetingText);
  }, [t]);

  useEffect(() => {
    loadUserData();
    updateGreeting();
    fetchMetrics();
    (async () => {
      const saved = await AsyncStorage.getItem('currency');
      if (saved) setCurrency(saved);
    })();
  }, [loadUserData, updateGreeting]);

  useEffect(() => {
    fetchAgenda();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agendaView, agendaDate, customRange]);

  useFocusEffect(
    React.useCallback(() => {
      fetchMetrics();
    }, [])
  );

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard-metrics`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setMetrics({
        total_prestado: 0,
        total_recuperado: 0,
        total_mora: 0,
        prestamos_activos: 0,
        prestamos_en_mora: 0,
        clientes_activos: 0,
      });
    }
  };

  const fetchAgenda = async () => {
    let params = '';
    if (agendaView === 'dia') {
      params = `?view=dia&start_date=${formatDate(agendaDate)}`;
    } else if (agendaView === 'semana') {
      params = `?view=semana&start_date=${formatDate(agendaDate)}`;
    } else if (agendaView === 'mes') {
      params = `?view=mes&start_date=${formatDate(agendaDate)}`;
    } else if (agendaView === 'ano' || agendaView === 'año') {
      params = `?view=ano&start_date=${formatDate(agendaDate)}`;
    } else if (agendaView === 'personalizado' && customRange.start && customRange.end) {
      params = `?start_date=${formatDate(customRange.start)}&end_date=${formatDate(customRange.end)}`;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/agenda${params}`);
      const data = await response.json();
      setAgenda(data);
    } catch {
      setAgenda([]);
    }
  };

  function formatDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Utilidad para mostrar símbolo/código
  const getCurrencySymbol = (code: string) => {
    if (code === 'USD') return '$';
    if (code === 'EUR') return '€';
    if (code === 'DOP') return 'RD$';
    return code;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
            <Image source={avatar} style={styles.avatar} />
            <View style={styles.userInfoText}>
              <Text style={[styles.welcomeText, { color: theme.muted }]}>{greeting}!</Text>
              <Text style={[styles.userName, { color: theme.text }]}>{userName}</Text>
            </View>
        </View>
        <View style={styles.rightIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('CommunicationHistory')}>
            <Image source={bell} style={[styles.icon, { tintColor: theme.primary }]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image source={setting} style={[styles.icon, { tintColor: theme.primary }]} />
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContent}>
        {/* Selector de rango para la agenda */}
        <View style={styles.rangeSelectorContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rangeSelector}>
            {['dia', 'semana', 'mes', 'ano', 'personalizado'].map((v) => (
              <TouchableOpacity
                key={v}
                style={[
                  styles.rangeButton,
                  agendaView === v && { backgroundColor: theme.primary }
                ]}
                onPress={() => setAgendaView(v)}
              >
                <Text style={[
                  styles.rangeButtonText,
                  agendaView === v && { color: '#fff' }
                ]}>
                  {v === 'dia' ? t('dashboard.range.day') : 
                   v === 'semana' ? t('dashboard.range.week') : 
                   v === 'mes' ? t('dashboard.range.month') : 
                   v === 'ano' ? t('dashboard.range.year') : 
                   t('dashboard.range.custom')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {/* Fecha seleccionada */}
          <View style={styles.dateSelectorContainer}>
            {(agendaView === 'dia' || agendaView === 'semana' || agendaView === 'mes' || agendaView === 'ano') && (
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.primary }]}> 
                <Text style={[styles.dateButtonText, { color: theme.primary } ]}>📅 {formatDate(agendaDate)}</Text>
              </TouchableOpacity>
            )}
            {agendaView === 'personalizado' && (
              <View style={styles.customRangeContainer}>
                <TouchableOpacity onPress={() => setShowDatePicker('start')} style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.primary }]}> 
                  <Text style={[styles.dateButtonText, { color: theme.primary } ]}>{t('dashboard.dateRange.start')}: {customRange.start ? formatDate(customRange.start) : t('dashboard.dateRange.choose')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowDatePicker('end')} style={[styles.dateButton, { backgroundColor: theme.card, borderColor: theme.primary }]}> 
                  <Text style={[styles.dateButtonText, { color: theme.primary } ]}>{t('dashboard.dateRange.end')}: {customRange.end ? formatDate(customRange.end) : t('dashboard.dateRange.choose')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
        {/* DateTimePicker */}
        {showDatePicker !== false && (
          <DateTimePicker
            value={agendaView === 'personalizado' && showDatePicker === 'end' && customRange.end ? customRange.end : agendaDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                if (agendaView === 'personalizado' && showDatePicker === 'start') {
                  setCustomRange((prev) => ({ ...prev, start: selectedDate }));
                } else if (agendaView === 'personalizado' && showDatePicker === 'end') {
                  setCustomRange((prev) => ({ ...prev, end: selectedDate }));
                } else {
                  setAgendaDate(selectedDate);
                }
              }
            }}
          />
        )}
        {/* AGENDA DEL DÍA */}
        <View style={[styles.agendaContainer, { backgroundColor: theme.card }]}> 
          <Text style={[styles.agendaDayLabel, { color: theme.primary }]}> 
            {agendaView === 'dia' ? t('dashboard.agenda.dayPayments') : 
             agendaView === 'semana' ? t('dashboard.agenda.weekPayments') : 
             agendaView === 'mes' ? t('dashboard.agenda.monthPayments') : 
             agendaView === 'ano' ? t('dashboard.agenda.yearPayments') : 
             t('dashboard.agenda.customPayments')}
          </Text>
          {agenda.length === 0 ? (
            <Text style={[styles.emptyAgendaText, { color: theme.muted }]}>{t('dashboard.agenda.noPayments')}</Text>
          ) : (
            agenda.map((item: AgendaItem) => (
              <View key={item.installment_id} style={styles.agendaItem}>
                <Text style={[styles.agendaTime, { color: theme.muted }]}>{item.due_date}</Text>
                <View style={[styles.agendaDetails, { backgroundColor: theme.background }]}> 
                  <View style={styles.agendaHeader}>
                    <Text style={[styles.agendaTitle, { color: theme.text }]}>{item.client_name}</Text>
                    <Text style={[styles.agendaCheck, { color: theme.primary }]}>{item.status === 'pendiente' ? '⏳' : item.status === 'vencida' ? '⚠️' : '✔️'}</Text>
                  </View>
                  <Text style={[styles.agendaDesc, { color: theme.muted }]}>{t('dashboard.agenda.amount')}: RD$ {Number(item.amount_due).toLocaleString('es-DO', {minimumFractionDigits: 2})}</Text>
                  <Text style={[styles.agendaDesc, { color: theme.muted }]}>{t('dashboard.agenda.loan')} #{item.loan_id}</Text>
                </View>
              </View>
            ))
          )}
        </View>
        {/* TABS (NO MODIFICAR) */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            <TouchableOpacity onPress={() => navigation.navigate('Client', {})}>
              <Tab icon={users} label={t('dashboard.tabs.clients')} active />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('CreateLoan')}>
              <Tab icon={loan} label={t('dashboard.tabs.loans')} active />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('OverduePayments')}>
              <Tab icon={overdue} label={t('dashboard.tabs.payments')} active />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('LoanList')}>
              <Tab icon={payment} label={t('dashboard.tabs.installments')} active />
            </TouchableOpacity>
          </ScrollView>
        </View>
        {/* MÉTRICAS */}
        <View style={styles.statsContainer}>
          <StatCard icon={wallet} title={t('dashboard.metrics.totalLent')} amount={`${getCurrencySymbol(currency)} ${Number(metrics.total_prestado).toLocaleString('es-DO', {minimumFractionDigits: 2})}`} theme={theme} />
          <StatCard icon={barChart} title={t('dashboard.metrics.totalRecovered')} amount={`${getCurrencySymbol(currency)} ${Number(metrics.total_recuperado).toLocaleString('es-DO', {minimumFractionDigits: 2})}`} theme={theme} />
          <StatCard icon={dollarCross} title={t('dashboard.metrics.totalOverdue')} amount={`${getCurrencySymbol(currency)} ${Number(metrics.total_mora).toLocaleString('es-DO', {minimumFractionDigits: 2})}`} badge={metrics.prestamos_en_mora > 0 ? metrics.prestamos_en_mora.toString() : undefined} theme={theme} />
          <StatCard icon={pieChart} title={t('dashboard.metrics.activeLoans')} amount={metrics.prestamos_activos.toString()} theme={theme} />
          <StatCard icon={users} title={t('dashboard.metrics.activeClients')} amount={metrics.clientes_activos.toString()} theme={theme} />
        </View>
      </ScrollView>
      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}> 
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={[styles.navIcon, route.name === 'Dashboard' && { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Assistant')}>
          <Image source={chat} style={[styles.navIcon, route.name === 'Assistant' && { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={calendar} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={user} style={[styles.navIcon, route.name === 'Profile' && { tintColor: theme.primary }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Tab = ({ icon, label, active }: any) => (
  <View style={[styles.tab, active && styles.tabActive]}>
    <Image source={icon} style={styles.tabIcon} />
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </View>
);

// StatCard adaptado al theme
const StatCard = ({ icon, title, amount, badge, theme }: any) => (
  <View style={[styles.statCard, { backgroundColor: theme.card }]}> 
    <View style={[styles.statIconContainer, { backgroundColor: theme.background }]}> 
      <Image source={icon} style={[styles.statIcon, { tintColor: theme.primary }]} />
    </View>
    <View style={styles.statTextContainer}>
      <Text style={[styles.statTitle, { color: theme.primary }]}>{title}</Text>
      <Text style={[styles.statAmount, { color: theme.text }]}>{amount}</Text>
    </View>
    {badge && (
      <View style={[styles.statBadge, { backgroundColor: theme.background }]}> 
        <Text style={[styles.statBadgeIcon, { color: theme.primary }]}>★</Text>
        <Text style={[styles.statBadgeText, { color: theme.primary }]}>{badge}</Text>
      </View>
    )}
  </View>
);

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: 12,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#999',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  calendarRow: {
    marginVertical: 16,
  },
  calendarItem: {
    alignItems: 'center',
    padding: 10,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    width: 70,
  },
  calendarItemActive: {
    backgroundColor: '#10B981',
  },
  calendarDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  calendarDay: {
    fontSize: 12,
    color: '#6B7280',
  },
  agendaContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  agendaDayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
    marginBottom: 12,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  agendaTime: {
    width: 50,
    fontSize: 14,
    color: '#6B7280',
  },
  agendaDetails: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agendaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  agendaCheck: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  agendaDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  agendaLine: {
    flex: 1,
    height: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    marginTop: 12,
  },
  tabsContainer: {
    marginTop: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 16,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#ECFDF5',
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  statsContainer: {
    marginTop: 16,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    position: 'relative',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  statTextContainer: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  statAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 2,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 12,
    top: 20,
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statBadgeIcon: {
    color: '#10B981',
    marginRight: 4,
    fontSize: 14,
  },
  statBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
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
  dateRow: {
    marginBottom: 12,
    marginTop: 12,
  },
  dateItem: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  dateItemActive: {
    backgroundColor: '#10B981',
  },
  dateText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  dateTextActive: {
    color: '#fff',
  },  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userInfoText: {
    marginLeft: 10,
  },
  scrollContent: {
    flex: 1,
  },
  rangeSelectorContainer: {
    marginBottom: 16,
  },
  rangeSelector: {
    marginBottom: 8,
  },
  rangeButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  rangeButtonActive: {
    backgroundColor: '#10B981',
  },
  rangeButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 12,
  },
  rangeButtonTextActive: {
    color: '#fff',
  },
  dateSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  dateButtonText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 12,
  },
  customRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  emptyAgendaText: {
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 12,
  },
});
