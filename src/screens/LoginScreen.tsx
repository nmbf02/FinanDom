// src/screens/Auth/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';
import { loginUser, loginWithGoogle } from '../api/auth';
import { configureGoogleSignIn, signInWithGoogle } from '../config/google';

const checkmarkIcon = require('../assets/icons/checkmark.png');
const eyeIcon = require('../assets/icons/eye.png');
const eyeOffIcon = require('../assets/icons/eye-off.png');

const LoginScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Cargar credenciales guardadas al iniciar y configurar Google Sign-In
  useEffect(() => {
    loadSavedCredentials();
    configureGoogleSignIn();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      const savedPassword = await AsyncStorage.getItem('rememberedPassword');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');
      
      if (savedEmail && savedPassword && savedRememberMe === 'true') {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    } catch (error) {
      console.error('Error cargando credenciales:', error);
    }
  };

  const saveCredentials = async () => {
    try {
      if (rememberMe) {
        await AsyncStorage.setItem('rememberedEmail', email);
        await AsyncStorage.setItem('rememberedPassword', password);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('rememberedEmail');
        await AsyncStorage.removeItem('rememberedPassword');
        await AsyncStorage.removeItem('rememberMe');
      }
    } catch (error) {
      console.error('Error guardando credenciales:', error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), t('auth.requiredFields'));
      return;
    }

    try {
      const data = await loginUser(email, password);
      console.log('✅ Login exitoso:', data);
      // Guardar credenciales si "Remember me" está activado
      await saveCredentials();
      // Guardar datos del usuario
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      navigation.navigate('Dashboard');
    } catch (err: any) {
      console.error('❌ Error de conexión:', err);
      Alert.alert(t('common.error'), err.message || t('errors.networkError'));
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const googleResult = await signInWithGoogle();
      
      if (!googleResult.success) {
        Alert.alert(t('common.error'), googleResult.error);
        return;
      }

      const { idToken } = googleResult;
      const data = await loginWithGoogle(idToken);
      
      console.log('✅ Login con Google exitoso:', data);
      // Guardar datos del usuario
      await AsyncStorage.setItem('userData', JSON.stringify(data.user));
      navigation.navigate('Dashboard');
    } catch (err: any) {
      console.error('❌ Error en login con Google:', err);
      Alert.alert(t('common.error'), err.message || t('errors.networkError'));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>{t('auth.greeting')}</Text>
      <Text style={[styles.subheader, { color: theme.muted }]}>{t('auth.subtitle')}</Text>

      <Text style={[styles.label, { color: theme.muted }]}>{t('auth.email')}</Text>
      <View style={[styles.inputRow, { borderColor: theme.primary }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={email}
          onChangeText={setEmail}
          placeholder={t('auth.email')}
          placeholderTextColor={theme.muted}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {email.length > 3 && (
          <Image source={checkmarkIcon} style={[styles.icon, { tintColor: theme.primary }]} />
        )}
      </View>

      <Text style={[styles.passwordLabel, { color: theme.muted }]}>{t('auth.password')}</Text>
      <View style={[styles.inputRow, { borderColor: theme.primary }]}>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholder={t('auth.password')}
          placeholderTextColor={theme.muted}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={showPassword ? eyeOffIcon : eyeIcon}
            style={[styles.icon, { tintColor: theme.muted }]} />
        </TouchableOpacity>
      </View>

      <View style={styles.rowOptions}>
        <View style={styles.checkboxContainer}>
          <CheckBox
            value={rememberMe}
            onValueChange={(value) => {
              setRememberMe(value);
              if (!value) {
                // Limpiar credenciales si se desmarca
                AsyncStorage.removeItem('rememberedEmail');
                AsyncStorage.removeItem('rememberedPassword');
                AsyncStorage.removeItem('rememberMe');
              }
            }}
            tintColors={{ true: theme.primary, false: theme.border }}
          />
          <Text style={[styles.rememberText, { color: theme.text }]}>{t('auth.rememberMe')}</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={[styles.forgotText, { color: theme.primary }]}>{t('auth.forgotPassword')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.loginButton, { backgroundColor: theme.primary }]} onPress={handleLogin}>
        <Text style={[styles.loginButtonText, { color: theme.text }]}>{t('auth.login').toUpperCase()}</Text>
      </TouchableOpacity>

      <View style={styles.dividerContainer}>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <Text style={[styles.dividerText, { color: theme.muted }]}>{t('auth.or')}</Text>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
      </View>

      <TouchableOpacity style={[styles.googleButton, { borderColor: theme.border }]} onPress={handleGoogleLogin}>
        <Text style={[styles.googleButtonText, { color: theme.text }]}>G</Text>
        <Text style={[styles.googleButtonText, { color: theme.text }]}>{t('auth.continueWithGoogle')}</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={[styles.registerText, { color: theme.text }]}>{t('auth.noAccount')}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.registerLink, { color: theme.primary }]}>{t('auth.register')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFDFD',
    paddingHorizontal: 25,
    justifyContent: 'center',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 24,
    color: '#4D4D4D',
  },
  label: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#1CC88A',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#1CC88A',
  },
  rowOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    marginLeft: 6,
    color: '#555',
  },
  forgotText: {
    color: '#666',
  },
  loginButton: {
    backgroundColor: '#1CC88A',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: '#555',
    fontSize: 14,
  },
  registerLink: {
    color: '#1CC88A',
    fontWeight: 'bold',
  },
  passwordLabel: {
    color: '#888',
    fontSize: 14,
    marginTop: 20,
    marginBottom: 4,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#888',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});
