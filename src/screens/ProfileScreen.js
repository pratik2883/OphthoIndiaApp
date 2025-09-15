import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const { isDarkMode, themeMode, changeThemeMode, getThemeName, THEME_MODES } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const theme = getTheme(isDarkMode);

  const createStyles = (theme) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    profileHeader: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatarContainer: {
      position: 'relative',
      marginRight: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#f0f0f0',
    },
    editAvatarButton: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      backgroundColor: '#007AFF',
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#fff',
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    editProfileButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    editProfileText: {
      fontSize: 14,
      color: '#007AFF',
      marginLeft: 4,
      fontWeight: '500',
    },
    section: {
      marginTop: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginHorizontal: 20,
      marginBottom: 8,
    },
    sectionContent: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      borderRadius: 12,
      overflow: 'hidden',
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    menuIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#f0f8ff',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    menuItemText: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: '500',
    },
    themeValue: {
      fontSize: 14,
      fontWeight: '500',
      textTransform: 'capitalize',
    },
    menuItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: 16,
      marginTop: 20,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#dc3545',
    },
    logoutText: {
      fontSize: 16,
      color: '#dc3545',
      fontWeight: '600',
      marginLeft: 8,
    },
    footer: {
      alignItems: 'center',
      padding: 20,
      marginTop: 20,
    },
    footerText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
  });

  const styles = createStyles(theme);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notifications = await AsyncStorage.getItem('notifications_enabled');
      
      if (notifications !== null) {
        setNotificationsEnabled(JSON.parse(notifications));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleNotificationToggle = (value) => {
    setNotificationsEnabled(value);
    saveSettings('notifications_enabled', value);
  };

  const handleThemePress = () => {
    Alert.alert(
      'Choose Theme',
      'Select your preferred theme mode',
      [
        {
          text: 'Light',
          onPress: () => changeThemeMode(THEME_MODES.LIGHT),
        },
        {
          text: 'Dark',
          onPress: () => changeThemeMode(THEME_MODES.DARK),
        },
        {
          text: 'System',
          onPress: () => changeThemeMode(THEME_MODES.SYSTEM),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleAddresses = () => {
    navigation.navigate('Addresses');
  };

  const handlePaymentMethods = () => {
    navigation.navigate('PaymentMethods');
  };

  const handleOrderHistory = () => {
    navigation.navigate('Orders');
  };

  const handleWishlist = () => {
    Alert.alert(
      'Coming Soon',
      'Wishlist feature is coming soon!',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact us?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => {
            // Open email app
            console.log('Opening email...');
          },
        },
        {
          text: 'Phone',
          onPress: () => {
            // Open phone app
            console.log('Opening phone...');
          },
        },
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Ophtho India',
      'Ophtho India App v1.0.0\n\nYour trusted partner for ophthalmic products and services.',
      [{ text: 'OK' }]
    );
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <Image
          source={require('../../assets/images/logo.png')}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.editAvatarButton}>
          <Ionicons name="camera" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        
        <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
          <Ionicons name="pencil" size={14} color="#007AFF" />
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderMenuItem = (icon, title, onPress, showArrow = true, rightComponent = null) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={20} color="#007AFF" />
        </View>
        <Text style={styles.menuItemText}>{title}</Text>
      </View>
      
      <View style={styles.menuItemRight}>
        {rightComponent}
        {showArrow && <Ionicons name="chevron-forward" size={16} color="#ccc" />}
      </View>
    </TouchableOpacity>
  );

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderProfileHeader()}
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionContent}>
          {renderMenuItem('person-outline', 'Personal Information', handleEditProfile)}
          {renderMenuItem('lock-closed-outline', 'Change Password', handleChangePassword)}
          {renderMenuItem('location-outline', 'Addresses', handleAddresses)}
          {renderMenuItem('card-outline', 'Payment Methods', handlePaymentMethods)}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Orders & Wishlist</Text>
        <View style={styles.sectionContent}>
          {renderMenuItem('receipt-outline', 'Order History', handleOrderHistory)}
          {renderMenuItem('heart-outline', 'Wishlist', handleWishlist)}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.sectionContent}>
          {renderMenuItem(
            'notifications-outline',
            'Push Notifications',
            null,
            false,
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: '#ccc', true: '#007AFF' }}
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
            />
          )}
          {renderMenuItem(
            'moon-outline',
            'Theme',
            handleThemePress,
            true,
            <Text style={[styles.themeValue, { color: theme.colors.text }]}>
              {getThemeName()}
            </Text>
          )}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.sectionContent}>
          {renderMenuItem('help-circle-outline', 'Help & Support', handleSupport)}
          {renderMenuItem('information-circle-outline', 'About', handleAbout)}
        </View>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#dc3545" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ophtho India App v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;