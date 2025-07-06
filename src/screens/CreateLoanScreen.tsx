// CreateLoanScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Image } from 'react-native';
import { API_BASE_URL } from '../api/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';


const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');

const frequencies = [
  { label: 'Semanal', value: 'semanal', days: 7 },
  { label: 'Quincenal', value: 'quincenal', days: 15 },
  { label: 'Mensual', value: 'mensual', days: 30 },
];

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
  CreateLoan: undefined;
};

type LateFeeType = {
  id: number;
  name: string;
  description: string;
  calculation_type: string;
  interval_days: number;
  percentage_rate: number;
  is_active: number;
};

const CreateLoanScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [clients, setClients] = useState([]);
  const [lateFeeTypes, setLateFeeTypes] = useState<LateFeeType[]>([]);
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [numInstallments, setNumInstallments] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [frequency, setFrequency] = useState(frequencies[0].value);
  const [lateFeeTypeId, setLateFeeTypeId] = useState('1');
  const [pdf, setPdf] = useState<any>(null);
  const [lateDays, setLateDays] = useState('');
  const [latePercent, setLatePercent] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [installments, setInstallments] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/clients`)
      .then(res => res.json())
      .then(data => setClients(data))
      .catch((error) => {
        console.error('Error fetching clients:', error);
        setClients([]);
      });

    fetch(`${API_BASE_URL}/api/late-fee-types`)
      .then(res => res.json())
      .then(data => setLateFeeTypes(data))
      .catch((error) => {
        console.error('Error fetching late fee types:', error);
        setLateFeeTypes([]);
      });
  }, []);

  const handlePickPdf = async () => {
    try {
      const [file] = await pick({
        type: [types.pdf],
      });
  
      const [localCopy] = await keepLocalCopy({
        files: [
          {
            uri: file.uri,
            fileName: file.name ?? 'documento.pdf',
          },
        ],
        destination: 'documentDirectory',
      });
  
      setPdf({
        ...localCopy,
        name: file.name ?? 'documento.pdf',
      });
    } catch (err) {
      if ((err as any).code !== 'DOCUMENT_PICKER_CANCELED') {
        console.error('Error al seleccionar PDF:', err);
        Alert.alert('Error', 'No se pudo seleccionar el documento.');
      }
    }
  };
  

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) setStartDate(selectedDate);
  };

  const handleCalculateInstallments = () => {
    if (!amount || !interestRate || !numInstallments || !startDate || !frequency) {
      Alert.alert('Campos requeridos', 'Completa los campos para calcular las cuotas.');
      return;
    }

    const freq = frequencies.find(f => f.value === frequency)!;
    const principal = parseFloat(amount);
    const interest = parseFloat(interestRate) / 100;
    const n = parseInt(numInstallments, 10);
    const total = principal + (principal * interest);
    const cuota = +(total / n).toFixed(2);
    const moraPercent = parseFloat(latePercent) / 100;
    const selectedLateFeeType = lateFeeTypes.find((type: LateFeeType) => type.id.toString() === lateFeeTypeId);
    
    let date = new Date(startDate);
    const rows = [];

    for (let i = 1; i <= n; i++) {
      if (i > 1) date = new Date(date.getTime() + freq.days * 24 * 60 * 60 * 1000);
      const fecha = date.toISOString().split('T')[0];
      
      let montoAtraso = cuota;
      
      if (selectedLateFeeType?.calculation_type === 'fixed_interval') {
        // Mora Fija: porcentaje configurable sobre el monto de la cuota
        const lateFeeRate = moraPercent || 0.02; // Usar el porcentaje ingresado por el usuario
        const lateFeeAmount = cuota * lateFeeRate;
        montoAtraso = +(cuota + lateFeeAmount).toFixed(2);
        // Ejemplo: 4,620 + (4,620 × porcentaje_usuario) = 4,620 + mora = total
      } else if (selectedLateFeeType?.calculation_type === 'accumulative_installments') {
        // Mora Acumulativa por Cuotas: efecto bola de nieve
        let accumulatedAmount = cuota;
        // Simular 3 cuotas vencidas para mostrar el efecto acumulativo
        for (let j = 0; j < 3; j++) {
          const lateFeeRate = moraPercent || 0.02; // Usar el porcentaje ingresado por el usuario
          const lateFeeAmount = accumulatedAmount * lateFeeRate;
          accumulatedAmount = +(accumulatedAmount + lateFeeAmount).toFixed(2);
        }
        montoAtraso = accumulatedAmount;
      } else {
        // Cálculo por defecto
        montoAtraso = +(cuota * (1 + moraPercent)).toFixed(2);
      }
      
      rows.push({ cuota: i, fecha, monto: cuota, montoAtraso });
    }

    setInstallments(rows);
    setDueDate(date);
  };

  const handleUploadPdf = async () => {
    if (!pdf) return '';
    const formData = new FormData();
    formData.append('file', {
      uri: pdf.uri,
      name: pdf.name,
      type: 'application/pdf',
    } as any);
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    return data.url;
  };

  const handleCreateLoan = async () => {
    if (!clientId || !amount || !interestRate || !numInstallments || !startDate || !frequency) {
      Alert.alert('Campos requeridos', 'Por favor completa todos los campos obligatorios.');
      return;
    }

    let pdfUrl = '';
    if (pdf) pdfUrl = await handleUploadPdf();

    try {
      const response = await fetch(`${API_BASE_URL}/api/loans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          amount: parseFloat(amount),
          interest_rate: parseFloat(interestRate),
          num_installments: parseInt(numInstallments, 10),
          start_date: formatDateLocal(startDate),
          due_date: formatDateLocal(dueDate),
          frequency,
          late_fee_type_id: parseInt(lateFeeTypeId, 10),
          late_days: parseInt(lateDays, 10),
          late_percent: parseFloat(latePercent),
          contract_pdf_url: pdfUrl,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Préstamo creado', 'El préstamo se creó correctamente.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', data.message || 'No se pudo crear el préstamo.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Crear Préstamo</Text>

      <Picker
        selectedValue={clientId}
        onValueChange={(value: string) => setClientId(value)}
        style={styles.input}
      >
        <Picker.Item label="Selecciona un cliente" value="" />
        {clients.map((client: any) => (
          <Picker.Item key={client.id} label={client.name} value={client.id} />
        ))}
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Monto del préstamo"
        value={amount}
        onChangeText={text => setAmount(text.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Interés (%)"
        value={interestRate}
        onChangeText={text => setInterestRate(text.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="# de Cuotas"
        value={numInstallments}
        onChangeText={text => setNumInstallments(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
        <Text style={{ color: '#555' }}>{`Fecha de inicio: ${formatDateLocal(startDate)}`}</Text>
      </TouchableOpacity>

      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
        />
      )}

      <View style={styles.frequencySection}>
        <Text style={styles.sectionLabel}>Frecuencia de pago:</Text>
        <View style={styles.frequencyButtons}>
          {frequencies.map(f => (
            <TouchableOpacity
              key={f.value}
              style={[styles.freqButton, frequency === f.value && styles.freqButtonActive]}
              onPress={() => setFrequency(f.value)}
            >
              <Text style={[styles.freqButtonText, frequency === f.value && styles.freqButtonTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.frequencySection}>
        <Text style={styles.sectionLabel}>Tipo de mora:</Text>
        <Picker
          selectedValue={lateFeeTypeId}
          onValueChange={(value: string) => setLateFeeTypeId(value)}
          style={styles.input}
        >
          {lateFeeTypes.map((type: LateFeeType) => (
            <Picker.Item key={type.id} label={type.name} value={type.id.toString()} />
          ))}
        </Picker>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Días de gracia para mora"
        value={lateDays}
        onChangeText={text => setLateDays(text.replace(/[^0-9]/g, ''))}
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        placeholder="% de recargo por mora"
        value={latePercent}
        onChangeText={text => setLatePercent(text.replace(/[^0-9.]/g, ''))}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.input} onPress={handlePickPdf}>
        <Text style={{ color: '#555' }}>{pdf ? `PDF seleccionado: ${pdf.name}` : 'Agregar documento PDF'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.calcButton} onPress={handleCalculateInstallments}>
        <Text style={styles.calcButtonText}>Calcular Cuota</Text>
      </TouchableOpacity>

      {installments.length > 0 && (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Cuota</Text>
            <Text style={styles.tableCell}>Fecha</Text>
            <Text style={styles.tableCell}>Monto</Text>
            <Text style={styles.tableCell}>Con Atraso</Text>
          </View>
          {installments.map((row, idx) => (
            <View key={idx} style={[styles.tableRow, idx % 2 === 0 && { backgroundColor: '#f9f9f9' }]}>
              <Text style={styles.tableCell}>{row.cuota}</Text>
              <Text style={styles.tableCell}>{row.fecha}</Text>
              <Text style={styles.tableCell}>RD$ {row.monto.toLocaleString('es-DO', {minimumFractionDigits: 2})}</Text>
              <Text style={styles.tableCell}>RD$ {row.montoAtraso.toLocaleString('es-DO', {minimumFractionDigits: 2})}</Text>
            </View>
          ))}
          
          {/* Información adicional sobre el tipo de mora */}
          <View style={styles.moraInfoContainer}>
            <Text style={styles.moraInfoTitle}>
              Tipo de mora: {lateFeeTypes.find((type: LateFeeType) => type.id.toString() === lateFeeTypeId)?.name}
            </Text>
            <Text style={styles.moraInfoText}>
              {lateFeeTypes.find((type: LateFeeType) => type.id.toString() === lateFeeTypeId)?.description}
            </Text>
            {lateFeeTypes.find((type: LateFeeType) => type.id.toString() === lateFeeTypeId)?.calculation_type === 'fixed_interval' && (
              <Text style={styles.moraInfoText}>
                Ejemplo: RD$4,620 + (RD$4,620 × {(parseFloat(latePercent || '0') / 100).toFixed(3)}) = RD$4,620 + RD${(4620 * parseFloat(latePercent || '0') / 100).toFixed(2)} = RD${(4620 * (1 + parseFloat(latePercent || '0') / 100)).toFixed(2)}
              </Text>
            )}
            {lateFeeTypes.find((type: LateFeeType) => type.id.toString() === lateFeeTypeId)?.calculation_type === 'accumulative_installments' && (
              <Text style={styles.moraInfoText}>
                Ejemplo: Efecto bola de nieve con {parseFloat(latePercent || '0').toFixed(1)}% sobre cuotas vencidas
              </Text>
            )}
          </View>
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleCreateLoan}>
        <Text style={styles.buttonText}>GENERAR CONTRATO</Text>
      </TouchableOpacity>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={chat} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={calendar} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={user} style={styles.navIcon} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 100, // Aumentado para dar espacio al navbar
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 70,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    fontSize: 16,
  },
  frequencySection: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  frequencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  freqButton: {
    borderWidth: 1,
    borderColor: '#1CC88A',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginRight: 8,
  },
  freqButtonActive: {
    backgroundColor: '#1CC88A',
  },
  freqButtonText: {
    color: '#1CC88A',
    fontWeight: '600',
  },
  freqButtonTextActive: {
    color: '#fff',
  },
  calcButton: {
    backgroundColor: '#A7C7E7',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  calcButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#1CC88A',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  tableContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
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
  moraInfoContainer: {
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    marginTop: 8,
  },
  moraInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  moraInfoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
});

export default CreateLoanScreen;
