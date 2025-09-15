import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EditAddressScreen = ({ navigation, route }) => {
  const { addressType, address, onSave } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    postcode: '',
    country: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (address) {
      setFormData({
        first_name: address.first_name || '',
        last_name: address.last_name || '',
        company: address.company || '',
        address_1: address.address_1 || '',
        address_2: address.address_2 || '',
        city: address.city || '',
        state: address.state || '',
        postcode: address.postcode || '',
        country: address.country || '',
        phone: address.phone || '',
        email: address.email || '',
      });
    }
  }, [address]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.address_1.trim()) {
      newErrors.address_1 = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }

    if (!formData.postcode.trim()) {
      newErrors.postcode = 'Postal code is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    if (addressType === 'billing') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required for billing address';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }

      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required for billing address';
      } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      await onSave(addressType, formData);
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Addresses');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      
      let errorMessage = 'Failed to save address. Please try again.';
      
      if (error.status === 400) {
        errorMessage = 'Invalid address data. Please check your information.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to update this address.';
      } else if (error.status === 422) {
        errorMessage = error.message || 'Address validation failed. Please check your input.';
      } else if (error.status === 0) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Save Failed',
        errorMessage,
        [
          { text: 'OK' },
          {
            text: 'Retry',
            onPress: () => handleSave(),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const renderInput = (label, field, placeholder, keyboardType = 'default', required = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize={field === 'email' ? 'none' : 'words'}
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {address ? 'Edit' : 'Add'} {addressType.charAt(0).toUpperCase() + addressType.slice(1)} Address
          </Text>
          <Text style={styles.headerSubtitle}>
            {addressType === 'billing' 
              ? 'This address will be used for payment processing'
              : 'This address will be used for order delivery'
            }
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            {renderInput('First Name', 'first_name', 'Enter first name', 'default', true)}
            {renderInput('Last Name', 'last_name', 'Enter last name', 'default', true)}
            {renderInput('Company', 'company', 'Company name (optional)')}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Address Details</Text>
            {renderInput('Street Address', 'address_1', 'Enter street address', 'default', true)}
            {renderInput('Apartment, suite, etc.', 'address_2', 'Apartment, suite, unit, etc. (optional)')}
            {renderInput('City', 'city', 'Enter city', 'default', true)}
            {renderInput('State/Province', 'state', 'Enter state or province', 'default', true)}
            {renderInput('Postal Code', 'postcode', 'Enter postal code', 'default', true)}
            {renderInput('Country', 'country', 'Enter country', 'default', true)}
          </View>

          {addressType === 'billing' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact Information</Text>
              {renderInput('Email', 'email', 'Enter email address', 'email-address', true)}
              {renderInput('Phone', 'phone', 'Enter phone number', 'phone-pad', true)}
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text style={styles.infoTitle}>Address Guidelines</Text>
          </View>
          <Text style={styles.infoText}>
            • Ensure all required fields are filled correctly{"\n"}
            • Use your full legal name for billing addresses{"\n"}
            • Double-check postal codes and city names{"\n"}
            • {addressType === 'billing' 
                ? 'Billing address should match your payment method'
                : 'Shipping address should be where you want orders delivered'
              }
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Addresses');
            }
          }}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.saveButtonText}>Save Address</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  form: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: '#dc3545',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    fontSize: 12,
    color: '#dc3545',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#f0f8ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default EditAddressScreen;