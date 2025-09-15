import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Path, G } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../theme';

const Logo = ({ size = 40, showText = true, variant = 'default' }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = createStyles(theme);
  const logoSize = size;
  const textSize = size * 0.4;

  const LogoIcon = () => (
    <Svg width={logoSize} height={logoSize} viewBox="0 0 100 100">
      <G>
        {/* Outer circle - representing the eye */}
        <Circle
          cx="50"
          cy="50"
          r="45"
          fill={variant === 'white' ? '#ffffff' : theme.colors.primary}
          stroke={variant === 'white' ? theme.colors.primary : '#ffffff'}
          strokeWidth="2"
        />
        
        {/* Inner circle - iris */}
        <Circle
          cx="50"
          cy="50"
          r="25"
          fill={variant === 'white' ? theme.colors.primary : '#ffffff'}
        />
        
        {/* Pupil */}
        <Circle
          cx="50"
          cy="50"
          r="12"
          fill={variant === 'white' ? '#ffffff' : theme.colors.primary}
        />
        
        {/* Light reflection */}
        <Circle
          cx="45"
          cy="45"
          r="4"
          fill={variant === 'white' ? theme.colors.primary : '#ffffff'}
          opacity="0.8"
        />
        
        {/* Medical cross */}
        <Path
          d="M48 35 L52 35 L52 45 L62 45 L62 49 L52 49 L52 59 L48 59 L48 49 L38 49 L38 45 L48 45 Z"
          fill={variant === 'white' ? '#ffffff' : theme.colors.accent}
          opacity="0.9"
        />
      </G>
    </Svg>
  );

  if (!showText) {
    return <LogoIcon />;
  }

  return (
    <View style={styles.container}>
      <LogoIcon />
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[
            styles.brandText,
            { 
              fontSize: textSize,
              color: variant === 'white' ? '#ffffff' : theme.colors.textPrimary
            }
          ]}>
            Ophtho India
          </Text>
          <Text style={[
            styles.taglineText,
            { 
              fontSize: textSize * 0.6,
              color: variant === 'white' ? '#ffffff' : theme.colors.textSecondary
            }
          ]}>
            Eye Care Solutions
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
  },
  brandText: {
    fontWeight: theme.typography?.fontWeight?.bold || '700',
    letterSpacing: 0.5,
  },
  taglineText: {
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.3,
  },
});

export default Logo;