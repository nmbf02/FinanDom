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
const CheckIcon = require('../assets/icons/checkmark.png');
const eyeIcon = require('../assets/icons/eye.png');
const eyeOffIcon = require('../assets/icons/eye-off.png');

const ForgotPasswordScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [isLoading, setIsLoading] = useState(false);

  const isEmailValid = email.includes('@');

  const handleSendCode = async () => {
    if (!email) {
      Alert.alert(t('forgotPassword.error'), t('forgotPassword.enterEmail'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(t('forgotPassword.codeSent'), t('forgotPassword.checkEmail'));
        setStep(2);
      } else {
        Alert.alert(t('forgotPassword.error'), data.message || t('forgotPassword.sendCodeError'));
      }
    } catch (error) {
      console.error('Error enviando código:', error);
      Alert.alert(t('forgotPassword.error'), t('forgotPassword.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert(t('forgotPassword.error'), t('forgotPassword.enterCode'));
      return;
    }

    setStep(3);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert(t('forgotPassword.error'), t('forgotPassword.completeFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(t('forgotPassword.error'), t('forgotPassword.passwordMismatch'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert(t('forgotPassword.success'), t('forgotPassword.passwordUpdated'), [
          { text: t('common.ok'), onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert(t('forgotPassword.error'), data.message || t('forgotPassword.updatePasswordError'));
      }
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      Alert.alert(t('forgotPassword.error'), t('forgotPassword.serverError'));
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.text }]}>{t('forgotPassword.recoverPassword')}</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{t('forgotPassword.enterEmailForCode')}</Text>

      <View style={[styles.inputRow, { borderColor: theme.border }]}>
        <TextInput
          style={[styles.inputPassword, { color: theme.text }]}
          placeholder={t('auth.email')}
          placeholderTextColor={theme.muted}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        {isEmailValid && <Image source={CheckIcon} style={[styles.smallIcon, { tintColor: theme.primary }]} />}
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.primary }, isLoading && styles.buttonDisabled]} 
        onPress={handleSendCode}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? t('forgotPassword.sending') : t('forgotPassword.sendCode')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.text }]}>{t('forgotPassword.verifyCode')}</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{t('forgotPassword.enterCodeFromEmail')}</Text>

      <TextInput
        style={[styles.input, { color: theme.text, borderColor: theme.border }]}
        placeholder={t('forgotPassword.sixDigitCode')}
        placeholderTextColor={theme.muted}
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        maxLength={6}
      />

      <TouchableOpacity style={[styles.button, { backgroundColor: theme.primary }]} onPress={handleVerifyCode}>
        <Text style={styles.buttonText}>{t('forgotPassword.verifyCode')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => setStep(1)}>
        <Text style={[styles.linkText, { color: theme.primary }]}>{t('forgotPassword.changeEmail')}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.title, { color: theme.text }]}>{t('forgotPassword.newPassword')}</Text>
      <Text style={[styles.subtitle, { color: theme.muted }]}>{t('forgotPassword.enterNewPassword')}</Text>

      <View style={[styles.inputRow, { borderColor: theme.border }]}>
        <TextInput
          style={[styles.inputPassword, { color: theme.text }]}
          placeholder={t('forgotPassword.newPasswordPlaceholder')}
          placeholderTextColor={theme.muted}
          secureTextEntry={!showPassword}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image source={showPassword ? eyeOffIcon : eyeIcon} style={[styles.smallIcon, { tintColor: theme.muted }]} />
        </TouchableOpacity>
      </View>

      <View style={[styles.inputRow, { borderColor: theme.border }]}>
        <TextInput
          style={[styles.inputPassword, { color: theme.text }]}
          placeholder={t('forgotPassword.confirmNewPassword')}
          placeholderTextColor={theme.muted}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Image source={showConfirmPassword ? eyeOffIcon : eyeIcon} style={[styles.smallIcon, { tintColor: theme.muted }]} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: theme.primary }, isLoading && styles.buttonDisabled]} 
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? t('forgotPassword.updating') : t('forgotPassword.updatePassword')}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }] }>
        <TouchableOpacity style={styles.backIcon} onPress={() => navigation.navigate('Login')}>
          <Image source={BackIcon} style={[styles.iconBack, { tintColor: theme.primary }]} />
        </TouchableOpacity>

        <View style={styles.content}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;

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
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
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
  button: {
    backgroundColor: '#1CC88A',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#1CC88A',
    fontSize: 14,
  },
});
