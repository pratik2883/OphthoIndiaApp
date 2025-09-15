import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { CurrencyProvider } from './src/context/CurrencyContext';
import AppNavigator from './src/navigation/AppNavigator';
import { APP_CONFIG } from './src/config/api';
import { getTheme } from './src/theme';

const Stack = createStackNavigator();

// App content component that uses theme
function AppContent() {
  const { isDarkMode } = useTheme();
  const currentTheme = getTheme(isDarkMode);

  return (
    <NavigationContainer
      theme={{
        dark: isDarkMode,
        colors: {
          primary: currentTheme.colors.primary,
          background: currentTheme.colors.background,
          card: currentTheme.colors.surface,
          text: currentTheme.colors.textPrimary,
          border: currentTheme.colors.borderLight,
          notification: currentTheme.colors.accent,
        },
        fonts: {
          regular: {
            fontFamily: 'System',
            fontWeight: '400',
          },
          medium: {
            fontFamily: 'System',
            fontWeight: '500',
          },
          bold: {
            fontFamily: 'System',
            fontWeight: '700',
          },
          heavy: {
            fontFamily: 'System',
            fontWeight: '800',
          },
        },
      }}
    >
      <AppNavigator />
      <StatusBar 
        style={isDarkMode ? "light" : "dark"} 
            backgroundColor={currentTheme.colors.primary}
          />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
