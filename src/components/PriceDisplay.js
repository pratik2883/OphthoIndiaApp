import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';

const PriceDisplay = ({ 
  price, 
  regularPrice, 
  style, 
  priceStyle, 
  regularPriceStyle,
  showDecimals = true,
  size = 'medium'
}) => {
  const { formatPrice } = useCurrency();
  const { theme } = useTheme();

  const styles = createStyles(theme, size);

  if (!price) {
    return null;
  }

  const formattedPrice = formatPrice(price, showDecimals);
  const formattedRegularPrice = regularPrice && regularPrice !== price 
    ? formatPrice(regularPrice, showDecimals) 
    : null;

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.price, priceStyle]}>
        {formattedPrice}
      </Text>
      
      {formattedRegularPrice && (
        <Text style={[styles.regularPrice, regularPriceStyle]}>
          {formattedRegularPrice}
        </Text>
      )}
    </View>
  );
};

const createStyles = (theme, size) => {
  const isSmall = size === 'small';
  const isLarge = size === 'large';
  
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    price: {
      fontSize: isSmall ? theme.typography.fontSize.sm : 
               isLarge ? theme.typography.fontSize.lg : 
               theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    regularPrice: {
      fontSize: isSmall ? theme.typography.fontSize.xs : 
               isLarge ? theme.typography.fontSize.sm : 
               theme.typography.fontSize.xs,
      color: theme.colors.textTertiary,
      textDecorationLine: 'line-through',
      marginLeft: theme.spacing.xs,
    },
  });
};

export default PriceDisplay;