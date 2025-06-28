// App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * App principal de FinanDom
 * - Muestra la SplashScreen al inicio
 * - Usa React Navigation para manejar pantallas
 */
const App = () => {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#1CC88A" />
      <AppNavigator />
    </>
  );
};

export default App;
