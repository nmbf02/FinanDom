// src/screens/DashboardScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';

// 🧩 ICONOS (Rutas en la parte superior)
const avatar = require('../assets/icons/avatar.png');
const user = require('../assets/icons/avatar.png');
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
        <View style={styles.userInfo}>
          <Image source={avatar} style={styles.avatar} />
          <View>
            <Text style={styles.welcomeText}>Hi, WelcomeBack</Text>
            <Text style={styles.userName}>Nathaly Berroa</Text>
          </View>
        </View>
        <Image source={bell} style={styles.icon} />
        <Image source={setting} style={styles.icon} />
      </View>

      {/* FECHA */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateRow}>
        {['9 MON', '10 TUE', '11 WED', '12 THU', '13 FRI', '14 SAT'].map((item, index) => (
          <View
            key={index}
            style={[
              styles.dateItem,
              index === 2 && styles.dateItemActive // día seleccionado
            ]}
          >
            <Text style={styles.dateText}>{item}</Text>
          </View>
        ))}
      </ScrollView>

      {/* CITA (Opcional) */}
      <View style={styles.appointmentCard}>
        <Text style={styles.appointmentTitle}>Dr. Olivia Turner, M.D.</Text>
        <Text style={styles.appointmentDesc}>
          Treatment and prevention of skin and photodermatitis.
        </Text>
      </View>

      {/* TABS */}
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

      {/* MÉTRICAS */}
      <View style={styles.statsContainer}>
        <Stat icon={wallet} title="Total Prestado" amount="RD$ 450,000.00" />
        <Stat icon={barChart} title="Total Recuperado" amount="RD$ 150,000.00" />
        <Stat icon={dollarCross} title="Total en Mora" amount="RD$ 45,000.00" badge="5" />
        <Stat icon={pieChart} title="Cantidad de Préstamos Activos" amount="10" />
      </View>

      {/* NAVEGACIÓN INFERIOR */}
      <View style={styles.bottomNav}>
        <Image source={home} style={styles.navIcon} />
        <Image source={chat} style={styles.navIcon} />
        <Image source={calendar} style={styles.navIcon} />
        <Image source={user} style={styles.navIcon} />
      </View>
    </View>
  );
};

// COMPONENTES REUTILIZABLES
type TabProps = { icon: any; label: string; active?: boolean };
const Tab: React.FC<TabProps> = ({ icon, label, active = false }) => (
  <View style={[styles.tab, active && styles.tabActive]}>
    <Image source={icon} style={styles.tabIcon} />
    <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
  </View>
);

type StatProps = { icon: any; title: string; amount: string; badge?: string | number | null };
const Stat: React.FC<StatProps> = ({ icon, title, amount, badge = null }) => (
  <View style={styles.statBox}>
    <View style={styles.statHeader}>
      <Image source={icon} style={styles.statIcon} />
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </View>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={styles.statAmount}>{amount}</Text>
  </View>
);

export default DashboardScreen;

// ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,
  },
  icon: {
    width: 24,
    height: 24,
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
  dateRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dateItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#EEE',
    marginRight: 10,
  },
  dateItemActive: {
    backgroundColor: '#1CC88A',
  },
  dateText: {
    fontSize: 14,
    color: '#444',
  },
  appointmentCard: {
    backgroundColor: '#F6F6F6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  appointmentTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  appointmentDesc: {
    fontSize: 14,
    color: '#555',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tab: {
    alignItems: 'center',
    marginRight: 20,
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    color: '#777',
  },
  tabActive: {},
  tabTextActive: {
    color: '#1CC88A',
    fontWeight: 'bold',
  },
  statsContainer: {
    gap: 15,
  },
  statBox: {
    backgroundColor: '#F9F9F9',
    padding: 16,
    borderRadius: 10,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statIcon: {
    width: 24,
    height: 24,
  },
  badge: {
    backgroundColor: '#1CC88A',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  statTitle: {
    fontSize: 14,
    marginTop: 8,
    color: '#666',
  },
  statAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    marginTop: 20,
  },
  navIcon: {
    width: 28,
    height: 28,
    tintColor: '#1CC88A',
  },
});
