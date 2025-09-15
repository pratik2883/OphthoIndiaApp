import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getTheme } from '../../theme';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';
import CurrencyConverter from '../CurrencyConverter';

const Header = ({
  title,
  subtitle,
  showLogo = false,
  showBack = false,
  showCart = false,
  showSearch = false,
  showProfile = false,
  showWishlist = false,
  showCurrency = false,
  onBackPress,
  onCartPress,
  onSearchPress,
  onProfilePress,
  onWishlistPress,
  rightComponent,
  style,
  backgroundColor,
  textColor,
}) => {
  const { user } = useAuth();
  const { getTotalItems } = useCart();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = createStyles(theme);
  const cartItemCount = getTotalItems();
  
  const finalBackgroundColor = backgroundColor || theme.colors.primary;
  const finalTextColor = textColor || theme.colors.textOnPrimary;

  const renderLeftSection = () => {
    if (showBack) {
      return (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={finalTextColor} />
        </TouchableOpacity>
      );
    }

    if (showLogo) {
      return (
        <View style={styles.userProfileContainer}>
          {user?.avatar_url ? (
            <Image
              source={{ uri: user.avatar_url }}
              style={styles.userProfileImage}
            />
          ) : (
            <View style={styles.userProfilePlaceholder}>
              <Text style={styles.userProfileInitial}>
                {user?.firstName?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.firstName || 'User'}
            </Text>
            <Text style={styles.userGreeting} numberOfLines={1}>
              Good {getTimeOfDay()}
            </Text>
          </View>
        </View>
      );
    }

    return <View style={styles.leftPlaceholder} />;
  };

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  };

  const renderCenterSection = () => {
    if (showLogo) {
      return null;
    }

    return (
      <View style={styles.centerContainer}>
        {title && (
          <Text
            style={[styles.title, { color: finalTextColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
        )}
        {subtitle && (
          <Text
            style={[styles.subtitle, { color: finalTextColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
      </View>
    );
  };

  const renderRightSection = () => {
    if (rightComponent) {
      return rightComponent;
    }

    return (
      <View style={styles.rightContainer}>
        {showSearch && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSearchPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="search" size={24} color={finalTextColor} />
          </TouchableOpacity>
        )}

        {showWishlist && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onWishlistPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="heart-outline" size={24} color={finalTextColor} />
          </TouchableOpacity>
        )}

        {showCurrency && (
          <View style={styles.currencyContainer}>
            <CurrencyConverter />
          </View>
        )}

        {showCart && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onCartPress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <View style={styles.cartContainer}>
              <Ionicons name="cart-outline" size={24} color={finalTextColor} />
              {cartItemCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <>
      <StatusBar
        barStyle={finalBackgroundColor === theme.colors.primary ? 'light-content' : 'dark-content'}
        translucent={false}
      />
      <View style={[styles.container, { backgroundColor: finalBackgroundColor }, style]}>
        {renderLeftSection()}
        {renderCenterSection()}
        {renderRightSection()}
      </View>
    </>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: Platform.OS === 'ios' ? 44 : 56,
    ...theme.shadows.sm,
  },
  leftPlaceholder: {
    width: 40,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  logoWithBackground: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    alignSelf: 'flex-start',
    ...theme.shadows.sm,
  },
  userProfileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userProfilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userProfileInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  userGreeting: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography?.fontWeight?.semibold || '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyContainer: {
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
  iconButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
  },
  cartContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: theme.typography?.fontWeight?.bold || '700',
    color: theme.colors.white,
    textAlign: 'center',
  },
  profileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  profilePlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography?.fontWeight?.bold || '700',
    color: theme.colors.primary,
  },
});

export default Header;