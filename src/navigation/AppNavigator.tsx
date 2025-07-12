// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { View, Text, Picker } from 'react-native';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CreateLoanScreen from '../screens/CreateLoanScreen';
import ClientScreen from '../screens/ClientScreen';
import ClientListScreen from '../screens/ClientListScreen';
import ContractPreviewScreen from '../screens/ContractPreviewScreen';
import SignContractScreen from '../screens/SignContractScreen';
import LoanDetailsScreen from '../screens/LoanDetailsScreen';
import LoanListScreen from '../screens/LoanListScreen';
import InstallmentListScreen from '../screens/InstallmentListScreen';
import RecordPaymentScreen from '../screens/RecordPaymentScreen';
import PaymentSuccessScreen from '../screens/PaymentSuccessScreen';
import OverduePaymentsScreen from '../screens/OverduePaymentsScreen';
import AssistantScreen from '../screens/AssistantScreen';
import CommunicationHistoryScreen from '../screens/CommunicationHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import CurrencyScreen from '../screens/CurrencyScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="CreateLoan" component={CreateLoanScreen} />
        <Stack.Screen name="Client" component={ClientScreen} />
        <Stack.Screen name="ClientList" component={ClientListScreen} />
        <Stack.Screen
          name="ContractPreviewScreen"
          component={ContractPreviewScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="SignContract" component={SignContractScreen} />
        <Stack.Screen name="LoanDetails" component={LoanDetailsScreen} />
        <Stack.Screen name="LoanList" component={LoanListScreen} />
        <Stack.Screen name="InstallmentList" component={InstallmentListScreen} />
        <Stack.Screen name="RecordPaymentScreen" component={RecordPaymentScreen} />
        <Stack.Screen name="PaymentSuccessScreen" component={PaymentSuccessScreen} />
        <Stack.Screen name="OverduePayments" component={OverduePaymentsScreen} />
        <Stack.Screen name="Assistant" component={AssistantScreen} />
        <Stack.Screen name="CommunicationHistory" component={CommunicationHistoryScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
        <Stack.Screen name="Currency" component={CurrencyScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
