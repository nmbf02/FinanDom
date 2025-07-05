import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { API_BASE_URL } from '../api/config';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Iconos (debes agregar los archivos reales en src/assets/icons/)
const menuIcon = require('../assets/icons/menu.png');
const editIcon = require('../assets/icons/edit.png');
const cancelIcon = require('../assets/icons/cancel.png');
const likeIcon = require('../assets/icons/like.png');
const avatarDefault = require('../assets/icons/avatar.png');
const checkIcon = require('../assets/icons/checkmark.png');

const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');

// Tipado de navegación
type RootStackParamList = {
  Client: { clientId?: number };
  ClientList: undefined;
  Dashboard: undefined;
  CreateLoan: undefined;
};

interface Client {
  id: number;
  name: string;
  identification: string;
  phone: string;
  email: string;
  address: string;
  is_active?: number;
  avatar?: string;
  active_loans?: number;
}

const ClientListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'activo' | 'inactivo'>('activo');
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const filterClients = () => {
      let filtered = Array.isArray(clients) ? clients : [];
      if (filter === 'activo') {
        filtered = filtered.filter(c => c.is_active !== 0);
      } else {
        filtered = filtered.filter(c => c.is_active === 0);
      }
      if (search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(c =>
          c.name.toLowerCase().includes(s) ||
          c.identification.toLowerCase().includes(s) ||
          c.phone.toLowerCase().includes(s)
        );
      }
      setFilteredClients(filtered);
    };
    filterClients();
  }, [clients, search, filter]);

  const fetchClients = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/clients`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setClients(data);
      } else {
        setClients([]);
      }
    } catch (err) {
      setClients([]);
    }
  };

  const renderClient = ({ item }: { item: Client }) => (
    <View style={styles.clientCard}>
      <Image source={item.avatar ? { uri: item.avatar } : avatarDefault} style={styles.avatar} />
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <Text style={styles.clientDoc}>{item.identification || 'Sin documento'}</Text>
        <Text style={styles.clientPhone}>{item.phone || 'Sin teléfono'}</Text>
        <View style={styles.loansRow}>
          <Text style={styles.activeLoans}>Préstamos activos</Text>
          <Image source={checkIcon} style={styles.starIcon} />
          <Text style={styles.activeLoansNum}>{item.active_loans ?? 0}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => navigation.navigate('Client', { clientId: item.id })}>
          <Image source={editIcon} style={styles.actionIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={cancelIcon} style={styles.actionIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={likeIcon} style={styles.actionIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Header con menú hamburguesa y título */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.navigate('Client', {})}>
          <Image source={menuIcon} style={styles.menuIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Lista de Clientes</Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filtros */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'activo' && styles.filterBtnActive]}
          onPress={() => setFilter('activo')}
        >
          <Text style={[styles.filterText, filter === 'activo' && styles.filterTextActive]}>Activos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'inactivo' && styles.filterBtnInactive]}
          onPress={() => setFilter('inactivo')}
        >
          <Text style={[styles.filterText, filter === 'inactivo' && styles.filterTextInactive]}>Inactivos</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de clientes */}
      <FlatList
        data={filteredClients}
        keyExtractor={item => item.id.toString()}
        renderItem={renderClient}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Navbar */}
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
    marginBottom: 0,
  },
  menuIcon: {
    width: 28,
    height: 28,
    marginRight: 12,
    tintColor: '#6B7280',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'left',
    marginBottom: 20,
  },
  searchBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    alignItems: 'center',
  },
  filterBtnActive: {
    backgroundColor: '#1CC88A',
  },
  filterBtnInactive: {
    backgroundColor: '#A7C7E7',
  },
  filterText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  filterTextActive: {
    color: '#fff',
  },
  filterTextInactive: {
    color: '#fff',
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginRight: 14,
    backgroundColor: '#E5E7EB',
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 2,
  },
  clientDoc: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  clientPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  loansRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  activeLoans: {
    fontSize: 13,
    color: '#10B981',
    marginRight: 4,
  },
  starIcon: {
    width: 18,
    height: 18,
    marginRight: 2,
    tintColor: '#10B981',
  },
  activeLoansNum: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: 10,
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginBottom: 8,
    tintColor: '#1CC88A',
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

export default ClientListScreen; 