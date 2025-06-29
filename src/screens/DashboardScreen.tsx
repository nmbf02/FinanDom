import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

// ICONOS
const avatar = require('../assets/icons/avatar.png');
const user = require('../assets/icons/user-setting.png');
const bell = require('../assets/icons/bell.png');
const setting = require('../assets/icons/setting.png');
const wallet = require('../assets/icons/wallet.png');
const barChart = require('../assets/icons/bar-chart.png');
const dollarCross = require('../assets/icons/dollar-cross.png');
const pieChart = require('../assets/icons/pie-chart.png');
const home = require('../assets/icons/home.png');
const chat = require('../assets/icons/chat.png');
const calendar = require('../assets/icons/calendar.png');
const users = require('../assets/icons/user-group.png');
const loan = require('../assets/icons/hand-coin.png');
const payment = require('../assets/icons/installment.png');
const overdue = require('../assets/icons/warning-dollar.png');

const DashboardScreen = () => {
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Image source={avatar} style={styles.avatar} />
        <View>
          <Text style={styles.welcomeText}>Hi, WelcomeBack</Text>
          <Text style={styles.userName}>Nathaly Berroa</Text>
        </View>
        <View style={styles.rightIcons}>
          <Image source={bell} style={styles.icon} />
          <Image source={setting} style={styles.icon} />
        </View>
      </View>

      {/* CALENDARIO FECHAS */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calendarRow}>
        {[
          { day: 'MON', date: '9' },
          { day: 'TUE', date: '10' },
          { day: 'WED', date: '11' },
          { day: 'THU', date: '12' },
          { day: 'FRI', date: '13' },
          { day: 'SAT', date: '14' },
        ].map((item, index) => (
          <View
            key={index}
            style={[styles.calendarItem, index === 2 && styles.calendarItemActive]}
          >
            <Text style={styles.calendarDate}>{item.date}</Text>
            <Text style={styles.calendarDay}>{item.day}</Text>
          </View>
        ))}
      </ScrollView>

      {/* AGENDA DEL DÍA */}
      <View style={styles.agendaContainer}>
        <Text style={styles.agendaDayLabel}>11 Wednesday - Today</Text>
        {['9 AM', '10 AM', '11 AM', '12 PM'].map((hour, i) => (
          <View key={i} style={styles.agendaItem}>
            <Text style={styles.agendaTime}>{hour}</Text>
            {hour === '10 AM' ? (
              <View style={styles.agendaDetails}>
                <View style={styles.agendaHeader}>
                  <Text style={styles.agendaTitle}>Dr. Olivia Turner, M.D.</Text>
                  <Text style={styles.agendaCheck}>✔</Text>
                </View>
                <Text style={styles.agendaDesc}>
                  Treatment and prevention of skin and photodermatitis.
                </Text>
              </View>
            ) : (
              <View style={styles.agendaLine} />
            )}
          </View>
        ))}
      </View>

      {/* TABS */}
      <View style={{ marginTop: 16 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          <Tab icon={users} label="CLIENTES" active />
          <Tab icon={loan} label="PRÉSTAMOS" />
          <Tab icon={payment} label="CUOTAS" />
          <Tab icon={overdue} label="MORAS" />
        </ScrollView>
      </View>

      {/* MÉTRICAS */}
      <View style={styles.statsContainer}>
        <StatCard icon={wallet} title="Total Prestado" amount="RD$ 450,000.00" />
        <StatCard icon={barChart} title="Total Recuperado" amount="RD$ 150,000.00" />
        <StatCard icon={dollarCross} title="Total en Mora" amount="RD$ 45,000.00" badge="5" />
        <StatCard icon={pieChart} title="Cantidad de Préstamos Activos" amount="10" />
      </View>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <TouchableOpacity><Image source={home} style={styles.navIcon} /></TouchableOpacity>
        <TouchableOpacity><Image source={chat} style={styles.navIcon} /></TouchableOpacity>
        <TouchableOpacity><Image source={calendar} style={styles.navIcon} /></TouchableOpacity>
        <TouchableOpacity><Image source={user} style={styles.navIcon} /></TouchableOpacity>
      </View>
    </View>
  );
};

const Tab = ({ icon, label, active }: any) => (
  <View style={[styles.tab, active && styles.tabActive]}>
    <Image source={icon} style={styles.tabIcon} />
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </View>
);

const StatCard = ({ icon, title, amount, badge }: any) => (
  <View style={styles.statCard}>
    <View style={styles.statIconContainer}>
      <Image source={icon} style={styles.statIcon} />
    </View>
    <View style={styles.statTextContainer}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statAmount}>{amount}</Text>
    </View>
    {badge && (
      <View style={styles.statBadge}>
        <Text style={styles.statBadgeIcon}>★</Text>
        <Text style={styles.statBadgeText}>{badge}</Text>
      </View>
    )}
  </View>
);

export default DashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 64,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  icon: {
    width: 24,
    height: 24,
    marginLeft: 12,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#999',
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  calendarRow: {
    marginVertical: 16,
  },
  calendarItem: {
    alignItems: 'center',
    padding: 10,
    marginRight: 10,
    borderRadius: 10,
    backgroundColor: '#F0F0F0',
    width: 50,
  },
  calendarItemActive: {
    backgroundColor: '#10B981',
  },
  calendarDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  calendarDay: {
    fontSize: 12,
    color: '#6B7280',
  },
  agendaContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  agendaDayLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
    marginBottom: 12,
  },
  agendaItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  agendaTime: {
    width: 50,
    fontSize: 14,
    color: '#6B7280',
  },
  agendaDetails: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 12,
  },
  agendaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  agendaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  agendaCheck: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: 'bold',
  },
  agendaDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  agendaLine: {
    flex: 1,
    height: 1,
    borderBottomColor: '#E5E7EB',
    borderBottomWidth: 1,
    marginTop: 12,
  },
  tabs: {
    flexDirection: 'row',
    gap: 16,
  },
  tab: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: '#ECFDF5',
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#10B981',
    fontWeight: 'bold',
  },
  statsContainer: {
    marginTop: 16,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    position: 'relative',
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  statIcon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
  statTextContainer: {
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  statAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 2,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 12,
    top: 20,
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statBadgeIcon: {
    color: '#10B981',
    marginRight: 4,
    fontSize: 14,
  },
  statBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 10,
  },
  navIcon: {
    width: 28,
    height: 28,
    tintColor: '#10B981',
  },
});
