import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Signature from 'react-native-signature-canvas';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

const BackIcon = require('../assets/icons/back.png');

const SignContractScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { amount, numInstallments, /* totalWithInterest, */ clientName, clientIdentification, startDate, frequency, interestRate, client_id, late_fee_type_id, late_days, late_percent, contract_pdf_url } = (route.params || {}) as {
    amount?: number | string;
    numInstallments?: number | string;
    // totalWithInterest?: number | string;
    clientName?: string;
    clientIdentification?: string;
    startDate?: string;
    frequency?: string;
    interestRate?: number | string;
    client_id?: string;
    late_fee_type_id?: string;
    late_days?: number | string;
    late_percent?: number | string;
    contract_pdf_url?: string;
  };
  const signatureRef = useRef<any>(null);
  const [_signature, setSignature] = useState<string | null>(null);

  const handleSignature = (signatureData: string) => {
    setSignature(signatureData);
  };

  const handleAccept = () => {
    (navigation as any).navigate('LoanDetails', {
      amount,
      numInstallments,
      clientName,
      clientIdentification,
      client_id,
      startDate,
      frequency,
      interestRate,
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
        <Text style={styles.title}>{t('contract.title')}</Text>
        <View style={{ width: 24 }} /> {/* Espacio para alinear */}
      </View>
      <Text style={styles.subtitle}>{t('contract.subtitle')}</Text>
      <View style={styles.signatureContainer}>
        <Signature
          ref={signatureRef}
          onOK={handleSignature}
          descriptionText={t('contract.signaturePlaceholder')}
          clearText={t('contract.clearText')}
          confirmText={t('contract.confirmText')}
          webStyle={signaturePadStyle}
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleAccept}>
        <Text style={styles.buttonText}>{t('contract.acceptButton')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const signaturePadStyle = `
  .m-signature-pad--footer {display: none; margin: 0px;}
  .m-signature-pad {box-shadow: none; border: 1px solid #eee;}
  .m-signature-pad--body {border-radius: 8px;}
  .m-signature-pad--body canvas {background-color: #fff; border-radius: 8px;}
  .m-signature-pad--description {color: #888; font-size: 16px; text-align: center; margin-bottom: 8px;}
`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: 'flex-start',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBack: {
    width: 24,
    height: 24,
    tintColor: '#888',
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4A5568',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  signatureContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
    overflow: 'hidden',
    height: 220,
  },
  button: {
    backgroundColor: '#1CC88A',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default SignContractScreen; 