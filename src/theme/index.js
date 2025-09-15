// Ophtho India App Theme Configuration

// Light theme colors
export const lightColors = {
  // Primary Brand Colors
  primary: '#007AFF',
  primaryDark: '#0056CC',
  primaryLight: '#4DA3FF',
  
  // Secondary Colors
  secondary: '#34C759',
  secondaryDark: '#28A745',
  secondaryLight: '#5ED670',
  
  // Accent Colors
  accent: '#FF9500',
  accentDark: '#E6850E',
  accentLight: '#FFB84D',
  
  // Status Colors
  success: '#28a745',
  warning: '#ffc107',
  error: '#dc3545',
  info: '#17a2b8',
  
  // Neutral Colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray Scale
  gray50: '#f8f9fa',
  gray100: '#f1f3f4',
  gray200: '#e9ecef',
  gray300: '#dee2e6',
  gray400: '#ced4da',
  gray500: '#adb5bd',
  gray600: '#6c757d',
  gray700: '#495057',
  gray800: '#343a40',
  gray900: '#212529',
  
  // Text Colors
  textPrimary: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#cccccc',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  
  // Background Colors
  background: '#f8f9fa',
  surface: '#ffffff',
  surfaceVariant: '#f1f3f4',
  
  // Border Colors
  border: '#e9ecef',
  borderLight: '#f1f3f4',
  borderDark: '#dee2e6',
  
  // Shadow Colors
  shadow: '#000000',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',
};

// Dark theme colors
export const darkColors = {
  // Primary Brand Colors
  primary: '#0A84FF',
  primaryDark: '#0056CC',
  primaryLight: '#64B5F6',
  
  // Secondary Colors
  secondary: '#30D158',
  secondaryDark: '#28A745',
  secondaryLight: '#5ED670',
  
  // Accent Colors
  accent: '#FF9F0A',
  accentDark: '#E6850E',
  accentLight: '#FFB84D',
  
  // Status Colors
  success: '#30D158',
  warning: '#FFD60A',
  error: '#FF453A',
  info: '#64D2FF',
  
  // Neutral Colors
  white: '#000000',
  black: '#FFFFFF',
  
  // Gray Scale
  gray50: '#1C1C1E',
  gray100: '#2C2C2E',
  gray200: '#3A3A3C',
  gray300: '#48484A',
  gray400: '#636366',
  gray500: '#8E8E93',
  gray600: '#AEAEB2',
  gray700: '#C7C7CC',
  gray800: '#D1D1D6',
  gray900: '#F2F2F7',
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#AEAEB2',
  textTertiary: '#8E8E93',
  textDisabled: '#636366',
  textOnPrimary: '#ffffff',
  textOnSecondary: '#ffffff',
  
  // Background Colors
  background: '#000000',
  surface: '#1C1C1E',
  surfaceVariant: '#2C2C2E',
  
  // Border Colors
  border: '#3A3A3C',
  borderLight: '#2C2C2E',
  borderDark: '#48484A',
  
  // Shadow Colors
  shadow: '#000000',
  shadowLight: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowDark: 'rgba(0, 0, 0, 0.6)',
};

// Default colors (light theme)
export const colors = {
  ...lightColors,
  // Add missing color aliases for backward compatibility
  text: lightColors.textPrimary,
  gray: lightColors.gray500,
  lightGray: lightColors.gray200,
};

// Add missing color aliases to dark colors as well
export const darkColorsWithAliases = {
  ...darkColors,
  text: darkColors.textPrimary,
  gray: darkColors.gray500,
  lightGray: darkColors.gray200,
};

// Default font weights for fallback
const defaultFontWeights = {
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

const typographyBase = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  
  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 48,
  },
  
  // Font Weights
  fontWeight: defaultFontWeights,
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
};

// Export typography with safety check
export const typography = typographyBase || {
  fontFamily: { regular: 'System', medium: 'System', bold: 'System', light: 'System' },
  fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 28, '4xl': 32, '5xl': 36, '6xl': 48 },
  fontWeight: { light: '300', normal: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800' },
  lineHeight: { tight: 1.2, normal: 1.4, relaxed: 1.6, loose: 1.8 },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
};

export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
};

export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const layout = {
  // Container widths
  container: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  
  // Header heights
  header: {
    default: 56,
    large: 64,
  },
  
  // Tab bar height
  tabBar: {
    default: 60,
  },
  
  // Button heights
  button: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },
  
  // Input heights
  input: {
    sm: 32,
    md: 40,
    lg: 48,
  },
};

// Component-specific styles
export const components = {
  // Button styles
  button: {
    primary: {
      backgroundColor: '#007AFF',
      borderColor: '#007AFF',
    },
    secondary: {
      backgroundColor: '#34C759',
      borderColor: '#34C759',
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: '#007AFF',
      borderWidth: 1,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
    },
  },
  
  // Card styles
  card: {
    default: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    elevated: {
      backgroundColor: '#ffffff',
      borderRadius: 12,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
  
  // Input styles
  input: {
    default: {
      backgroundColor: '#ffffff',
      borderColor: '#e9ecef',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    focused: {
      borderColor: '#007AFF',
    },
    error: {
      borderColor: '#dc3545',
    },
  },
};

// Utility functions
export const getColor = (colorName) => {
  return colors[colorName] || colorName;
};

export const getSpacing = (spacingName) => {
  return spacing[spacingName] || spacingName;
};

export const getFontSize = (sizeName) => {
  return typography.fontSize[sizeName] || sizeName;
};

export const getBorderRadius = (radiusName) => {
  return borderRadius[radiusName] || radiusName;
};

export const getShadow = (shadowName) => {
  return shadows[shadowName] || shadows.none;
};

// Function to get theme colors based on mode
export const getThemeColors = (isDarkMode = false) => {
  return isDarkMode ? darkColorsWithAliases : colors;
};

// Function to get complete theme based on mode
export const getTheme = (isDarkMode = false) => {
  return {
    colors: getThemeColors(isDarkMode),
    typography,
    spacing,
    borderRadius,
    shadows,
    layout,
    components,
    isDarkMode,
  };
};

// Theme object (default light theme)
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  layout,
  components,
  isDarkMode: false,
};

export default theme;