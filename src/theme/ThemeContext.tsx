import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { lightTheme, darkTheme } from './themes';

const ThemeContext = createContext({
  theme: lightTheme,
  mode: 'light',
  setMode: (_mode: 'light' | 'dark' | 'system') => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<'light' | 'dark' | 'system'>('light');
  const [theme, setTheme] = useState(lightTheme);

  useEffect(() => {
    let colorScheme = mode;
    if (mode === 'system') {
      colorScheme = Appearance.getColorScheme() || 'light';
    }
    setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext); 