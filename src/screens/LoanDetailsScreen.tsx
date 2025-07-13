import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import { Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

const BackIcon = require('../assets/icons/back.png');
const PencilIcon = require('../assets/icons/edit.png'); // Usa tu icono de lápiz aquí
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const user = require('../assets/icons/user-setting.png');

const LoanDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
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
  const { theme } = useTheme();

  const handleGenerateAndOpenPDF = async () => {
    try {
      const htmlContent = `
        <h2 style="text-align:center;">${t('loanDetails.contractTitle')}</h2>
        <p><b>${t('loanDetails.loanAmount')}:</b> RD$${parseFloat(String(amount || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</p>
        <p><b>${t('loanDetails.installments')}:</b> ${numInstallments}</p>
        <p><b>${t('loanDetails.totalAmount')}:</b> RD$${parseFloat(String(totalWithInterest || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</p>
        <p style="margin-top:24px;">${t('loanDetails.contractDescription')}</p>
      `;
      const options = {
        html: htmlContent,
        fileName: `${t('loanDetails.contractFileName')}_${Date.now()}`,
        directory: Platform.OS === 'ios' ? 'Documents' : 'Download',
      };
      const file = await RNHTMLtoPDF.convert(options);
      if (file.filePath) {
        await FileViewer.open(file.filePath, { showOpenWithDialog: true });
      } else {
        Alert.alert(t('common.error'), t('loanDetails.pdfGenerationError'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('loanDetails.pdfOpenError'));
      console.error('PDF error:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={BackIcon} style={[styles.iconBack, { tintColor: theme.muted }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('loanDetails.title')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.successTitle, { color: theme.primary }]}>{t('loanDetails.successTitle')}</Text>
        <Text style={[styles.subtitle, { color: theme.muted }]}>{t('loanDetails.subtitle')}</Text>

        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.text }]}>{t('loanDetails.loanAmount')}:</Text>
          <Text style={[styles.dataValue, { color: theme.text }]}>RD$ {parseFloat(String(amount || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.text }]}>{t('loanDetails.installments')}:</Text>
          <Text style={[styles.dataValue, { color: theme.text }]}>{numInstallments}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.text }]}>{t('loanDetails.totalAmount')}:</Text>
          <Text style={[styles.dataValue, { color: theme.text }]}>RD$ {parseFloat(String(totalWithInterest || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.text }]}>{t('loanDetails.client')}:</Text>
          <Text style={[styles.dataValue, { color: theme.text }]}>{clientName || '-'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.text }]}>{t('loanDetails.identification')}:</Text>
          <Text style={[styles.dataValue, { color: theme.text }]}>{clientIdentification || '-'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.text }]}>{t('loanDetails.startDate')}:</Text>
          <Text style={[styles.dataValue, { color: theme.text }]}>{startDate || '-'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.text }]}>{t('loanDetails.frequency')}:</Text>
          <Text style={[styles.dataValue, { color: theme.text }]}>{frequency || '-'}</Text>
        </View>
        <View style={styles.dataRow}>
          <Text style={[styles.dataLabel, { color: theme.text }]}>{t('loanDetails.interest')}:</Text>
          <Text style={[styles.dataValue, { color: theme.text }]}>{interestRate ? `${interestRate}%` : '-'}</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.muted }]}>{t('loanDetails.signedContract')}</Text>

        <TouchableOpacity style={[styles.contractButton, { backgroundColor: theme.card }]} onPress={handleGenerateAndOpenPDF}>
          <Image source={PencilIcon} style={[styles.pencilIcon, { tintColor: theme.muted }]} />
          <Text style={[styles.contractButtonText, { color: theme.text }]}>{t('loanDetails.viewContract')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.greenButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.greenButtonText, { color: theme.text }]}>{t('loanDetails.recordPayment')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.greenButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.greenButtonText, { color: theme.text }]}>{t('loanDetails.viewPaymentCalendar')}</Text>
        </TouchableOpacity>
      </View>

      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { backgroundColor: theme.card }]}>
        <TouchableOpacity onPress={() => (navigation as any).navigate('Dashboard')}>
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