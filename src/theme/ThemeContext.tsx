import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './themes';

const ThemeContext = createContext({
  theme: lightTheme,
  mode: 'light',
  setMode: (_mode: 'light' | 'dark' | 'system') => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setModeState] = useState<'light' | 'dark' | 'system'>('light');
  const [theme, setTheme] = useState(lightTheme);

  // Leer el modo guardado al iniciar
  useEffect(() => {
    (async () => {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system') {
        setModeState(savedMode);
      }
    })();
  }, []);

  // Actualizar el theme cuando cambia el modo
  useEffect(() => {
    let colorScheme = mode;
    if (mode === 'system') {
      colorScheme = Appearance.getColorScheme() || 'light';
    }
    setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
  }, [mode]);

  // Guardar el modo cuando cambia
  const setMode = async (newMode: 'light' | 'dark' | 'system') => {
    setModeState(newMode);
    await AsyncStorage.setItem('themeMode', newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 