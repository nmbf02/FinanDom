import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import { Platform } from 'react-native';

const BackIcon = require('../assets/icons/back.png');
const PencilIcon = require('../assets/icons/edit.png'); // Usa tu icono de lápiz aquí
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');

const LoanDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { amount, numInstallments, totalWithInterest, clientName, clientIdentification, startDate, frequency, interestRate } = (route.params || {}) as {
    amount?: number | string;
    numInstallments?: number | string;
    totalWithInterest?: number | string;
    clientName?: string;
    clientIdentification?: string;
    startDate?: string;
    frequency?: string;
    interestRate?: number | string;
  };

  const handleGenerateAndOpenPDF = async () => {
    try {
      const htmlContent = `
        <h2 style="text-align:center;">CONTRATO DE PRÉSTAMO</h2>
        <p><b>Monto Prestado:</b> RD$${parseFloat(String(amount || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</p>
        <p><b>Cuotas:</b> ${numInstallments}</p>
        <p><b>Monto Total:</b> RD$${parseFloat(String(totalWithInterest || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</p>
        <p style="margin-top:24px;">Este es un ejemplo de contrato generado dinámicamente. Aquí puedes incluir todas las cláusulas y datos relevantes del préstamo, así como las firmas digitalizadas.</p>
      `;
      const options = {
        html: htmlContent,
        fileName: `ContratoPrestamo_${Date.now()}`,
        directory: Platform.OS === 'ios' ? 'Documents' : 'Download',
      };
      const file = await RNHTMLtoPDF.convert(options);
      if (file.filePath) {
        await FileViewer.open(file.filePath, { showOpenWithDialog: true });
      } else {
        Alert.alert('Error', 'No se pudo generar el PDF.');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo abrir el PDF.');
      console.error('PDF error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={BackIcon} style={styles.iconBack} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Loan Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.successTitle}>Registro exitoso!</Text>
        <Text style={styles.subtitle}>Resumen del Préstamo</Text>

        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Monto Prestado:</Text>
          <Text style={styles.dataValue}>RD$ {parseFloat(String(amount || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Cuotas:</Text>
          <Text style={styles.dataValue}>{numInstallments}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Monto Total:</Text>
          <Text style={styles.dataValue}>RD$ {parseFloat(String(totalWithInterest || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Cliente:</Text>
          <Text style={styles.dataValue}>{clientName || '-'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Cédula:</Text>
          <Text style={styles.dataValue}>{clientIdentification || '-'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Fecha inicio:</Text>
          <Text style={styles.dataValue}>{startDate || '-'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Frecuencia:</Text>
          <Text style={styles.dataValue}>{frequency || '-'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataLabel}>Interés:</Text>
          <Text style={styles.dataValue}>{interestRate ? `${interestRate}%` : '-'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Contrato Firmado</Text>

        <TouchableOpacity style={styles.contractButton} onPress={handleGenerateAndOpenPDF}>
          <Image source={PencilIcon} style={styles.pencilIcon} />
          <Text style={styles.contractButtonText}>VER CONTRATO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.greenButton}>
          <Text style={styles.greenButtonText}>REGISTRAR PAGO</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.greenButton}>
          <Text style={styles.greenButtonText}>VER CALENDARIO DE PAGOS</Text>
        </TouchableOpacity>
      </View>

      {/* Navbar inferior */}
      <View style={styles.bottomNav}>
        <TouchableOpacity>
          <Image source={home} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={chat} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={user} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity>
          <Image source={calendar} style={styles.navIcon} />
        </TouchableOpacity>
      </View>
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
    tintColor: '#B0B0B0',
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    color: '#B0B0B0',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'left',
  },
  subtitle: {
    fontSize: 18,
    color: '#4A5568',
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'left',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dataLabel: {
    fontSize: 16,
    color: '#222',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 16,
    color: '#222',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 10,
  },
  contractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3EAFE',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  pencilIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#6B7280',
  },
  contractButtonText: {
    color: '#374151',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greenButton: {
    backgroundColor: '#1CC88A',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  greenButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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
});

export default LoanDetailsScreen; 