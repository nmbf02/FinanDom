import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Platform, Modal, FlatList, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../api/config';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const backIcon = require('../assets/icons/back.png');
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');

type RootStackParamList = {
  LoanList: undefined;
  PaymentSuccessScreen: undefined;
  Dashboard: undefined;
  // ...other screens
};

function formatCurrency(num: string | number) {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  return `RD$ ${n.toLocaleString('es-DO', { minimumFractionDigits: 2 })}`;
}

const RecordPaymentScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<any>();
  const loan = route.params?.loan || {};

  // Datos generales del préstamo
  const totalInstallments = Number(loan.num_installments) || 0;
  const paidInstallments = Number(loan.paid_installments) || 0;
  const remainingInstallments = totalInstallments - (paidInstallments || 0);
  const totalLoanAmount = Number(loan.total_with_interest) || (Number(loan.amount) + (Number(loan.amount) * Number(loan.interest_rate || 0) / 100));
  const paidAmount = Number(loan.paid_amount) || 0.00;

  // Editables
  const [selectedInstallments, setSelectedInstallments] = useState('1');
  const [paymentAmount, setPaymentAmount] = useState(String(totalLoanAmount));
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [paymentMethodId, setPaymentMethodId] = useState<number>(1);
  const [paymentMethods, setPaymentMethods] = useState<{id: number, name: string}[]>([]);
  const [reference, setReference] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchPayment, setSearchPayment] = useState('');
  const [pendingInstallments, setPendingInstallments] = useState<any[]>([]);

  // Traer cuotas pendientes al cargar
  useEffect(() => {
    if (loan?.id) {
      fetch(`${API_BASE_URL}/api/installments?loan_id=${loan.id}&status=pendiente`)
        .then(res => res.json())
        .then(data => setPendingInstallments(Array.isArray(data) ? data : []));
    }
  }, [loan?.id]);

  // Calcular monto a abonar sumando las primeras N cuotas pendientes
  useEffect(() => {
    const cuotas = parseInt(selectedInstallments, 10) || 0;
    const cuotasSeleccionadas = pendingInstallments.slice(0, cuotas);
    const today = new Date();
    const moraPercent = parseFloat(loan.late_percent || '0') / 100;
    let total = 0;

    console.log('Calculando monto:', { cuotas, cuotasSeleccionadas: cuotasSeleccionadas.length, pendingInstallments: pendingInstallments.length });

    if (cuotasSeleccionadas.length === 0) {
      // Si no hay cuotas pendientes, calcular basado en el monto total del préstamo
      const cuotaBase = totalLoanAmount / totalInstallments;
      total = cuotaBase * cuotas;
    } else {
      cuotasSeleccionadas.forEach((cuota) => {
        const fechaCuota = new Date(cuota.due_date);
        const isVencida = (cuota.status === 'pendiente') && (fechaCuota < today);
        let monto = Number(cuota.amount_due) || 0;
        if (isVencida) {
          if (loan.late_fee_type_id == 1) { // Mora Fija
            const lateFeeAmount = monto * (moraPercent || 0.02);
            monto += lateFeeAmount;
          } else if (loan.late_fee_type_id == 2) { // Mora por Arrastre
            const lateFeeAmount = monto * (moraPercent || 0.02);
            monto += lateFeeAmount;
          } else {
            monto = monto * (1 + moraPercent);
          }
        }
        total += monto;
      });
    }
    
    console.log('Total calculado:', total);
    setPaymentAmount(total.toFixed(2));
  }, [selectedInstallments, pendingInstallments, loan.late_fee_type_id, loan.late_percent, totalLoanAmount, totalInstallments]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/payment-methods`)
      .then(res => res.json())
      .then(data => setPaymentMethods(data))
      .catch(() => setPaymentMethods([
        { id: 1, name: 'Efectivo' },
        { id: 2, name: 'Cheque' },
        { id: 3, name: 'Transferencia' },
        { id: 4, name: 'Tarjeta' },
        { id: 5, name: 'Otros' },
      ]));
  }, []);

  const handleGeneratePDF = () => {
    Alert.alert('PDF', 'Funcionalidad para generar recibo PDF (pendiente)');
  };

  const handleConfirmPayment = () => {
    // Aquí iría la lógica real de registro
    navigation.navigate('PaymentSuccessScreen');
  };

  // Filtro de métodos de pago
  const filteredPaymentMethods = paymentMethods.filter(m => m.name.toLowerCase().includes(searchPayment.toLowerCase()));

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.title}>Registrar Pago</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Información del Préstamo */}
        <Text style={styles.sectionTitle}>Información del Préstamo</Text>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Cliente</Text><Text style={styles.infoValue}>{loan.client_name || '-'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Préstamo #</Text><Text style={styles.infoValue}>{loan.id || '-'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Estado</Text><Text style={styles.infoValue}>{loan.status || '-'}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Fecha de inicio</Text><Text style={styles.infoValue}>{loan.start_date || '-'}</Text></View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Monto Del Préstamo</Text>
          <Text style={styles.infoValue}>{formatCurrency(totalLoanAmount)}</Text>
        </View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Monto Pagado</Text><Text style={styles.infoValue}>{formatCurrency(paidAmount)}</Text></View>
        <View style={styles.infoRow}><Text style={styles.infoLabel}>Cantidad De Cuotas Total</Text><Text style={styles.infoValue}>{totalInstallments}</Text></View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cuotas Faltantes</Text>
          <Text style={styles.infoValue}>
            {remainingInstallments >= 0 ? remainingInstallments : totalInstallments}
          </Text>
        </View>

        {/* Abono a Préstamo */}
        <Text style={styles.sectionTitle}>Abono a Préstamo</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Seleccionar Cuotas a Pagar</Text>
          <TextInput
            style={styles.input}
            value={selectedInstallments}
            onChangeText={text => {
              // Permitir cualquier valor mientras escribe
              setSelectedInstallments(text.replace(/[^0-9]/g, ''));
            }}
            onBlur={() => {
              // Al salir del campo, corregir si es vacío o menor que 1
              let num = parseInt(selectedInstallments, 10);
              if (isNaN(num) || num < 1) num = 1;
              if (num > pendingInstallments.length) num = pendingInstallments.length;
              setSelectedInstallments(String(num));
            }}
            keyboardType="numeric"
            placeholder={`1 - ${pendingInstallments.length}`}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Monto A Abonar</Text>
          <TextInput
            style={styles.input}
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            keyboardType="numeric"
            placeholder="0.00"
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Método de Pago</Text>
          <View style={styles.paymentRow}>
            <TouchableOpacity style={styles.paymentInput} onPress={() => setShowPaymentModal(true)}>
              <Text style={{ color: paymentMethodId ? '#222' : '#888' }}>
                {paymentMethods.find(m => m.id === paymentMethodId)?.name || 'Selecciona método'}
              </Text>
            </TouchableOpacity>
            {paymentMethods.find(m => m.id === paymentMethodId)?.name === 'Transferencia' && (
              <TextInput
                style={styles.referenceInput}
                placeholder="Referencia"
                value={reference}
                onChangeText={setReference}
              />
            )}
          </View>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Fecha de Pago</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text>{paymentDate.toLocaleDateString()}</Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={paymentDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, date) => {
                setShowDatePicker(false);
                if (date) setPaymentDate(date);
              }}
            />
          )}
        </View>

        {/* Botones */}
        <TouchableOpacity style={styles.pdfButton} onPress={handleGeneratePDF}>
          <Text style={styles.pdfButtonText}>GENERAR RECIBO PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmPayment}>
          <Text style={styles.confirmButtonText}>CONFIRMAR PAGO</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Navbar */}
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

      {/* Modal de métodos de pago */}
      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona método de pago</Text>
            <TextInput
              style={styles.modalSearch}
              placeholder="Buscar..."
              value={searchPayment}
              onChangeText={setSearchPayment}
              autoFocus
            />
            <FlatList
              data={filteredPaymentMethods}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setPaymentMethodId(item.id);
                    setShowPaymentModal(false);
                    setSearchPayment('');
                  }}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 16 }}>No hay resultados</Text>}
              style={{ maxHeight: 250 }}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.modalCloseButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 120,
  },
  scrollContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
    marginTop: 8,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#6B7280',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 18,
    marginBottom: 14,
    paddingLeft: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingHorizontal: 2,
  },
  infoLabel: {
    fontSize: 15,
    color: '#6B7280',
    flex: 1.2,
    paddingRight: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'right',
    paddingLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minWidth: 80,
    textAlign: 'right',
    backgroundColor: '#F9FAFB',
    marginLeft: 8,
    flex: 1,
  },
  pdfButton: {
    backgroundColor: '#A7C7E7',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 14,
  },
  pdfButtonText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 17,
  },
  confirmButton: {
    backgroundColor: '#1CC88A',
    padding: 18,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 28,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
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
  paymentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  paymentInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    padding: 8,
    fontSize: 15,
    minWidth: 90,
    flex: 1,
    marginRight: 8,
  },
  referenceInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    padding: 8,
    fontSize: 15,
    minWidth: 90,
    marginLeft: 8,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 350,
    alignItems: 'stretch',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
    textAlign: 'center',
  },
  modalSearch: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    padding: 8,
    fontSize: 15,
    marginBottom: 12,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalItemText: {
    fontSize: 16,
    color: '#222',
  },
  modalCloseButton: {
    backgroundColor: '#1CC88A',
    padding: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 16,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RecordPaymentScreen; 