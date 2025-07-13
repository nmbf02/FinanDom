import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../api/config';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

const backIcon = require('../assets/icons/back.png');
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');
const checkmark = require('../assets/icons/checkmark.png');

const CommunicationHistoryScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { theme, mode } = useTheme();
  const [filter, setFilter] = useState<'reminder' | 'thanks' | 'all'>('all');
  const [search, setSearch] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, search]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const params = [];
      if (filter && filter !== 'all') params.push(`type=${filter}`);
      if (search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      const url = `${API_BASE_URL}/api/communications-history${params.length ? '?' + params.join('&') : ''}`;
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      setHistory([]);
      Alert.alert(t('communicationHistory.loadingError'), errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: mode === 'light' ? '#fff' : theme.card }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.clientName, { color: theme.text }]}>{item.client_name}</Text>
        <Text style={[styles.dateText, { color: theme.muted }]}>{item.sent_at ? item.sent_at.replace('T', ' ').slice(0, 16) : ''}</Text>
        <Text style={[styles.methodText, { color: theme.muted }]}>{t('communicationHistory.medium')}: {item.method === 'email' ? t('communicationHistory.email') : item.method === 'whatsapp' ? t('communicationHistory.whatsapp') : item.method}</Text>
        <Text style={[styles.messageText, { color: theme.text }]}>{item.message}</Text>
      </View>
      <Image source={checkmark} style={[styles.checkIcon, { tintColor: theme.primary }]} />
    </View>
  );

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backIcon} style={[styles.backIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('communicationHistory.title')}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={[styles.searchInput, { backgroundColor: theme.card, color: theme.text }]}
          placeholder={t('communicationHistory.search')}
          placeholderTextColor={theme.muted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filtros */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.card }, filter === 'reminder' && { backgroundColor: theme.primary }]}
          onPress={() => setFilter('reminder')}
        >
          <Text style={[styles.filterText, { color: filter === 'reminder' ? '#fff' : theme.muted }]}>{t('communicationHistory.reminder')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: theme.card }, filter === 'thanks' && { backgroundColor: theme.accent || theme.primary }]}
          onPress={() => setFilter('thanks')}
        >
          <Text style={[styles.filterText, { color: filter === 'thanks' ? '#fff' : theme.muted }]}>{t('communicationHistory.thanks')}</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de historial */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.muted }]}>{t('communicationHistory.loadingHistory')}</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.muted }]}>{t('communicationHistory.noCommunications')}</Text>
            </View>
          }
        />
      )}

      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Dashboard')}>
          <Image source={home} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Assistant')}>
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
    paddingTop: 40,
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
    tintColor: '#10B981',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  searchBox: {
    marginHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 4,
  },
  filterText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterButtonActive: {
    backgroundColor: '#10B981',
  },
  filterButtonActiveBlue: {
    backgroundColor: '#A7C7E7',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16, // antes 12
    padding: 20, // antes 16
    marginHorizontal: 16,
    marginBottom: 18, // antes 14
    flexDirection: 'row',
    alignItems: 'flex-start', // antes 'center'
    shadowColor: '#000',
    shadowOpacity: 0.07, // antes 0.05
    shadowRadius: 8, // antes 4
    elevation: 3, // antes 2
    minHeight: 100,
  },
  clientName: {
    fontWeight: 'bold',
    fontSize: 17, // antes 16
    color: '#1F2937',
    marginBottom: 8, // antes 4
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6, // antes 2
  },
  methodText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8, // nuevo
  },
  messageText: {
    fontSize: 14, // antes 13
    color: '#374151',
    marginTop: 8, // antes 4
    lineHeight: 20,
  },
  checkIcon: {
    width: 26, // antes 24
    height: 26, // antes 24
    tintColor: '#10B981',
    marginLeft: 14, // antes 8
    marginTop: 8, // nuevo
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 64,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 64,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
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

export default CommunicationHistoryScreen; 