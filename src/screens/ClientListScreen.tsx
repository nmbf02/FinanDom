import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, FlatList, Alert } from 'react-native';
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
  document_type_id?: number;
  document_type_name?: string;
  phone: string;
  email: string;
  address: string;
  photo_url?: string;
  is_active?: number;
  is_favorite?: boolean;
  avatar?: string;
  active_loans?: number;
}

const ClientListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    activo: true,
    inactivo: false,
    favoritos: false
  });
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const filterClients = () => {
      let filtered = Array.isArray(clients) ? clients : [];
      
      // Aplicar filtros de estado
      const statusFilters: number[] = [];
      if (filters.activo) statusFilters.push(1);
      if (filters.inactivo) statusFilters.push(0);
      
      if (statusFilters.length > 0) {
        filtered = filtered.filter(c => statusFilters.includes(c.is_active || 0));
      }
      
      // Aplicar filtro de favoritos
      if (filters.favoritos) {
        filtered = filtered.filter(c => c.is_favorite === true);
      }
      
      // Aplicar búsqueda
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
  }, [clients, search, filters]);

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

  const handleCancelClient = async (client: Client) => {
    // Mostrar confirmación
    Alert.alert(
      'Cancelar Cliente',
      `¿Estás seguro de que quieres cancelar a ${client.name}?`,
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Sí, Cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/api/clients/${client.id}`, {
                method: 'DELETE',
              });

              const data = await response.json();

              if (response.ok) {
                Alert.alert('Éxito', 'Cliente cancelado correctamente.');
                // Recargar la lista de clientes
                fetchClients();
              } else {
                if (response.status === 400 && data.active_loans > 0) {
                  Alert.alert(
                    'No se puede cancelar',
                    `No se puede cancelar el cliente porque tiene ${data.active_loans} préstamo(s) activo(s). Debe liquidar todos los préstamos antes de cancelar al cliente.`
                  );
                } else {
                  Alert.alert('Error', data.message || 'No se pudo cancelar el cliente.');
                }
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo conectar con el servidor.');
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (client: Client) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/clients/${client.id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_favorite: !client.is_favorite
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar el cliente localmente sin recargar toda la lista
        setClients(prevClients => 
          prevClients.map(c => 
            c.id === client.id 
              ? { ...c, is_favorite: data.is_favorite }
              : c
          )
        );
      } else {
        Alert.alert('Error', data.message || 'No se pudo actualizar el favorito.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  const renderClient = ({ item }: { item: Client }) => (
    <View style={styles.clientCard}>
      <View style={styles.avatarContainer}>
        <Image 
          source={item.photo_url ? { uri: item.photo_url } : avatarDefault} 
          style={styles.avatar} 
        />
        <View style={[
          styles.statusIndicator, 
          { backgroundColor: item.is_active ? '#10B981' : '#EF4444' }
        ]} />
      </View>
      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{item.name}</Text>
        <View style={styles.documentInfo}>
          <Text style={styles.documentType}>
            {item.document_type_name || 'Cédula'}
          </Text>
          <Text style={styles.clientDoc}>{item.identification || 'Sin documento'}</Text>
        </View>
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
        <TouchableOpacity 
          onPress={() => handleCancelClient(item)}
          disabled={(item.active_loans || 0) > 0}
        >
          <Image 
            source={cancelIcon} 
            style={[
              styles.actionIcon, 
              (item.active_loans || 0) > 0 && styles.actionIconDisabled
            ]} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleToggleFavorite(item)}>
          <Image 
            source={likeIcon} 
            style={[
              styles.actionIcon, 
              item.is_favorite === true && styles.actionIconFavorite
            ]} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Header con título y menú hamburguesa */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Lista de Clientes</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Client', {})}>
          <Image source={menuIcon} style={styles.menuIcon} />
        </TouchableOpacity>
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
          style={[styles.filterBtn, filters.activo && styles.filterBtnActive]}
          onPress={() => setFilters(prev => ({ ...prev, activo: !prev.activo }))}
        >
          <Text style={[styles.filterText, filters.activo && styles.filterTextActive]}>Activos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filters.inactivo && styles.filterBtnInactive]}
          onPress={() => setFilters(prev => ({ ...prev, inactivo: !prev.inactivo }))}
        >
          <Text style={[styles.filterText, filters.inactivo && styles.filterTextInactive]}>Inactivos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterBtn, filters.favoritos && styles.filterBtnFavorites]}
          onPress={() => setFilters(prev => ({ ...prev, favoritos: !prev.favoritos }))}
        >
          <Image 
            source={likeIcon} 
            style={[styles.filterIcon, filters.favoritos && styles.filterIconActive]} 
          />
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
    marginBottom: 20,
  },
  menuIcon: {
    width: 28,
    height: 28,
    tintColor: '#10B981',
    marginLeft: 0,
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
  actionIconDisabled: {
    tintColor: '#9CA3AF',
    opacity: 0.5,
  },
  actionIconFavorite: {
    tintColor: '#EF4444',
  },
  filterBtnFavorites: {
    backgroundColor: '#FEE2E2',
  },
  filterIcon: {
    width: 20,
    height: 20,
    tintColor: '#6B7280',
  },
  filterIconActive: {
    tintColor: '#EF4444',
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
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  documentType: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFF',
  },
});

export default ClientListScreen; 