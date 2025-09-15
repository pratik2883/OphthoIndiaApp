import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../theme';

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  ...props
}) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = createStyles(theme);
  const getButtonStyle = () => {
    const baseStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.md,
      ...theme.shadows.sm,
    };

    // Size styles
    const sizeStyles = {
      sm: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        minHeight: 32,
      },
      md: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.sm,
        minHeight: 40,
      },
      lg: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.md,
        minHeight: 48,
      },
      xl: {
        paddingHorizontal: theme.spacing['2xl'],
        paddingVertical: theme.spacing.lg,
        minHeight: 56,
      },
    };

    // Variant styles
    const variantStyles = {
      primary: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
        borderWidth: 1,
      },
      secondary: {
        backgroundColor: theme.colors.secondary,
        borderColor: theme.colors.secondary,
        borderWidth: 1,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: theme.colors.primary,
        borderWidth: 1,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        shadowOpacity: 0,
        elevation: 0,
      },
      danger: {
        backgroundColor: theme.colors.error,
        borderColor: theme.colors.error,
        borderWidth: 1,
      },
      warning: {
        backgroundColor: theme.colors.warning,
        borderColor: theme.colors.warning,
        borderWidth: 1,
      },
      success: {
        backgroundColor: theme.colors.success,
        borderColor: theme.colors.success,
        borderWidth: 1,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled || loading ? 0.6 : 1,
    };
  };

  const getTextStyle = () => {
    const baseTextStyle = {
      fontWeight: theme.typography?.fontWeight?.semibold || '600',
      textAlign: 'center',
    };

    // Size-based text styles
    const sizeTextStyles = {
      sm: {
        fontSize: theme.typography.fontSize.sm,
      },
      md: {
        fontSize: theme.typography.fontSize.base,
      },
      lg: {
        fontSize: theme.typography.fontSize.lg,
      },
      xl: {
        fontSize: theme.typography.fontSize.xl,
      },
    };

    // Variant-based text colors
    const variantTextStyles = {
      primary: {
        color: theme.colors.textOnPrimary,
      },
      secondary: {
        color: theme.colors.textOnSecondary,
      },
      outline: {
        color: theme.colors.primary,
      },
      ghost: {
        color: theme.colors.primary,
      },
      danger: {
        color: theme.colors.white,
      },
      warning: {
        color: theme.colors.white,
      },
      success: {
        color: theme.colors.white,
      },
    };

    return {
      ...baseTextStyle,
      ...sizeTextStyles[size],
      ...variantTextStyles[variant],
    };
  };

  const getIconSize = () => {
    const iconSizes = {
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
    };
    return iconSizes[size];
  };

  const getIconColor = () => {
    const iconColors = {
      primary: theme.colors.textOnPrimary,
      secondary: theme.colors.textOnSecondary,
      outline: theme.colors.primary,
      ghost: theme.colors.primary,
      danger: theme.colors.white,
      warning: theme.colors.white,
      success: theme.colors.white,
    };
    return iconColors[variant];
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={getIconColor()} 
            style={styles.loadingIndicator}
          />
          {title && (
            <Text style={[getTextStyle(), textStyle, styles.loadingText]}>
              {title}
            </Text>
          )}
        </View>
      );
    }

    const iconElement = icon && (
      <Ionicons
        name={icon}
        size={getIconSize()}
        color={getIconColor()}
        style={[
          iconPosition === 'left' ? styles.iconLeft : styles.iconRight,
          !title && styles.iconOnly,
        ]}
      />
    );

    return (
      <>
        {iconPosition === 'left' && iconElement}
        {title && (
          <Text style={[getTextStyle(), textStyle]}>
            {title}
          </Text>
        )}
        {iconPosition === 'right' && iconElement}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const createStyles = (theme) => StyleSheet.create({
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginRight: theme.spacing.xs,
  },
  loadingText: {
    marginLeft: theme.spacing.xs,
  },
  iconLeft: {
    marginRight: theme.spacing.xs,
  },
  iconRight: {
    marginLeft: theme.spacing.xs,
  },
  iconOnly: {
    margin: 0,
  },
});

export default Button;