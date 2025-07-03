import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform, Image } from 'react-native';
import { API_BASE_URL } from '../api/config';
import * as DocumentPicker from 'react-native-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const BackIcon = require('../assets/icons/back.png');

const frequencies = [
  { label: 'Semanal', value: 'semanal', days: 7 },
  { label: 'Quincenal', value: 'quincenal', days: 15 },
  { label: 'Mensual', value: 'mensual', days: 30 },
];

const CreateLoanScreen = ({ navigation }: any) => {
  const [clientId, setClientId] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [numInstallments, setNumInstallments] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [frequency, setFrequency] = useState(frequencies[0].value);
  const [pdf, setPdf] = useState<any>(null);
  const [lateDays, setLateDays] = useState('5');
  const [latePercent, setLatePercent] = useState('5');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [installments, setInstallments] = useState<any[]>([]);

  const handlePickPdf = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],
      });
      setPdf(res[0]);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // Usuario canceló
      } else {
        throw err;
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
          start_date: startDate.toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
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
    } catch (error) {
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backIcon} onPress={() => navigation.goBack()}>
        <Image source={BackIcon} style={styles.backIconImage} />
      </TouchableOpacity>
      <Text style={styles.title}>Crear Préstamo</Text>
      <TextInput style={styles.input} placeholder="ID Cliente" value={clientId} onChangeText={setClientId} />
      <TextInput style={styles.input} placeholder="Monto del préstamo" value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Interés (%)" value={interestRate} onChangeText={setInterestRate} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="# de Cuotas" value={numInstallments} onChangeText={setNumInstallments} keyboardType="numeric" />
      <TouchableOpacity style={styles.input} onPress={() => setShowStartPicker(true)}>
        <Text>{`Fecha de inicio: ${startDate.toISOString().split('T')[0]}`}</Text>
      </TouchableOpacity>
      {showStartPicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleStartDateChange}
        />
      )}
      <View style={styles.inputRow}>
        <Text style={styles.marginRight8}>Frecuencia de pago:</Text>
        {frequencies.map(f => (
          <TouchableOpacity
            key={f.value}
            style={[styles.freqButton, frequency === f.value && styles.freqButtonActive]}
            onPress={() => setFrequency(f.value)}
          >
            <Text style={[
              styles.freqButtonText,
              frequency === f.value && styles.freqButtonTextActive
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TextInput style={styles.input} placeholder="Días de gracia para mora" value={lateDays} onChangeText={setLateDays} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="% de recargo por mora" value={latePercent} onChangeText={setLatePercent} keyboardType="numeric" />
      <TouchableOpacity style={styles.input} onPress={handlePickPdf}>
        <Text>{pdf ? `PDF seleccionado: ${pdf.name}` : 'Agregar documento PDF'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.calcButton} onPress={handleCalculateInstallments}>
        <Text style={styles.calcButtonText}>Calcular Cuota</Text>
      </TouchableOpacity>
      {installments.length > 0 && (
        <View style={styles.tableContainer}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Cuota</Text>
            <Text style={styles.tableCell}>Fecha Estimada</Text>
            <Text style={styles.tableCell}>Monto a Pagar</Text>
            <Text style={styles.tableCell}>Con Atraso</Text>
          </View>
          {installments.map((row, idx) => (
            <View key={idx} style={styles.tableRow}>
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
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  backIcon: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  backIconImage: {
    width: 28,
    height: 28,
    tintColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  freqButton: {
    borderWidth: 1,
    borderColor: '#1CC88A',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
  },
  freqButtonActive: {
    backgroundColor: '#1CC88A',
    borderColor: '#1CC88A',
  },
  freqButtonText: {
    color: '#1CC88A',
  },
  freqButtonTextActive: {
    color: '#fff',
  },
  calcButton: {
    backgroundColor: '#A7C7E7',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
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
    marginTop: 16,
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
    paddingVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingVertical: 8,
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
  },
  marginRight8: {
    marginRight: 8,
  },
});

export default CreateLoanScreen; 