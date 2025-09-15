import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';
import { getTheme } from '../theme';

// Create the theme context
const ThemeContext = createContext();

// Theme storage key
const THEME_STORAGE_KEY = '@ophtho_app_theme';

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme Provider component
export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(THEME_MODES.SYSTEM);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Listen to system theme changes when in system mode
  useEffect(() => {
    if (themeMode === THEME_MODES.SYSTEM) {
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setIsDarkMode(colorScheme === 'dark');
      });
      
      // Set initial system theme
      const systemColorScheme = Appearance.getColorScheme();
      setIsDarkMode(systemColorScheme === 'dark');
      
      return () => subscription?.remove();
    }
  }, [themeMode]);

  // Update dark mode based on theme mode
  useEffect(() => {
    switch (themeMode) {
      case THEME_MODES.LIGHT:
        setIsDarkMode(false);
        break;
      case THEME_MODES.DARK:
        setIsDarkMode(true);
        break;
      case THEME_MODES.SYSTEM:
        const systemColorScheme = Appearance.getColorScheme();
        setIsDarkMode(systemColorScheme === 'dark');
        break;
      default:
        setIsDarkMode(false);
    }
  }, [themeMode]);

  // Load theme preference from storage
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && Object.values(THEME_MODES).includes(savedTheme)) {
        setThemeMode(savedTheme);
      } else {
        // Default to system theme
        setThemeMode(THEME_MODES.SYSTEM);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      setThemeMode(THEME_MODES.SYSTEM);
    } finally {
      setIsLoading(false);
    }
  };

  // Save theme preference to storage
  const saveThemePreference = async (mode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Change theme mode
  const changeThemeMode = (mode) => {
    if (Object.values(THEME_MODES).includes(mode)) {
      setThemeMode(mode);
      saveThemePreference(mode);
    }
  };

  // Toggle between light and dark mode
  const toggleTheme = () => {
    const newMode = isDarkMode ? THEME_MODES.LIGHT : THEME_MODES.DARK;
    changeThemeMode(newMode);
  };

  // Get current theme name for display
  const getThemeName = () => {
    switch (themeMode) {
      case THEME_MODES.LIGHT:
        return 'Light';
      case THEME_MODES.DARK:
        return 'Dark';
      case THEME_MODES.SYSTEM:
        return `System (${isDarkMode ? 'Dark' : 'Light'})`;
      default:
        return 'System';
    }
  };

  const contextValue = {
    // Current state
    themeMode,
    isDarkMode,
    isLoading,
    
    // Theme object with colors
    theme: getTheme(isDarkMode),
    
    // Actions
    changeThemeMode,
    toggleTheme,
    
    // Utilities
    getThemeName,
    getTheme: () => getTheme(isDarkMode),
    
    // Theme modes for reference
    THEME_MODES,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;