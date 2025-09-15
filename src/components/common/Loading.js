import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Image,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../theme';

const { width, height } = Dimensions.get('window');

const Loading = ({
  visible = true,
  text = 'Loading...',
  showLogo = true,
  overlay = true,
  size = 'large',
  color,
  style,
}) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = createStyles(theme);
  const finalColor = color || theme.colors.primary;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotation for logo
      if (showLogo) {
        const rotateAnimation = Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        );
        rotateAnimation.start();
        return () => rotateAnimation.stop();
      }
    } else {
      // Fade out animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, scaleAnim, rotateAnim, showLogo]);

  if (!visible) {
    return null;
  }

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderContent = () => (
    <Animated.View
      style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {showLogo && (
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ rotate: spin }],
            },
          ]}
        >
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
      )}

      <View style={styles.indicatorContainer}>
        <ActivityIndicator size={size} color={finalColor} />
      </View>

      {text && (
        <Text style={[styles.text, { color: finalColor }]}>
          {text}
        </Text>
      )}

      <View style={styles.brandContainer}>
        <Text style={styles.brandText}>Ophtho India</Text>
        <Text style={styles.brandSubtext}>Eye Care Solutions</Text>
      </View>
    </Animated.View>
  );

  if (overlay) {
    return (
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
          style,
        ]}
      >
        {renderContent()}
      </Animated.View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      {renderContent()}
    </View>
  );
};

// Inline loading component for smaller spaces
export const InlineLoading = ({
  text = 'Loading...',
  size = 'small',
  color,
  style,
}) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = createStyles(theme);
  const finalColor = color || theme.colors.primary;
  
  return (
    <View style={[styles.inlineContainer, style]}>
      <ActivityIndicator size={size} color={finalColor} style={styles.inlineIndicator} />
      {text && (
        <Text style={[styles.inlineText, { color: finalColor }]}>
          {text}
        </Text>
      )}
    </View>
  );
};

// Skeleton loading component
export const SkeletonLoading = ({ width = '100%', height = 20, style }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = createStyles(theme);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          opacity,
        },
        style,
      ]}
    />
  );
};

const createStyles = (theme) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: theme.spacing['3xl'],
    minWidth: 200,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  logoContainer: {
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: 60,
    height: 60,
  },
  indicatorContainer: {
    marginBottom: theme.spacing.lg,
  },
  text: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  brandContainer: {
    alignItems: 'center',
  },
  brandText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography?.fontWeight?.bold || '700',
    color: theme.colors.primary,
    marginBottom: 2,
  },
  brandSubtext: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
  },
  inlineIndicator: {
    marginRight: theme.spacing.sm,
  },
  inlineText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: '500',
  },
  skeleton: {
    backgroundColor: theme.colors.gray200,
    borderRadius: 4,
  },
});

export default Loading;