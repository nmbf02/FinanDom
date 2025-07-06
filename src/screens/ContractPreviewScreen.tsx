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
    interestRate
  } = (route.params || {}) as {
    amount?: number | string;
    numInstallments?: number | string;
    totalWithInterest?: number | string;
    clientName?: string;
    clientIdentification?: string;
    startDate?: string;
    frequency?: string;
    interestRate?: number | string;
  };

  // Contrato dinámico (puedes personalizarlo más)
  const contractText = `CONTRATO DE PRÉSTAMO\n\nEntre: ${clientName || 'Nombre del Cliente'}, portador de la cédula ${clientIdentification || '---'} ("La Prestataria").\n\nLa suma de RD$${parseFloat(String(amount || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })} será pagada en ${numInstallments} cuotas de RD$${((parseFloat(String(totalWithInterest || 0)) / Number(numInstallments || 1)) || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })} cada una, con un interés de ${interestRate}% sobre el capital.\n\nEl pago inicia el ${startDate || '---'} con frecuencia ${frequency || '---'}.\n\nEl monto total a pagar será RD$${parseFloat(String(totalWithInterest || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}.\n\n(Agrega aquí más cláusulas y condiciones legales según tu modelo)`;

  const handleSign = () => {
    (navigation as any).navigate('SignContractScreen', {
      amount,
      numInstallments,
      totalWithInterest,
      clientName,
      clientIdentification,
      startDate,
      frequency,
      interestRate,
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
          <TouchableOpacity style={styles.signButton} onPress={handleSign}>
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