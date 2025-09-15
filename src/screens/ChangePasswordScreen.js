import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';

const ChangePasswordScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    // Password should be at least 8 characters with at least one number and one letter
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    return passwordRegex.test(password);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (!validatePassword(newPassword)) {
      Alert.alert(
        'Invalid Password',
        'Password must be at least 8 characters long and contain at least one letter and one number'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      // In a real app, you would verify the current password with the backend
      // For now, we'll simulate the password change
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      Alert.alert(
        'Success',
        'Password changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs', { screen: 'Profile' });
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPasswordInput = (value, onChangeText, placeholder, showPassword, toggleShow) => (
    <View style={dynamicStyles.inputContainer}>
      <TextInput
        style={dynamicStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
      <TouchableOpacity
        style={styles.eyeIcon}
        onPress={toggleShow}
      >
        <Ionicons
          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
          size={24}
          color={theme.colors.gray}
        />
      </TouchableOpacity>
    </View>
  );

  const dynamicStyles = {
    container: {
      ...styles.container,
      backgroundColor: theme.colors.background,
    },
    title: {
      ...styles.title,
      color: theme.colors.text,
    },
    subtitle: {
      ...styles.subtitle,
      color: theme.colors.gray,
    },
    label: {
      ...styles.label,
      color: theme.colors.text,
    },
    inputContainer: {
      ...styles.inputContainer,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.white,
    },
    input: {
      ...styles.input,
      color: theme.colors.text,
    },
    passwordHint: {
      ...styles.passwordHint,
      color: theme.colors.gray,
    },
    changeButton: {
      ...styles.changeButton,
      backgroundColor: theme.colors.primary,
    },
    disabledButton: {
      ...styles.disabledButton,
      backgroundColor: theme.colors.gray,
    },
    changeButtonText: {
      ...styles.changeButtonText,
      color: theme.colors.white,
    },
  };

  return (
    <KeyboardAvoidingView
      style={dynamicStyles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={dynamicStyles.title}>Change Password</Text>
          <Text style={dynamicStyles.subtitle}>
            Enter your current password and choose a new secure password
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.fieldContainer}>
            <Text style={dynamicStyles.label}>Current Password</Text>
            {renderPasswordInput(
              currentPassword,
              setCurrentPassword,
              'Enter current password',
              showCurrentPassword,
              () => setShowCurrentPassword(!showCurrentPassword)
            )}
          </View>

          <View style={styles.fieldContainer}>
            <Text style={dynamicStyles.label}>New Password</Text>
            {renderPasswordInput(
              newPassword,
              setNewPassword,
              'Enter new password',
              showNewPassword,
              () => setShowNewPassword(!showNewPassword)
            )}
            <Text style={dynamicStyles.passwordHint}>
              Password must be at least 8 characters with letters and numbers
            </Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={dynamicStyles.label}>Confirm New Password</Text>
            {renderPasswordInput(
              confirmPassword,
              setConfirmPassword,
              'Confirm new password',
              showConfirmPassword,
              () => setShowConfirmPassword(!showConfirmPassword)
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[dynamicStyles.changeButton, loading && dynamicStyles.disabledButton]}
          onPress={handleChangePassword}
          disabled={loading}
        >
          <Text style={dynamicStyles.changeButtonText}>
            {loading ? 'Changing Password...' : 'Change Password'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    header: {
      marginBottom: 30,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 22,
    },
    form: {
      marginBottom: 30,
    },
    fieldContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 12,
    },
    input: {
      flex: 1,
      height: 50,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    eyeIcon: {
      padding: 12,
    },
    passwordHint: {
      fontSize: 12,
      marginTop: 4,
    },
    changeButton: {
      borderRadius: 12,
      height: 50,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
    },
    disabledButton: {
    },
    changeButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default ChangePasswordScreen;