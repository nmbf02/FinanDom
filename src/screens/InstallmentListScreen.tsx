import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, ScrollView, ActivityIndicator, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_BASE_URL } from '../api/config';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

type RootStackParamList = {
  Dashboard: undefined;
  // ...other screens
};

const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');
const avatarDefault = require('../assets/icons/avatar.png');

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

const InstallmentListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState(getWeekDates(new Date()));
  const [installments, setInstallments] = useState<any[]>([]);
  const [filteredInstallments, setFilteredInstallments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setWeekDates(getWeekDates(selectedDate));
  }, [selectedDate]);

  useEffect(() => {
    fetchInstallments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  useEffect(() => {
    let filtered = Array.isArray(installments) ? installments : [];
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      filtered = filtered.filter(inst =>
        (inst.client_name || '').toLowerCase().includes(s) ||
        (inst.status || '').toLowerCase().includes(s)
      );
    }
    setFilteredInstallments(filtered);
  }, [installments, search]);

  const fetchInstallments = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().slice(0, 10);
      const res = await fetch(`${API_BASE_URL}/api/installments?date=${dateStr}`);
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      const data = await res.json();
      setInstallments(Array.isArray(data) ? data : data.installments || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      Alert.alert(t('installmentList.loadingError'), errorMsg);
      setInstallments([]);
      console.error('Error cargando cuotas:', err);
    }
    setLoading(false);
  };

  const renderInstallment = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: theme.card }]}>
      <Image source={avatarDefault} style={styles.avatar} />
      <View style={styles.cardInfo}>
        <Text style={[styles.cardName, { color: theme.primary }]}>{item.client_name || t('installmentList.client')}</Text>
        <Text style={[styles.cardField, { color: theme.text }]}>{t('installmentList.installmentNumber')}: <Text style={[styles.cardValue, { color: theme.text }]}>{item.installment_number || '-'}</Text></Text>
        <Text style={[styles.cardField, { color: theme.text }]}>{t('installmentList.amount')}: <Text style={[styles.cardValue, { color: theme.text }]}>RD$ {parseFloat(item.amount_due).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text></Text>
        <Text style={[styles.cardField, { color: theme.text }]}>{t('installmentList.dueDate')}: <Text style={[styles.cardValue, { color: theme.text }]}>{item.due_date || '-'}</Text></Text>
        <Text style={[styles.cardField, { color: theme.text }]}>{t('installmentList.status')}: <Text style={[styles.cardValue, { color: theme.text }]}>{item.status || '-'}</Text></Text>
      </View>
      <TouchableOpacity style={[styles.plusButton, { backgroundColor: theme.secondary }]} onPress={() => {/* acción para ver detalles o registrar pago */}}>
        <Text style={[styles.plusText, { color: theme.primary }]}>+</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backArrow, { color: theme.primary }]}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('installmentList.title')}</Text>
        <View style={{ width: 24 }} />
      </View>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{t('installmentList.subtitle')}</Text>
      {/* Buscador */}
      <View style={[styles.searchBox, { backgroundColor: theme.card }]}>
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={t('installmentList.searchPlaceholder')}
          placeholderTextColor={theme.muted}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.filterButton}>
          <Text style={[styles.filterIcon, { color: theme.primary }]}>⚙️</Text>
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
      {/* Lista de cuotas */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 32 }} />
      ) : (
        <FlatList
          data={filteredInstallments}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={renderInstallment}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
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
  backArrow: {
    fontSize: 28,
    color: '#10B981',
    fontWeight: 'bold',
    marginRight: 8,
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
    marginBottom: 8,
    textAlign: 'left',
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
  plusButton: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  plusText: {
    color: '#10B981',
    fontSize: 22,
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

export default InstallmentListScreen; 