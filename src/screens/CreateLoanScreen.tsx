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
  calculation_type: 'fixed_interval' | 'carry_over';
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
      } else if (selectedLateFeeType?.calculation_type === 'carry_over') {
        // Mora por Arrastre: 5 días de gracia, luego 2% sobre total acumulado
        const lateFeeRate = moraPercent || 0.02;
        
        // Simular el escenario: 2 cuotas vencidas con mora por arrastre
        let cuota1 = cuota; // Primera cuota vencida
        let cuota2 = cuota; // Segunda cuota vencida
        
        // Después de 5 días de gracia, se aplica mora a la primera cuota
        const moraCuota1 = cuota1 * lateFeeRate;
        const totalConMora1 = cuota1 + moraCuota1;
        
        // Cuando vence la segunda cuota, se suma al total anterior y se aplica nueva mora
        const totalAcumulado = totalConMora1 + cuota2;
        const moraTotal = totalAcumulado * lateFeeRate;
        montoAtraso = +(totalAcumulado + moraTotal).toFixed(2);
        
        // Ejemplo: Cuota1(2,300) + Mora1(46) + Cuota2(2,300) + MoraTotal(92.92) = 4,738.92
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
            {lateFeeTypes.find((type: LateFeeType) => type.id.toString() === lateFeeTypeId)?.calculation_type === 'carry_over' && (
              <Text style={styles.moraInfoText}>
                Ejemplo: Cuota1(RD$2,300) + Mora1(RD$46) + Cuota2(RD$2,300) + MoraTotal(RD$92.92) = RD$4,738.92
              </Text>
            )}
          </View>

          {/* Resumen del préstamo */}
          <View style={styles.loanSummaryContainer}>
            <Text style={styles.loanSummaryTitle}>Resumen del Préstamo</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monto prestado:</Text>
              <Text style={styles.summaryValue}>RD$ {parseFloat(amount || '0').toLocaleString('es-DO', {minimumFractionDigits: 2})}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Interés ({interestRate}%):</Text>
              <Text style={styles.summaryValue}>RD$ {(parseFloat(amount || '0') * parseFloat(interestRate || '0') / 100).toLocaleString('es-DO', {minimumFractionDigits: 2})}</Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total a pagar:</Text>
              <Text style={styles.totalValue}>RD$ {(parseFloat(amount || '0') * (1 + parseFloat(interestRate || '0') / 100)).toLocaleString('es-DO', {minimumFractionDigits: 2})}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Número de cuotas:</Text>
              <Text style={styles.summaryValue}>{numInstallments}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monto por cuota:</Text>
              <Text style={styles.summaryValue}>RD$ {((parseFloat(amount || '0') * (1 + parseFloat(interestRate || '0') / 100)) / parseInt(numInstallments || '1')).toLocaleString('es-DO', {minimumFractionDigits: 2})}</Text>
            </View>
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
  loanSummaryContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 2,
    borderTopColor: '#10B981',
    marginTop: 16,
    borderRadius: 8,
  },
  loanSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
  },
});

export default CreateLoanScreen;
