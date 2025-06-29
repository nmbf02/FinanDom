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
} from 'react-native';

const BackIcon = require('../../assets/icons/back.png');
const eyeIcon = require('../../assets/icons/eye.png');
const eyeOffIcon = require('../../assets/icons/eye-off.png');
const CheckIcon = require('../../assets/icons/checkmark.png');

const RegisterScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('');

  const isEmailValid = email.includes('@');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* ← Botón retroceso */}
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.navigate('Login')}

        >
          <Image source={BackIcon} style={styles.iconBack} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Únete</Text>
          <Text style={styles.subtitle}>Se parte de una gran comunidad</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre Completo"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Email"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
            {isEmailValid && (
              <Image source={CheckIcon} style={styles.smallIcon} />
            )}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Contraseña"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Image
                source={showPassword ? eyeOffIcon : eyeIcon}
                style={styles.smallIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.inputPassword}
              placeholder="Confirmar contraseña"
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Image
                source={showConfirmPassword ? eyeOffIcon : eyeIcon}
                style={styles.smallIcon}
              />
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Rol (Prestamista o Prestatario)"
            value={role}
            onChangeText={setRole}
          />

          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>CREAR CUENTA</Text>
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
