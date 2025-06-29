// src/screens/Auth/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const checkmarkIcon = require('../../assets/icons/checkmark.png');
const eyeIcon = require('../../assets/icons/eye.png');
const eyeOffIcon = require('../../assets/icons/eye-off.png');

const LoginScreen = () => {
  const [email, setEmail] = useState('nathalyberroaf@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Hola</Text>
      <Text style={styles.subheader}>Seguro, claro y a tu medida</Text>

      <Text style={styles.label}>Email</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          keyboardType="email-address"
        />
        {email.length > 3 && (
          <Image source={checkmarkIcon} style={styles.icon} />
        )}
      </View>

      <Text style={styles.passwordLabel}>Contraseña</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Image
            source={showPassword ? eyeOffIcon : eyeIcon}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.rowOptions}>
        <View style={styles.checkboxContainer}>
            <CheckBox
            value={rememberMe}
            onValueChange={setRememberMe}
            tintColors={{ true: '#1CC88A', false: '#ccc' }}
            />
            <Text style={styles.rememberText}>Remember me</Text>
        </View>

        <TouchableOpacity>
            <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity style={styles.loginButton}>
        <Text style={styles.loginButtonText}>LOGIN</Text>
      </TouchableOpacity>

      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>¿No tienes cuenta?</Text>
        <TouchableOpacity>
          <Text style={styles.registerLink}> Registrate</Text>
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
});
