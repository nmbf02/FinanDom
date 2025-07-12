import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Alert, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { API_BASE_URL } from '../api/config';
import * as ImagePicker from 'expo-image-picker';

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
  HelpCenter: undefined;
  Currency: undefined;
};

const avatar = require('../assets/icons/avatar.png');
const edit = require('../assets/icons/edit.png');
const user = require('../assets/icons/user-setting.png');
const help = require('../assets/icons/chat.png');
const logout = require('../assets/icons/back.png');
const home = require('../assets/icons/home.png');
const calendar = require('../assets/icons/calendar.png');

const ProfileScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [logoutVisible, setLogoutVisible] = useState(false);
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

  useEffect(() => {
    (async () => {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        setUserId(user.id);
        // Consultar datos actualizados desde el backend
        try {
          const res = await fetch(`${API_BASE_URL}/api/user/${user.id}`);
          if (res.ok) {
            const fresh = await res.json();
            setName(fresh.name || '');
            setPhone(fresh.phone || '');
            setEmail(fresh.email || '');
            setRole(fresh.role || 'prestamista');
            setPhotoUrl(fresh.photo_url || null);
          } else {
            setName(user.name || '');
            setPhone(user.phone || '');
            setEmail(user.email || '');
            setRole(user.role || 'prestamista');
            setPhotoUrl(user.photo_url || null);
          }
        } catch {
          setName(user.name || '');
          setPhone(user.phone || '');
          setEmail(user.email || '');
          setRole(user.role || 'prestamista');
          setPhotoUrl(user.photo_url || null);
        }
      }
    })();
  }, []);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0].uri) {
      // Subir imagen al backend
      const formData = new FormData();
      formData.append('file', {
        uri: result.assets[0].uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as any);
      try {
        const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploadData = await uploadRes.json();
        if (uploadData.url) {
          setPhotoUrl(uploadData.url);
        }
      } catch {}
    }
  };

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
        body: JSON.stringify({ name, phone, email, password, photo_url: photoUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert('Éxito', 'Perfil actualizado correctamente.');
        // Actualizar datos locales
        await AsyncStorage.setItem('userData', JSON.stringify({ id: userId, name, phone, email, role, photo_url: photoUrl }));
      } else {
        Alert.alert('Error', data.message || 'No se pudo actualizar el perfil.');
      }
    } catch (err) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };
  const handleLogout = async () => {
    await AsyncStorage.clear();
    setLogoutVisible(false);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };
  return (
    <View style={styles.container}>
      {/* Encabezado */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={logout} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Foto de perfil */}
        <View style={styles.avatarContainer}>
          <Image source={photoUrl ? { uri: photoUrl } : avatar} style={styles.avatar} />
          <TouchableOpacity style={styles.editIconContainer} onPress={handlePickImage}>
            <Image source={edit} style={styles.editIcon} />
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>Perfil</Text>
        {/* Formulario de edición */}
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
          <View style={[styles.input, { justifyContent: 'center' }]}>
            <Text style={{ fontSize: 16, color: '#888' }}>{role}</Text>
          </View>
          <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
            <Text style={styles.updateButtonText}>ACTUALIZAR DATOS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      {/* Modal de logout */}
      <Modal visible={logoutVisible} transparent animationType="slide" onRequestClose={() => setLogoutVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModal}>
            <Text style={styles.logoutTitle}>Cerrar Sesion</Text>
            <Text style={styles.logoutText}>¿Estás seguro que deseas salir?</Text>
            <View style={styles.logoutButtonsRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setLogoutVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Sí, Salir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Barra de navegación inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Assistant')}>
          <Image source={help} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={calendar} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={user} style={[styles.navIcon, { tintColor: '#00278C' }]} />
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
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsList: {
    width: '90%',
    marginTop: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 16,
    elevation: 1,
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2DD4BF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  optionLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
    flex: 1,
  },
  optionArrow: {
    fontSize: 22,
    color: '#BDBDBD',
    marginLeft: 8,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  logoutModal: {
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 24,
    textAlign: 'center',
  },
  logoutButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E0E7FF',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 6,
  },
  cancelButtonText: {
    color: '#6366F1',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginLeft: 6,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
});

export default ProfileScreen; 