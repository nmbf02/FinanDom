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
import { useTheme } from '../theme/ThemeContext';

const BackIcon = require('../assets/icons/back.png');
const eyeIcon = require('../assets/icons/eye.png');
const eyeOffIcon = require('../assets/icons/eye-off.png');
const CheckIcon = require('../assets/icons/checkmark.png');

const RegisterScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
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
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.navigate('Login')}>
          <Image source={BackIcon} style={[styles.iconBack, { tintColor: theme.muted }]} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]}>{t('register.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>{t('register.subtitle')}</Text>

          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder={t('register.userId')}
            placeholderTextColor={theme.muted}
            value={userId}
            onChangeText={text => setUserId(text.replace(/[^0-9]/g, ''))}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder={t('register.identification')}
            placeholderTextColor={theme.muted}
            value={identification}
            onChangeText={setIdentification}
          />

          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder={t('register.fullName')}
            placeholderTextColor={theme.muted}
            value={name}
            onChangeText={setName}
          />

          <View style={[styles.inputRow, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.inputPassword, { color: theme.text }]}
              placeholder={t('register.email')}
              placeholderTextColor={theme.muted}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
            {isEmailValid && <Image source={CheckIcon} style={[styles.smallIcon, { tintColor: theme.primary }]} />}
          </View>

          <View style={[styles.inputRow, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.inputPassword, { color: theme.text }]}
              placeholder={t('register.password')}
              placeholderTextColor={theme.muted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image source={showPassword ? eyeOffIcon : eyeIcon} style={[styles.smallIcon, { tintColor: theme.muted }]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputRow, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.inputPassword, { color: theme.text }]}
              placeholder={t('register.confirmPassword')}
              placeholderTextColor={theme.muted}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Image source={showConfirmPassword ? eyeOffIcon : eyeIcon} style={[styles.smallIcon, { tintColor: theme.muted }]} />
            </TouchableOpacity>
          </View>

          <TextInput
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            placeholder={t('register.role')}
            placeholderTextColor={theme.muted}
            value={role}
            onChangeText={setRole}
            editable={false}
          />

          <TouchableOpacity style={[styles.registerButton, { backgroundColor: theme.primary }]} onPress={handleRegister}>
            <Text style={[styles.registerButtonText, { color: theme.text }]}>{t('register.createAccount')}</Text>
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
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
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
