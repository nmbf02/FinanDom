import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Image, StyleSheet, Modal, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');
const messageIcon = require('../assets/icons/chat.png');

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Asistente Inteligente</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Filtros */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'reminder' && styles.filterButtonActiveGreen]}
          onPress={() => setFilter('reminder')}
        >
          <Text style={styles.filterText}>Recordatorio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'thanks' && styles.filterButtonActiveBlue]}
          onPress={() => setFilter('thanks')}
        >
          <Text style={styles.filterText}>Agradecimiento</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de mensajes */}
      <FlatList
        data={filteredMessages}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.clientName}>{item.clientName}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => openModal(item)}>
                <Image source={messageIcon} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openModal(item)}>
                <Text style={styles.approve}>✅</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setSelectedMessage(null)}>
                <Text style={styles.reject}>❌</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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

      {/* Navbar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={[styles.navIcon, route.name === 'Dashboard' && { tintColor: '#00278C' }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Assistant')}>
          <Image source={chat} style={[styles.navIcon, route.name === 'Assistant' && { tintColor: '#00278C' }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('LoanList')}>
          <Image source={calendar} style={[styles.navIcon, route.name === 'LoanList' && { tintColor: '#00278C' }]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ClientList')}>
          <Image source={user} style={[styles.navIcon, route.name === 'ClientList' && { tintColor: '#00278C' }]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 12 },
  backArrow: { fontSize: 28, color: '#10B981', fontWeight: 'bold', marginRight: 8 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1F2937', textAlign: 'center', flex: 1 },
  searchInput: { backgroundColor: '#F3F4F6', borderRadius: 8, marginHorizontal: 16, marginBottom: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16 },
  filterRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12, gap: 8 },
  filterButton: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F3F4F6', marginHorizontal: 4 },
  filterButtonActiveGreen: { backgroundColor: '#10B981' },
  filterButtonActiveBlue: { backgroundColor: '#A7C7E7' },
  filterText: { fontSize: 15, color: '#222', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginHorizontal: 16, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  clientName: { fontWeight: 'bold', fontSize: 16, color: '#1CC88A', marginBottom: 4 },
  messageText: { fontSize: 15, color: '#374151', marginBottom: 10 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  icon: { width: 24, height: 24, tintColor: '#10B981' },
  approve: { fontSize: 22, color: '#10B981', marginHorizontal: 8 },
  reject: { fontSize: 22, color: '#EF4444', marginHorizontal: 8 },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, backgroundColor: '#fff', borderRadius: 20, position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 10, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6 },
  navIcon: { width: 28, height: 28, tintColor: '#10B981' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, width: '85%', maxWidth: 350, alignItems: 'stretch' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#1F2937', textAlign: 'center' },
  modalClient: { fontWeight: 'bold', fontSize: 16, color: '#1CC88A', marginBottom: 8, textAlign: 'center' },
  modalMsgInput: { fontSize: 15, color: '#374151', marginBottom: 18, textAlign: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 12, minHeight: 60 },
  modalSendButton: { backgroundColor: '#1CC88A', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  modalSendButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalCloseButton: { backgroundColor: '#10B981', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  modalCloseButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default AssistantScreen; 