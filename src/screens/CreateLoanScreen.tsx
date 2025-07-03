// CreateLoanScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Image } from 'react-native';
import { API_BASE_URL } from '../api/config';
import DateTimePicker from '@react-native-community/datetimepicker';
import { pick, keepLocalCopy, types } from '@react-native-documents/picker';
import { Picker } from '@react-native-picker/picker';

const BackIcon = require('../assets/icons/back.png');

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

const CreateLoanScreen = ({ navigation }: any) => {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [numInstallments, setNumInstallments] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [frequency, setFrequency] = useState(frequencies[0].value);
  const [pdf, setPdf] = useState<any>(null);
  const [lateDays, setLateDays] = useState('');
  const [latePercent, setLatePercent] = useState('');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [installments, setInstallments] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/clients`)
      .then(res => res.json())
      .then(data => setClients(data))
      .catch(() => setClients([]));
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
    let date = new Date(startDate);
    const rows = [];

    for (let i = 1; i <= n; i++) {
      if (i > 1) date = new Date(date.getTime() + freq.days * 24 * 60 * 60 * 1000);
      const fecha = date.toISOString().split('T')[0];
      const montoAtraso = +(cuota * (1 + moraPercent)).toFixed(2);
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
        body: JSON.stringify({
          client_id: clientId,
          amount: parseFloat(amount),
          interest_rate: parseFloat(interestRate),
          num_installments: parseInt(numInstallments, 10),
          start_date: formatDateLocal(startDate),
          due_date: formatDateLocal(dueDate),
          frequency,
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
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.navigate('Dashboard')}>
          <Image source={BackIcon} style={styles.iconBack} />
        </TouchableOpacity>

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
              <Text style={styles.tableCell}>{row.monto}</Text>
              <Text style={styles.tableCell}>{row.montoAtraso}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.button} onPress={handleCreateLoan}>
        <Text style={styles.buttonText}>GENERAR CONTRATO</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 64,
    paddingBottom: 70,
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
});

export default CreateLoanScreen;
