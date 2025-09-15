import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';

const CurrencyConverter = () => {
  const { currentCurrency, toggleCurrency, isLoading } = useCurrency();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = createStyles(theme);

  if (isLoading) {
    return (
      <ActivityIndicator size="small" color="white" style={styles.loader} />
    );
  }

  return (
    <TouchableOpacity
      style={styles.currencyButton}
      onPress={toggleCurrency}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Text style={styles.currencySymbol}>
        {currentCurrency.symbol}
      </Text>
    </TouchableOpacity>
  );
};

const createStyles = (theme) => {
  return StyleSheet.create({
    loader: {
      padding: theme.spacing.xs,
    },
    currencyButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      minWidth: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    currencySymbol: {
      fontSize: 16,
      fontWeight: 'bold',
      color: 'white',
    },
  });
};

export default CurrencyConverter;