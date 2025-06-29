import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';

const BackIcon = require('../assets/icons/back.png');

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        {/* ← Botón de regreso */}
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.navigate('Login')}

        >
          <Image source={BackIcon} style={styles.iconBack} />
        </TouchableOpacity>

        <Text style={styles.title}>Recuperación de Contraseña</Text>
        <Text style={styles.subtitle}>¿Clave olvidada? No hay problemas!</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Enviar código de verificación</Text>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    color: '#555',
  },
  input: {
    borderBottomWidth: 1,
    borderColor: '#CCC',
    fontSize: 16,
    paddingVertical: 8,
    marginBottom: 30,
  },
  sendButton: {
    backgroundColor: '#1CC88A',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
