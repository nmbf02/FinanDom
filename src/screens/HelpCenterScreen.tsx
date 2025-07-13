import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Dashboard: undefined;
  CreateLoan: undefined;
  LoanList: undefined;
  Client: { clientId?: number };
  OverduePayments: undefined;
  Assistant: undefined;
  Profile: undefined;
  HelpCenter: undefined;
};

const backIcon = require('../assets/icons/back.png');
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const user = require('../assets/icons/user-setting.png');
const calendar = require('../assets/icons/calendar.png');
const checkmark = require('../assets/icons/checkmark.png');
const faqIcon = require('../assets/icons/help.png'); // Usa el icono más parecido disponible
const contactIcons = {
  'Customer Service': require('../assets/icons/customer-service.png'),
  'Website': require('../assets/icons/website.png'),
  'Whatsapp': require('../assets/icons/whatsapp.png'),
  'Facebook': require('../assets/icons/facebook.png'),
  'Instagram': require('../assets/icons/instagram.png'),
};

const FAQ_DATA = [
  {
    id: '1',
    questionKey: 'helpCenter.faqData.loanRequest.question',
    answerKey: 'helpCenter.faqData.loanRequest.answer',
    category: 'Popular Topic',
  },
  {
    id: '2',
    questionKey: 'helpCenter.faqData.requirements.question',
    answerKey: 'helpCenter.faqData.requirements.answer',
    category: 'General',
  },
  {
    id: '3',
    questionKey: 'helpCenter.faqData.payment.question',
    answerKey: 'helpCenter.faqData.payment.answer',
    category: 'Services',
  },
  {
    id: '4',
    questionKey: 'helpCenter.faqData.advancePayment.question',
    answerKey: 'helpCenter.faqData.advancePayment.answer',
    category: 'Popular Topic',
  },
  {
    id: '5',
    questionKey: 'helpCenter.faqData.latePayment.question',
    answerKey: 'helpCenter.faqData.latePayment.answer',
    category: 'General',
  },
];

const CONTACT_DATA = [
  { id: '1', labelKey: 'helpCenter.contact.customerService', value: '809-000-0000' },
  { id: '2', labelKey: 'helpCenter.contact.website', value: 'www.finandom.com' },
  { id: '3', labelKey: 'helpCenter.contact.whatsapp', value: '+1 809-000-0000' },
  { id: '4', labelKey: 'helpCenter.contact.facebook', value: 'facebook.com/finandom' },
  { id: '5', labelKey: 'helpCenter.contact.instagram', value: '@finandom' },
];

const FAQ_CATEGORIES = ['Popular Topic', 'General', 'Services'];

const HelpCenterScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const [tab, setTab] = useState<'FAQ' | 'Contact'>('FAQ');
  const [faqCategory, setFaqCategory] = useState('Popular Topic');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  // Filtro FAQ
  const filteredFaq = FAQ_DATA.filter(
    f =>
      (faqCategory === '' || f.category === faqCategory) &&
      (t(f.questionKey).toLowerCase().includes(search.toLowerCase()) ||
        t(f.answerKey).toLowerCase().includes(search.toLowerCase()))
  );
  // Filtro Contact
  const filteredContact = CONTACT_DATA.filter(
    c =>
      t(c.labelKey).toLowerCase().includes(search.toLowerCase()) ||
      c.value.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image source={backIcon} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('helpCenter.title')}</Text>
        <View style={{ width: 28 }} />
      </View>
      <Text style={styles.subtitle}>{t('helpCenter.subtitle')}</Text>
      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('helpCenter.searchPlaceholder')}
          value={search}
          onChangeText={setSearch}
        />
        <Image source={faqIcon} style={styles.searchIcon} />
      </View>
      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'FAQ' && styles.tabButtonActive]}
          onPress={() => setTab('FAQ')}
        >
          <Text style={[styles.tabText, tab === 'FAQ' && styles.tabTextActive]}>{t('helpCenter.faq')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'Contact' && styles.tabButtonActiveBlue]}
          onPress={() => setTab('Contact')}
        >
          <Text style={[styles.tabText, tab === 'Contact' && styles.tabTextActive]}>{t('helpCenter.contactUs')}</Text>
        </TouchableOpacity>
      </View>
      {/* FAQ Content */}
      {tab === 'FAQ' && (
        <>
          <View style={styles.faqCategoriesRow}>
            {FAQ_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.faqCategoryButton, faqCategory === cat && styles.faqCategoryButtonActive]}
                onPress={() => setFaqCategory(cat)}
              >
                <Text style={[styles.faqCategoryText, faqCategory === cat && styles.faqCategoryTextActive]}>{t(`helpCenter.categories.${cat.toLowerCase().replace(' ', '')}`)}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
            {filteredFaq.map(faq => (
              <View key={faq.id} style={styles.faqCard}>
                <TouchableOpacity style={styles.faqQuestionRow} onPress={() => setExpanded(expanded === faq.id ? null : faq.id)}>
                  <Text style={styles.faqQuestion}>{t(faq.questionKey)}</Text>
                  <Text style={styles.faqCheck}>{expanded === faq.id ? '˄' : '˅'}</Text>
                </TouchableOpacity>
                {expanded === faq.id && <Text style={styles.faqAnswer}>{t(faq.answerKey)}</Text>}
              </View>
            ))}
            {filteredFaq.length === 0 && (
              <Text style={styles.emptyText}>{t('helpCenter.noResults')}</Text>
            )}
          </ScrollView>
        </>
      )}
      {/* Contact Content */}
      {tab === 'Contact' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
          {filteredContact.map(contact => (
            <View key={contact.id} style={styles.contactRow}>
              <View style={styles.contactIconContainer}>
                <Image source={contactIcons[t(contact.labelKey) as keyof typeof contactIcons]} style={styles.contactIcon} />
              </View>
              <Text style={styles.contactLabel}>{t(contact.labelKey)}</Text>
              <Text style={styles.contactValue}>{contact.value}</Text>
              <Image source={checkmark} style={styles.contactCheck} />
            </View>
          ))}
          {filteredContact.length === 0 && (
            <Text style={styles.emptyText}>{t('helpCenter.noResults')}</Text>
          )}
        </ScrollView>
      )}
      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Image source={home} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Assistant')}>
          <Image source={chat} style={styles.navIcon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Image source={user} style={[styles.navIcon, { tintColor: '#00278C' }]} />
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
    backgroundColor: '#FFF',
    paddingTop: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 64,
    marginBottom: 8,
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#10B981',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  searchBox: {
    position: 'relative',
    marginHorizontal: 16,
    marginBottom: 16, // igual que otras pantallas
  },
  searchInput: {
    backgroundColor: '#FFFFFF', // blanco
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 48, // espacio para el icono
    fontSize: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    right: 16, // icono a la derecha
    top: 12,
    width: 20,
    height: 20,
    tintColor: '#6B7280',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  tabButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  tabButtonActive: {
    backgroundColor: '#1CC88A',
  },
  tabButtonActiveBlue: {
    backgroundColor: '#A7C7E7',
  },
  tabText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#fff',
  },
  faqCategoriesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 8,
  },
  faqCategoryButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  faqCategoryButtonActive: {
    backgroundColor: '#1CC88A',
  },
  faqCategoryText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  faqCategoryTextActive: {
    color: '#fff',
  },
  faqCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  faqQuestion: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
    flex: 1,
  },
  faqCheck: {
    fontSize: 22,
    color: '#10B981',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#374151',
    marginTop: 12,
    lineHeight: 20,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2DD4BF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contactIcon: {
    width: 22,
    height: 22,
    tintColor: '#fff',
  },
  contactLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
    flex: 1,
  },
  contactValue: {
    fontSize: 13,
    color: '#6B7280',
    marginRight: 8,
  },
  contactCheck: {
    width: 20,
    height: 20,
    tintColor: '#10B981',
  },
  emptyText: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 32,
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

export default HelpCenterScreen; 