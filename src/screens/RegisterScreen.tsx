import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
} from 'react-native';
import { API_BASE_URL } from '../api/config';
import { useTranslation } from 'react-i18next';

const BackIcon = require('../assets/icons/back.png');
const eyeIcon = require('../assets/icons/eye.png');
const eyeOffIcon = require('../assets/icons/eye-off.png');
const CheckIcon = require('../assets/icons/checkmark.png');

const RegisterScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [identification, setIdentification] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('Prestamista');

  const isEmailValid = email.includes('@');

  const handleRegister = async () => {
    if (!userId || !name || !identification || !email || !password || !confirmPassword || !role) {
      Alert.alert(t('register.incompleteFields'), t('register.incompleteFieldsMessage'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('register.passwordMismatch'), t('register.passwordMismatchMessage'));
      return;
    }
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId, name, identification, email, password, role }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        Alert.alert(t('register.success'), t('register.successMessage'), [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
        ]);
      } else {
        Alert.alert(t('register.error'), data.message || t('register.errorMessage'));
      }
    } catch (error) {
      console.error('Error de registro:', error);
      Alert.alert(t('register.error'), t('register.serverError'));
    }
  };
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.navigate('Login')}>
          <Image source={BackIcon} style={styles.iconBack} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{t('register.title')}</Text>
          <Text style={styles.subtitle}>{t('register.subtitle')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('register.userId')}
            value={userId}
            onChangeText={text => setUserId(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder={t('register.identification')}
            value={identification}
            onChangeText={setIdentification}
          />

          <TextInput
            style={styles.input}
            placeholder={t('register.fullName')}
            value={name}
            onChangeText={setName}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputPassword}
              placeholder={t('register.email')}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            {isEmailValid && <Image source={CheckIcon} style={styles.smallIcon} />}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputPassword}
              placeholder={t('register.password')}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image source={showPassword ? eyeOffIcon : eyeIcon} style={styles.smallIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputPassword}
              placeholder={t('register.confirmPassword')}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Image source={showConfirmPassword ? eyeOffIcon : eyeIcon} style={styles.smallIcon} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder={t('register.role')}
            value={role}
            onChangeText={setRole}
            editable={false}
          />

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>{t('register.createAccount')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  backIcon: {
    position: 'absolute',
    top: 30,
    left: 20,
    zIndex: 10,
  },
  iconBack: {
    width: 24,
    height: 24,
    tintColor: '#555',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1A1A1A',
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#555',
    textAlign: 'left',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#CCC',
    marginBottom: 20,
    fontSize: 16,
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputPassword: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
  },
  smallIcon: {
    width: 20,
    height: 20,
    tintColor: '#888',
  },
  registerButton: {
    backgroundColor: '#1CC88A',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 30,
  },
  registerButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
