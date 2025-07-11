import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Modal, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');
const backIcon = require('../assets/icons/back.png');
const setting = require('../assets/icons/setting.png');
const checkmark = require('../assets/icons/checkmark.png');
const cancel = require('../assets/icons/cancel.png');
const edit = require('../assets/icons/edit.png');
const avatarDefault = require('../assets/icons/avatar.png');

// Simulación de datos IA
const DUMMY_SUGGESTIONS = {
  reminder: [
    { id: 1, clientName: 'Olivia Turner, M.D.', text: 'Juan Pérez tiene 3 días de atraso. ¿Deseas enviarle un mensaje?' },
    { id: 2, clientName: 'Carlos Gómez', text: 'Ana López tiene 1 día de atraso. ¿Deseas enviarle un mensaje?' },
    { id: 3, clientName: 'María Fernández', text: 'Pedro Sánchez tiene 5 días de atraso. ¿Deseas enviarle un mensaje?' },
  ],
  thanks: [
    { id: 4, clientName: 'Olivia Turner, M.D.', text: 'Gracias Olivia Turner por tu pago puntual.' },
    { id: 5, clientName: 'Carlos Gómez', text: 'Gracias Carlos Gómez por tu pago puntual.' },
    { id: 6, clientName: 'Ana López', text: 'Gracias Ana López por tu pago puntual.' },
  ]
};

type Suggestion = {
  id: number;
  clientName: string;
  text: string;
};

const AssistantScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [filter, setFilter] = useState<'reminder' | 'thanks'>('reminder');
  const [search, setSearch] = useState('');
  const [messages, setMessages] = useState<Suggestion[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Suggestion | null>(null);
  const [editText, setEditText] = useState('');
  // const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    // Simulación de fetch al backend
    setMessages(DUMMY_SUGGESTIONS[filter]);
  }, [filter]);

  const filteredMessages = messages.filter(msg =>
    msg.clientName.toLowerCase().includes(search.toLowerCase()) ||
    msg.text.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (msg: Suggestion) => {
    setSelectedMessage(msg);
    setEditText(msg.text);
  };

  const handleSend = () => {
    Alert.alert('Mensaje enviado', `Mensaje enviado a ${selectedMessage?.clientName}:

${editText}`);
    setSelectedMessage(null);
  };

  const renderSuggestion = ({ item }: { item: Suggestion }) => (
    <View style={styles.card}>
      <Image source={avatarDefault} style={styles.avatar} />
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{item.clientName}</Text>
        <Text style={styles.cardField}>Tipo: <Text style={styles.cardValue}>{filter === 'reminder' ? 'Recordatorio' : 'Agradecimiento'}</Text></Text>
        <Text style={styles.cardField}>Mensaje: <Text style={styles.cardValue}>{item.text}</Text></Text>
        <Text style={styles.cardField}>Estado: <Text style={styles.cardValue}>Pendiente</Text></Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={() => openModal(item)}
        >
          <Image source={edit} style={styles.editButtonIcon} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]} 
          onPress={() => openModal(item)}
        >
          <Image source={checkmark} style={styles.approveButtonIcon} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, styles.cancelButton]} 
          onPress={() => setSelectedMessage(null)}
        >
          <Image source={cancel} style={styles.cancelButtonIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Asistente Inteligente</Text>
        <View style={{ width: 28 }} />
      </View>
      <Text style={styles.subtitle}>Gestión de Mensajes</Text>
      
      {/* Buscador */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar mensajes..."
          value={search}
          onChangeText={setSearch}
        />
        <Image source={setting} style={styles.searchIcon} />
      </View>

      {/* Filtros */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'reminder' && styles.filterButtonActive]}
          onPress={() => setFilter('reminder')}
        >
          <Text style={[styles.filterText, filter === 'reminder' && styles.filterTextActive]}>Recordatorio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'thanks' && styles.filterButtonActiveBlue]}
          onPress={() => setFilter('thanks')}
        >
          <Text style={[styles.filterText, filter === 'thanks' && styles.filterTextActive]}>Agradecimiento</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de mensajes */}
      <FlatList
        data={filteredMessages}
        keyExtractor={item => item.id.toString()}
        renderItem={renderSuggestion}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay mensajes para mostrar</Text>
            <Text style={styles.emptySubtext}>Intenta cambiar los filtros</Text>
          </View>
        }
      />

      {/* Modal para ver/editar/enviar mensaje */}
      <Modal visible={!!selectedMessage} transparent animationType="slide" onRequestClose={() => setSelectedMessage(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Mensaje sugerido</Text>
            <Text style={styles.modalClient}>{selectedMessage?.clientName}</Text>
            <TextInput
              style={styles.modalMsgInput}
              value={editText}
              onChangeText={setEditText}
              multiline
            />
            <TouchableOpacity style={styles.modalSendButton} onPress={handleSend}>
              <Text style={styles.modalSendButtonText}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setSelectedMessage(null)}>
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Dashboard')}>
          <Image source={home} style={[styles.navIcon, route.name === 'Dashboard' && { tintColor: '#00278C' }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Assistant')}>
          <Image source={chat} style={[styles.navIcon, route.name === 'Assistant' && { tintColor: '#00278C' }]} />
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
    backgroundColor: '#F8F9FA',
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 8,
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
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchBox: {
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48,
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    right: 16,
    top: 12,
    width: 20,
    height: 20,
    tintColor: '#6B7280',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  cardField: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  cardValue: {
    color: '#1F2937',
    fontWeight: '500',
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
  editButton: {
    backgroundColor: '#EFF6FF',
  },
  editButtonIcon: {
    width: 20,
    height: 20,
    tintColor: '#3B82F6',
  },
  approveButton: {
    backgroundColor: '#ECFDF5',
  },
  approveButtonIcon: {
    width: 20,
    height: 20,
    tintColor: '#10B981',
  },
  cancelButton: {
    backgroundColor: '#FEF2F2',
  },
  cancelButtonIcon: {
    width: 20,
    height: 20,
    tintColor: '#EF4444',
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
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
  modalClient: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#10B981',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMsgInput: {
    fontSize: 15,
    color: '#374151',
    marginBottom: 18,
    textAlign: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    minHeight: 60,
  },
  modalSendButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSendButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalCloseButton: {
    backgroundColor: '#6B7280',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default AssistantScreen; 