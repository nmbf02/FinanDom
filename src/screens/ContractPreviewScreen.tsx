import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const BackIcon = require('../assets/icons/back.png');

const ContractPreviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    amount,
    numInstallments,
    totalWithInterest,
    clientName,
    clientIdentification,
    startDate,
    frequency,
    interestRate,
    client_id,
    late_fee_type_id,
    late_days,
    late_percent,
    contract_pdf_url,
  } = (route.params || {}) as {
    amount?: number | string;
    numInstallments?: number | string;
    totalWithInterest?: number | string;
    clientName?: string;
    clientIdentification?: string;
    startDate?: string;
    frequency?: string;
    interestRate?: number | string;
    client_id?: string;
    late_fee_type_id?: string;
    late_days?: string;
    late_percent?: string;
    contract_pdf_url?: string;
  };

  // Contrato formal y detallado
  const contractText = `CONTRATO DE PRÉSTAMO CON INTERÉS Y CLÁUSULA DE MORA\n\nEntre:\n\n${clientName || 'Nombre del Prestamista'}, mayor de edad, portadora de la cédula de identidad No. ${clientIdentification || '__________'}, con domicilio en Santiago de los Caballeros, República Dominicana, en lo adelante denominada "La Prestamista".\n\nY:\n\n${clientName || 'Nombre del Prestatario'}, mayor de edad, portadora de la cédula de identidad No. ___________, con domicilio en Santiago de los Caballeros, República Dominicana, en lo adelante denominada "La Prestataria".\n\nAmbas partes, libre y voluntariamente, han convenido en celebrar el presente Contrato de Préstamo, el cual se regirá por las cláusulas siguientes:\n\nPRIMERA: OBJETO DEL CONTRATO\nLa Prestamista entrega en calidad de préstamo a la Prestataria la suma de RD$${parseFloat(String(amount || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })} (${amount ? Number(amount).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' }) : '__________'}), con un interés total del ${interestRate || '___'}% sobre el capital prestado.\n\nSEGUNDA: MONTO TOTAL Y FORMA DE PAGO\nEl monto total a pagar por la Prestataria será de RD$${totalWithInterest || '__________'} (${totalWithInterest ? Number(totalWithInterest).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' }) : '__________'}).\n\nDicho monto será pagado en ${numInstallments || '___'} cuotas mensuales iguales de RD$${((parseFloat(String(totalWithInterest || 0)) / Number(numInstallments || 1)) || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })} cada una, las cuales deberán ser abonadas a más tardar los días 30 de cada mes, comenzando el ${startDate || '___'}.\n\nLa Prestataria dispondrá de un período de gracia de cinco (5) días naturales después del día 30 de cada mes para realizar el pago sin penalidad.\n\nTERCERA: INTERESES DE MORA\nEn caso de atraso mayor a cinco (5) días naturales en el pago de cualquier cuota, la Prestataria deberá pagar un interés por mora equivalente al 2% mensual sobre el monto total acumulado vencido (incluyendo cuotas vencidas y moras generadas).\n\nCada mes que transcurra sin pago, el monto acumulado (cuotas vencidas más moras) será la nueva base para el cálculo de la mora adicional.\nLa mora se capitalizará mes a mes mientras persista el incumplimiento de pago, aumentando el saldo total adeudado.\n\nCUARTA: INCUMPLIMIENTO Y VENCIMIENTO ANTICIPADO\nEl incumplimiento de dos (2) cuotas consecutivas facultará a la Prestamista a exigir el pago inmediato y total del saldo pendiente del préstamo, más los intereses y moras acumulados, sin necesidad de declaración judicial.\n\nQUINTA: JURISDICCIÓN\nPara todos los efectos legales, las partes acuerdan someterse a los tribunales de la jurisdicción de Santiago de los Caballeros, renunciando a cualquier otro fuero que pudiera corresponderles por razón de su domicilio.\n\nSEXTA: ACEPTACIÓN\nLeído el presente contrato y enteradas ambas partes de su contenido y consecuencias legales, lo firman en dos ejemplares del mismo tenor y efecto legal, en Santiago de los Caballeros, a los ${new Date().getDate()} días del mes de ${new Date().toLocaleString('es-DO', { month: 'long' })} del año ${new Date().getFullYear()}.`;

  const handleAccept = () => {
    (navigation as any).navigate('LoanDetails', {
      amount,
      num_installments: numInstallments,
      clientName,
      clientIdentification,
      client_id,
      start_date: startDate,
      due_date: startDate, // O el valor real si lo tienes
      frequency,
      interest_rate: interestRate,
      late_fee_type_id,
      late_days,
      late_percent,
      contract_pdf_url,
      // Puedes agregar más campos si los necesitas
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={BackIcon} style={styles.iconBack} />
        </TouchableOpacity>
        <Text style={styles.title}>Vista Previa Del Contrato</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={styles.contractText}>{contractText}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.signButton} onPress={handleAccept}>
            <Text style={styles.signButtonText}>Firmar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  iconBack: {
    width: 24,
    height: 24,
    tintColor: '#888',
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: 24,
  },
  contractText: {
    fontSize: 16,
    color: '#222',
    marginBottom: 32,
    marginTop: 8,
    lineHeight: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  signButton: {
    flex: 1,
    backgroundColor: '#1CC88A',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  signButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ContractPreviewScreen; 