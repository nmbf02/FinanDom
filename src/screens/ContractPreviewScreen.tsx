import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme/ThemeContext';

const BackIcon = require('../assets/icons/back.png');

const ContractPreviewScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { t } = useTranslation();
  const { theme } = useTheme();
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
  const contractText = `${t('contractPreview.title')}\n\n${t('contractPreview.between')}:\n\n${clientName || t('contractPreview.lenderName')}, ${t('contractPreview.ofLegalAge')}, ${t('contractPreview.holderOfId')} No. ${clientIdentification || '__________'}, ${t('contractPreview.withAddress')} Santiago de los Caballeros, ${t('contractPreview.dominicanRepublic')}, ${t('contractPreview.hereinafter')} "${t('contractPreview.theLender')}".\n\n${t('contractPreview.and')}:\n\n${clientName || t('contractPreview.borrowerName')}, ${t('contractPreview.ofLegalAge')}, ${t('contractPreview.holderOfId')} No. ___________, ${t('contractPreview.withAddress')} Santiago de los Caballeros, ${t('contractPreview.dominicanRepublic')}, ${t('contractPreview.hereinafter')} "${t('contractPreview.theBorrower')}".\n\n${t('contractPreview.bothParties')} ${t('contractPreview.haveAgreed')} ${t('contractPreview.toEnterInto')} ${t('contractPreview.thisLoanAgreement')}, ${t('contractPreview.whichShallBeGoverned')} ${t('contractPreview.byTheFollowingClauses')}:\n\n${t('contractPreview.first')}: ${t('contractPreview.objectOfAgreement')}\n${t('contractPreview.theLender')} ${t('contractPreview.deliversAsLoan')} ${t('contractPreview.toTheBorrower')} ${t('contractPreview.theSumOf')} RD$${parseFloat(String(amount || 0)).toLocaleString('es-DO', { minimumFractionDigits: 2 })} (${amount ? Number(amount).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' }) : '__________'}), ${t('contractPreview.withTotalInterest')} ${interestRate || '___'}% ${t('contractPreview.onBorrowedCapital')}.\n\n${t('contractPreview.second')}: ${t('contractPreview.totalAmountAndPaymentMethod')}\n${t('contractPreview.totalAmountToBePaid')} ${t('contractPreview.byTheBorrower')} ${t('contractPreview.willBe')} RD$${totalWithInterest || '__________'} (${totalWithInterest ? Number(totalWithInterest).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' }) : '__________'}).\n\n${t('contractPreview.saidAmount')} ${t('contractPreview.willBePaid')} ${t('contractPreview.in')} ${numInstallments || '___'} ${t('contractPreview.equalMonthlyInstallments')} ${t('contractPreview.of')} RD$${((parseFloat(String(totalWithInterest || 0)) / Number(numInstallments || 1)) || 0).toLocaleString('es-DO', { minimumFractionDigits: 2 })} ${t('contractPreview.each')}, ${t('contractPreview.whichMustBePaid')} ${t('contractPreview.noLaterThan')} ${t('contractPreview.the30thDayOfEachMonth')}, ${t('contractPreview.beginning')} ${startDate || '___'}.\n\n${t('contractPreview.theBorrower')} ${t('contractPreview.willHave')} ${t('contractPreview.aGracePeriod')} ${t('contractPreview.ofFiveDays')} ${t('contractPreview.afterThe30thDay')} ${t('contractPreview.ofEachMonth')} ${t('contractPreview.toMakePayment')} ${t('contractPreview.withoutPenalty')}.\n\n${t('contractPreview.third')}: ${t('contractPreview.lateInterest')}\n${t('contractPreview.inCaseOfDelay')} ${t('contractPreview.greaterThanFiveDays')} ${t('contractPreview.inPayment')} ${t('contractPreview.ofAnyInstallment')}, ${t('contractPreview.theBorrower')} ${t('contractPreview.mustPay')} ${t('contractPreview.lateInterest')} ${t('contractPreview.equivalentTo')} 2% ${t('contractPreview.monthly')} ${t('contractPreview.onTotalAccumulated')} ${t('contractPreview.overdueAmount')} (${t('contractPreview.includingOverdueInstallments')} ${t('contractPreview.andGeneratedLateFees')}).\n\n${t('contractPreview.eachMonth')} ${t('contractPreview.thatPasses')} ${t('contractPreview.withoutPayment')}, ${t('contractPreview.accumulatedAmount')} (${t('contractPreview.overdueInstallments')} ${t('contractPreview.plusLateFees')}) ${t('contractPreview.willBe')} ${t('contractPreview.newBase')} ${t('contractPreview.forCalculation')} ${t('contractPreview.ofAdditionalLateFee')}.\n${t('contractPreview.lateFee')} ${t('contractPreview.willBeCapitalized')} ${t('contractPreview.monthByMonth')} ${t('contractPreview.whilePaymentDefault')} ${t('contractPreview.persists')}, ${t('contractPreview.increasingTotalBalance')} ${t('contractPreview.owed')}.\n\n${t('contractPreview.fourth')}: ${t('contractPreview.nonComplianceAndEarlyMaturity')}\n${t('contractPreview.nonCompliance')} ${t('contractPreview.ofTwoConsecutiveInstallments')} ${t('contractPreview.willEnable')} ${t('contractPreview.theLender')} ${t('contractPreview.toDemand')} ${t('contractPreview.immediatePayment')} ${t('contractPreview.andTotal')} ${t('contractPreview.ofOutstandingBalance')} ${t('contractPreview.ofLoan')}, ${t('contractPreview.plusAccumulatedInterest')} ${t('contractPreview.andLateFees')}, ${t('contractPreview.withoutJudicialDeclaration')}.\n\n${t('contractPreview.fifth')}: ${t('contractPreview.jurisdiction')}\n${t('contractPreview.forAllLegalPurposes')}, ${t('contractPreview.partiesAgree')} ${t('contractPreview.toSubmit')} ${t('contractPreview.toCourts')} ${t('contractPreview.ofJurisdiction')} ${t('contractPreview.ofSantiago')}, ${t('contractPreview.waivingAnyOther')} ${t('contractPreview.jurisdiction')} ${t('contractPreview.thatMightCorrespond')} ${t('contractPreview.toThem')} ${t('contractPreview.byReason')} ${t('contractPreview.ofTheirDomicile')}.\n\n${t('contractPreview.sixth')}: ${t('contractPreview.acceptance')}\n${t('contractPreview.readThisAgreement')} ${t('contractPreview.andBothParties')} ${t('contractPreview.informed')} ${t('contractPreview.ofItsContent')} ${t('contractPreview.andLegalConsequences')}, ${t('contractPreview.signIt')} ${t('contractPreview.inTwoCopies')} ${t('contractPreview.ofSameTenor')} ${t('contractPreview.andLegalEffect')}, ${t('contractPreview.inSantiago')}, ${t('contractPreview.onThe')} ${new Date().getDate()} ${t('contractPreview.daysOfTheMonth')} ${t('contractPreview.of')} ${new Date().toLocaleString('es-DO', { month: 'long' })} ${t('contractPreview.ofTheYear')} ${new Date().getFullYear()}.`;

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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={BackIcon} style={[styles.iconBack, { tintColor: theme.muted }]} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>{t('contractPreview.previewTitle')}</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={[styles.scroll, { backgroundColor: theme.background }]} contentContainerStyle={{ paddingBottom: 32 }}>
        <Text style={[styles.contractText, { color: theme.text }]}>{contractText}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={[styles.signButton, { backgroundColor: theme.primary }]} onPress={handleAccept}>
            <Text style={[styles.signButtonText, { color: theme.text }]}>{t('contractPreview.sign')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cancelButton, { backgroundColor: theme.card }]} onPress={() => navigation.goBack()}>
            <Text style={[styles.cancelButtonText, { color: theme.text }]}>{t('common.cancel')}</Text>
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