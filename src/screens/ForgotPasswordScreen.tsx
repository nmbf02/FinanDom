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

const BackIcon = require('../assets/icons/back.png');
const CheckIcon = require('../assets/icons/checkmark.png');
const eyeIcon = require('../assets/icons/eye.png');
const eyeOffIcon = require('../assets/icons/eye-off.png');

const ForgotPasswordScreen = ({ navigation }: any) => {
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
      Alert.alert('❌ Error', 'Por favor ingresa tu email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:4000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('✅ Código enviado', 'Revisa tu email para el código de recuperación');
        setStep(2);
      } else {
        Alert.alert('❌ Error', data.message || 'No se pudo enviar el código');
      }
    } catch (error) {
      console.error('Error enviando código:', error);
      Alert.alert('❌ Error', 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code) {
      Alert.alert('❌ Error', 'Por favor ingresa el código');
      return;
    }

    setStep(3);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('❌ Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('❌ Error', 'Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://10.0.2.2:4000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('✅ Éxito', 'Contraseña actualizada exitosamente', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('❌ Error', data.message || 'No se pudo actualizar la contraseña');
      }
    } catch (error) {
      console.error('Error actualizando contraseña:', error);
      Alert.alert('❌ Error', 'Error al conectar con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Recuperar Contraseña</Text>
      <Text style={styles.subtitle}>Ingresa tu email para recibir un código de recuperación</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
        {isEmailValid && <Image source={CheckIcon} style={styles.smallIcon} />}
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleSendCode}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Enviando...' : 'Enviar Código'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Verificar Código</Text>
      <Text style={styles.subtitle}>Ingresa el código que recibiste en tu email</Text>

      <TextInput
        style={styles.input}
        placeholder="Código de 6 dígitos"
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        maxLength={6}
      />

      <TouchableOpacity style={styles.button} onPress={handleVerifyCode}>
        <Text style={styles.buttonText}>Verificar Código</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={() => setStep(1)}>
        <Text style={styles.linkText}>Cambiar email</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.title}>Nueva Contraseña</Text>
      <Text style={styles.subtitle}>Ingresa tu nueva contraseña</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Nueva contraseña"
          secureTextEntry={!showPassword}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image source={showPassword ? eyeOffIcon : eyeIcon} style={styles.smallIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Confirmar nueva contraseña"
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Image source={showConfirmPassword ? eyeOffIcon : eyeIcon} style={styles.smallIcon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]} 
        onPress={handleResetPassword}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </Text>
      </TouchableOpacity>
    </View>
  );

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
