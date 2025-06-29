import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backIcon}>
        <Icon name="arrow-back-outline" size={24} color="#555" />
      </TouchableOpacity>

      <Text style={styles.title}>Únete</Text>
      <Text style={styles.subtitle}>Se parte de una gran comunidad</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre Completo"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Contraseña"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Icon
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#888"
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
        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
          <Icon
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="#888"
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
    </ScrollView>
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 60,
    backgroundColor: '#FFFFFF',
  },
  backIcon: {
    position: 'absolute',
    top: 30,
    left: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    color: '#555',
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
