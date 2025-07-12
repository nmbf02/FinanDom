import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '../api/config';

const avatar = require('../assets/icons/avatar.png');
const edit = require('../assets/icons/edit.png');
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');

const EditProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [userId, setUserId] = useState<number|null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('prestamista');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [documentTypeId, setDocumentTypeId] = useState<number | null>(null);
  const [identification, setIdentification] = useState('');
  const [documentTypes, setDocumentTypes] = useState<{ id: number, name: string }[]>([]);
  const [showDocumentTypeModal, setShowDocumentTypeModal] = useState(false);

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
        try {
          const res = await fetch(`${API_BASE_URL}/api/user/${user.id}`);
          if (res.ok) {
            const fresh = await res.json();
            setName(fresh.name || '');
            setPhone(fresh.phone || '');
            setEmail(fresh.email || '');
            setRole(fresh.role || 'prestamista');
            setPhotoUrl(fresh.photo_url || null);
            setDocumentTypeId(fresh.document_type_id || null);
            setIdentification(fresh.identification || '');
          } else {
            setName(user.name || '');
            setPhone(user.phone || '');
            setEmail(user.email || '');
            setRole(user.role || 'prestamista');
            setPhotoUrl(user.photo_url || null);
            setDocumentTypeId(user.document_type_id || null);
            setIdentification(user.identification || '');
          }
        } catch {
          setName(user.name || '');
          setPhone(user.phone || '');
          setEmail(user.email || '');
          setRole(user.role || 'prestamista');
          setPhotoUrl(user.photo_url || null);
          setDocumentTypeId(user.document_type_id || null);
          setIdentification(user.identification || '');
        }
      }
    })();
    fetch(`${API_BASE_URL}/api/document-types`)
      .then(res => res.json())
      .then(setDocumentTypes)
      .catch(() => setDocumentTypes([]));
  }, []);

  const handleUpdate = async () => {
    if (!name || !email) {
      Alert.alert('Error', 'Nombre y email son obligatorios.');
      return;
    }
    if (password && password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, phone, email, password, photo_url: photoUrl,
          document_type_id: documentTypeId,
          identification
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente.', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Profile'),
          },
        ]);
        await AsyncStorage.setItem('userData', JSON.stringify({ id: userId, name, phone, email, role, photo_url: photoUrl }));
      } else {
        Alert.alert('Error', data.message || 'No se pudo actualizar el perfil.');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={require('../assets/icons/back.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Perfil</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarContainer}>
          <Image source={photoUrl ? { uri: photoUrl } : avatar} style={styles.avatar} />
          <TouchableOpacity style={styles.editIconContainer} onPress={() => Alert.alert('Info', 'La selección de imagen de perfil no está disponible en este momento.')}>
            <Image source={edit} style={styles.editIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.formContainer}>
          <TextInput style={styles.input} placeholder="Nombre Completo" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Telefono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          <View style={styles.passwordRow}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} autoCapitalize="none" />
            <TouchableOpacity onPress={() => setShowPassword(v => !v)}>
              <Image source={showPassword ? require('../assets/icons/eye-off.png') : require('../assets/icons/eye.png')} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.passwordRow}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Confirmar contraseña" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!showConfirmPassword} autoCapitalize="none" />
            <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)}>
              <Image source={showConfirmPassword ? require('../assets/icons/eye-off.png') : require('../assets/icons/eye.png')} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>
          {/* Selector de tipo de documento */}
          <View style={styles.input}>
            <Text style={{ color: '#888', marginBottom: 4 }}>Tipo de documento</Text>
            <TouchableOpacity 
              style={{ paddingVertical: 12 }}
              onPress={() => setShowDocumentTypeModal(true)}
            >
              <Text style={{ fontSize: 16, color: '#222' }}>
                {documentTypes.find(dt => dt.id === documentTypeId)?.name || 'Selecciona tipo de documento'}
              </Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Número de documento"
            value={identification}
            onChangeText={setIdentification}
          />
          {/* Modal para seleccionar tipo de documento */}
          <Modal
            visible={showDocumentTypeModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDocumentTypeModal(false)}
          >
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ backgroundColor: '#FFF', borderRadius: 12, padding: 24, width: '80%', maxWidth: 300 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1F2937' }}>Seleccionar tipo de documento</Text>
                {documentTypes.map((docType) => (
                  <TouchableOpacity 
                    key={docType.id}
                    style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}
                    onPress={() => {
                      setDocumentTypeId(docType.id);
                      setShowDocumentTypeModal(false);
                    }}
                  >
                    <Text style={{ fontSize: 16, color: '#374151', textAlign: 'center' }}>{docType.name}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity 
                  style={{ marginTop: 16, paddingVertical: 12, backgroundColor: '#EF4444', borderRadius: 8 }}
                  onPress={() => setShowDocumentTypeModal(false)}
                >
                  <Text style={{ fontSize: 16, color: '#FFF', textAlign: 'center', fontWeight: '600' }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <View style={[styles.input, { justifyContent: 'center' }]}> 
            <Text style={{ fontSize: 16, color: '#888' }}>{role}</Text>
          </View>
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>ACTUALIZAR DATOS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={[styles.navIcon, /* opcional: resalta si es Dashboard */]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Assistant')}>
          <Image source={chat} style={[styles.navIcon, /* opcional: resalta si es Assistant */]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={calendar} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={user} style={[styles.navIcon, /* opcional: resalta si es Profile */]} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 64,
    marginBottom: 8,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#10B981',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 120,
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    elevation: 2,
  },
  editIcon: {
    width: 22,
    height: 22,
    tintColor: '#10B981',
  },
  formContainer: {
    width: '90%',
    marginTop: 8,
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: '#BDBDBD',
    marginLeft: 8,
  },
  updateButton: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  updateButtonText: {
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

export default EditProfileScreen; 