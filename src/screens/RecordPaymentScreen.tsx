import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, Platform, Modal, FlatList, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { API_BASE_URL } from '../api/config';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

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
  const { t } = useTranslation();
  const loan = route.params?.loan || {};
  const { theme } = useTheme();

  // Datos generales del préstamo
  const totalInstallments = Number(loan.num_installments) || 0;
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
  const [loanPayments, setLoanPayments] = useState<any[]>([]);

  // Traer cuotas pendientes y pagos al cargar
  useEffect(() => {
    if (loan?.id) {
      // Función para actualizar cuotas faltantes
      const updateInstallments = async () => {
        try {
          // Verificar estructura de la tabla
          const structureRes = await fetch(`${API_BASE_URL}/api/loans/check-structure`);
          const structureData = await structureRes.json();
          console.log('Estructura de tabla:', structureData);
          
          if (structureData.needsUpdate) {
            console.log('Agregando columnas faltantes...');
            await fetch(`${API_BASE_URL}/api/loans/add-missing-columns`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              }
            });
          }
          
          // Actualizar cuotas faltantes
          const updateRes = await fetch(`${API_BASE_URL}/api/loans/${loan.id}/update-installments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          const updateData = await updateRes.json();
          console.log('Cuotas faltantes actualizadas:', updateData);
        } catch (error) {
          console.error('Error actualizando cuotas faltantes:', error);
        }
      };

      // Ejecutar actualización
      updateInstallments();

      // Verificar y generar cuotas si es necesario
      const checkAndGenerateInstallments = async () => {
        try {
          const checkInstallmentsRes = await fetch(`${API_BASE_URL}/api/loans/${loan.id}/check-installments`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          const checkData = await checkInstallmentsRes.json();
          console.log('Verificación de cuotas:', checkData);
        } catch (error) {
          console.error('Error verificando cuotas:', error);
        }
      };
      
      checkAndGenerateInstallments();

      // Cargar cuotas pendientes
      fetch(`${API_BASE_URL}/api/installments?loan_id=${loan.id}&status=pendiente`)
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
          }
          return res.json();
        })
        .then(data => {
          const installments = Array.isArray(data) ? data : [];
          setPendingInstallments(installments);
          // Solo inicializar selectedInstallments si está vacío o es 0
          if (installments.length > 0 && (selectedInstallments === '' || selectedInstallments === '0')) {
            setSelectedInstallments('1');
          }
        })
        .catch(error => {
          const errorMsg = error instanceof Error ? error.message : String(error);
          Alert.alert(t('payment.loadingInstallments'), errorMsg);
          setPendingInstallments([]);
          console.error('Error cargando cuotas:', error);
        });

      // Cargar pagos del préstamo
      fetch(`${API_BASE_URL}/api/payments?loan_id=${loan.id}`)
        .then(async res => {
          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`HTTP ${res.status}: ${errorText}`);
          }
          return res.json();
        })
        .then(data => {
          const payments = Array.isArray(data) ? data : [];
          setLoanPayments(payments);
        })
        .catch(error => {
          const errorMsg = error instanceof Error ? error.message : String(error);
          Alert.alert(t('payment.loadingPayments'), errorMsg);
          setLoanPayments([]);
          console.error('Error cargando pagos:', error);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loan?.id]); // Removido selectedInstallments de las dependencias para evitar re-ejecución

  // Calcular monto a abonar sumando las primeras N cuotas pendientes
  useEffect(() => {
    // Solo calcular automáticamente si selectedInstallments es un número válido
    const cuotas = parseInt(selectedInstallments, 10);
    if (isNaN(cuotas) || cuotas <= 0) return;
    
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
      .then(async res => {
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errorText}`);
        }
        return res.json();
      })
      .then(data => setPaymentMethods(data))
      .catch(error => {
        const errorMsg = error instanceof Error ? error.message : String(error);
        Alert.alert(t('payment.loadingPaymentMethods'), errorMsg);
        setPaymentMethods([
          { id: 1, name: 'Efectivo' },
          { id: 2, name: 'Cheque' },
          { id: 3, name: 'Transferencia' },
          { id: 4, name: 'Tarjeta' },
          { id: 5, name: 'Otros' },
        ]);
        console.error('Error cargando métodos de pago:', error);
      });
  }, [t]);

  const handleGeneratePDF = () => {
    Alert.alert('PDF', t('payment.pdfMessage'));
  };

  const handleConfirmPayment = async () => {
    try {
      // Validar campos obligatorios
      if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
        Alert.alert(t('payment.error'), t('payment.amountError'));
        return;
      }

      // Obtener las cuotas seleccionadas
      const cuotas = parseInt(selectedInstallments, 10) || 0;
      const cuotasSeleccionadas = pendingInstallments.slice(0, cuotas);
      const installmentIds = cuotasSeleccionadas.map(cuota => cuota.id);

      // Obtener el nombre del método de pago
      const paymentMethodName = paymentMethods.find(m => m.id === paymentMethodId)?.name || 'Efectivo';

      // Preparar datos del pago
      const paymentData = {
        loan_id: loan.id,
        amount_paid: parseFloat(paymentAmount),
        payment_date: paymentDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
        method: paymentMethodName.toLowerCase(),
        installment_ids: installmentIds,
        reference: reference || null
      };

      console.log('Enviando pago:', paymentData);

      // Llamar al endpoint
      const response = await fetch(`${API_BASE_URL}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error del backend:', errorText);
        Alert.alert(t('payment.error'), t('payment.paymentError'));
        return;
      }

      const result = await response.json();
      console.log('Pago registrado exitosamente:', result);
      
      // Actualizar cuotas faltantes después del pago
      try {
        await fetch(`${API_BASE_URL}/api/loans/${loan.id}/update-installments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        console.log('Cuotas faltantes actualizadas después del pago');
      } catch (updateError) {
        console.error('Error actualizando cuotas faltantes después del pago:', updateError);
      }
      
      // Navegar a la pantalla de éxito
      navigation.navigate('PaymentSuccessScreen');
      
    } catch (error) {
      console.error('Error al registrar pago:', error);
      Alert.alert(t('payment.error'), t('payment.connectionError'));
    }
  };

  // Filtro de métodos de pago
  const filteredPaymentMethods = paymentMethods.filter(m => m.name.toLowerCase().includes(searchPayment.toLowerCase()));

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backIcon} style={[styles.backIcon, { tintColor: theme.muted }]} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('payment.title')}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Información del Préstamo */}
        <Text style={[styles.sectionTitle, { color: theme.muted }]}>{t('payment.loanInfo')}</Text>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.client')}</Text><Text style={[styles.infoValue, { color: theme.text }]}>{loan.client_name || '-'}</Text></View>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.loanNumber')}</Text><Text style={[styles.infoValue, { color: theme.text }]}>{loan.id || '-'}</Text></View>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.status')}</Text><Text style={[styles.infoValue, { color: theme.text }]}>{loan.status || '-'}</Text></View>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.startDate')}</Text><Text style={[styles.infoValue, { color: theme.text }]}>{loan.start_date || '-'}</Text></View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.loanAmount')}</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>{formatCurrency(totalLoanAmount)}</Text>
        </View>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.paidAmount')}</Text><Text style={[styles.infoValue, { color: theme.text }]}>{formatCurrency(paidAmount)}</Text></View>
        <View style={styles.infoRow}><Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.totalInstallments')}</Text><Text style={[styles.infoValue, { color: theme.text }]}>{totalInstallments}</Text></View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.missingInstallments')}</Text>
          <Text style={[styles.infoValue, { color: theme.text }]}>
            {totalInstallments - loanPayments.length}
          </Text>
        </View>

        {/* Abono a Préstamo */}
        <Text style={[styles.sectionTitle, { color: theme.muted }]}>{t('payment.paymentSection')}</Text>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.paymentDate')}</Text>
          <TouchableOpacity style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setShowDatePicker(true)}>
            <Text style={{ color: theme.text }}>{paymentDate.toLocaleDateString()}</Text>
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
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.selectInstallments')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            value={selectedInstallments}
            onChangeText={text => {
              // Permitir cualquier valor mientras escribe, pero solo números
              const cleanText = text.replace(/[^0-9]/g, '');
              setSelectedInstallments(cleanText);
            }}
            onBlur={() => {
              // Al salir del campo, corregir si es vacío o menor que 1
              let num = parseInt(selectedInstallments, 10);
              if (isNaN(num) || num < 1) {
                num = 1;
              } else if (num > pendingInstallments.length && pendingInstallments.length > 0) {
                num = pendingInstallments.length;
              }
              setSelectedInstallments(String(num));
            }}
            keyboardType="numeric"
            placeholder={`1 - ${pendingInstallments.length}`}
            placeholderTextColor={theme.muted}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.amountToPay')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
            value={paymentAmount}
            onChangeText={setPaymentAmount}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={theme.muted}
          />
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, { color: theme.muted }]}>{t('payment.paymentMethod')}</Text>
          <View style={styles.paymentRow}>
            <TouchableOpacity style={[styles.paymentInput, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => setShowPaymentModal(true)}>
              <Text style={{ color: paymentMethodId ? theme.text : theme.muted }}>
                {paymentMethods.find(m => m.id === paymentMethodId)?.name || t('payment.selectMethod')}
              </Text>
            </TouchableOpacity>
            {paymentMethods.find(m => m.id === paymentMethodId)?.name === 'Transferencia' && (
              <TextInput
                style={[styles.referenceInput, { backgroundColor: theme.card, borderColor: theme.border, color: theme.text }]}
                placeholder={t('payment.reference')}
                placeholderTextColor={theme.muted}
                value={reference}
                onChangeText={setReference}
              />
            )}
          </View>
        </View>

        {/* Botones */}
        <TouchableOpacity style={[styles.pdfButton, { backgroundColor: theme.secondary }]} onPress={handleGeneratePDF}>
          <Text style={[styles.pdfButtonText, { color: theme.text }]}>{t('payment.generatePDF')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.confirmButton, { backgroundColor: theme.primary }]} onPress={handleConfirmPayment}>
          <Text style={[styles.confirmButtonText, { color: theme.text }]}>{t('payment.confirmPayment')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Navbar */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}> 
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={chat} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={calendar} style={[styles.navIcon, { tintColor: theme.primary }]} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={user} style={[styles.navIcon, { tintColor: theme.primary }]} />
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
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}> 
            <Text style={[styles.modalTitle, { color: theme.text }]}>{t('payment.paymentMethodModal')}</Text>
            <TextInput
              style={[styles.modalSearch, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder={t('payment.search')}
              placeholderTextColor={theme.muted}
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
                  <Text style={[styles.modalItemText, { color: theme.text }]}>{item.name}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ textAlign: 'center', color: theme.muted, marginTop: 16 }}>{t('payment.noResults')}</Text>}
              style={{ maxHeight: 250 }}
            />
            <TouchableOpacity style={[styles.modalCloseButton, { backgroundColor: theme.primary }]} onPress={() => setShowPaymentModal(false)}>
              <Text style={[styles.modalCloseButtonText, { color: theme.card }]}>{t('payment.close')}</Text>
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