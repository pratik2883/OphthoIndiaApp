import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import WooCommerceAPI from '../../services/woocommerceApi';

const AddressesScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [addresses, setAddresses] = useState({
    billing: null,
    shipping: null,
  });

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = () => {
    if (user) {
      setAddresses({
        billing: user.billing || null,
        shipping: user.shipping || null,
      });
    }
  };

  const handleEditAddress = (type) => {
    navigation.navigate('EditAddress', {
      addressType: type,
      address: addresses[type],
      onSave: handleAddressSave,
    });
  };

  const handleAddressSave = async (type, addressData) => {
    try {
      setIsLoading(true);
      
      let updatedUser;
      
      if (type === 'billing') {
        updatedUser = await WooCommerceAPI.updateCustomerBilling(user?.id, addressData);
      } else {
        updatedUser = await WooCommerceAPI.updateCustomerShipping(user?.id, addressData);
      }
      
      await updateUser(updatedUser);
      
      setAddresses(prev => ({
        ...prev,
        [type]: addressData,
      }));
      
      Alert.alert(
        'Success', 
        `${type.charAt(0).toUpperCase() + type.slice(1)} address updated successfully!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error updating address:', error);
      
      let errorMessage = 'Failed to update address. Please try again.';
      
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
        'Update Failed',
        errorMessage,
        [
          { text: 'OK' },
          {
            text: 'Retry',
            onPress: () => handleAddressSave(type, addressData),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = (type) => {
    Alert.alert(
      'Delete Address',
      `Are you sure you want to delete your ${type} address?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddress(type),
        },
      ]
    );
  };

  const deleteAddress = async (type) => {
    try {
      setIsLoading(true);
      
      const emptyAddress = {
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        email: type === 'billing' ? user.email : '',
        phone: '',
      };

      let updatedUser;
      
      if (type === 'billing') {
        updatedUser = await WooCommerceAPI.updateCustomerBilling(user?.id, emptyAddress);
      } else {
        updatedUser = await WooCommerceAPI.updateCustomerShipping(user?.id, emptyAddress);
      }
      
      await updateUser(updatedUser);
      
      setAddresses(prev => ({
        ...prev,
        [type]: null,
      }));
      
      Alert.alert(
        'Success', 
        `${type.charAt(0).toUpperCase() + type.slice(1)} address deleted successfully!`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error deleting address:', error);
      
      let errorMessage = 'Failed to delete address. Please try again.';
      
      if (error.status === 400) {
        errorMessage = 'Invalid request. Unable to delete address.';
      } else if (error.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to delete this address.';
      } else if (error.status === 0) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        'Delete Failed',
        errorMessage,
        [
          { text: 'OK' },
          {
            text: 'Retry',
            onPress: () => deleteAddress(type),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isAddressEmpty = (address) => {
    if (!address) return true;
    return !address.address_1 || !address.city || !address.country;
  };

  const formatAddress = (address) => {
    if (!address || isAddressEmpty(address)) return null;
    
    const parts = [];
    
    if (address.first_name || address.last_name) {
      parts.push(`${address.first_name} ${address.last_name}`.trim());
    }
    
    if (address.company) {
      parts.push(address.company);
    }
    
    if (address.address_1) {
      parts.push(address.address_1);
    }
    
    if (address.address_2) {
      parts.push(address.address_2);
    }
    
    const cityStateZip = [address.city, address.state, address.postcode]
      .filter(Boolean)
      .join(', ');
    
    if (cityStateZip) {
      parts.push(cityStateZip);
    }
    
    if (address.country) {
      parts.push(address.country);
    }
    
    return parts.join('\n');
  };

  const renderAddressCard = (type, address) => {
    const isEmpty = isAddressEmpty(address);
    const formattedAddress = formatAddress(address);
    
    return (
      <View style={styles.addressCard}>
        <View style={styles.addressHeader}>
          <View style={styles.addressTitleContainer}>
            <Ionicons 
              name={type === 'billing' ? 'card-outline' : 'location-outline'} 
              size={20} 
              color="#007AFF" 
            />
            <Text style={styles.addressTitle}>
              {type.charAt(0).toUpperCase() + type.slice(1)} Address
            </Text>
          </View>
          
          <View style={styles.addressActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditAddress(type)}
              disabled={isLoading}
            >
              <Ionicons 
                name={isEmpty ? 'add' : 'pencil'} 
                size={16} 
                color="#007AFF" 
              />
            </TouchableOpacity>
            
            {!isEmpty && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => handleDeleteAddress(type)}
                disabled={isLoading}
              >
                <Ionicons name="trash-outline" size={16} color="#dc3545" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View style={styles.addressContent}>
          {isEmpty ? (
            <View style={styles.emptyAddress}>
              <Text style={styles.emptyAddressText}>
                No {type} address added yet
              </Text>
              <TouchableOpacity 
                style={styles.addAddressButton}
                onPress={() => handleEditAddress(type)}
                disabled={isLoading}
              >
                <Text style={styles.addAddressButtonText}>
                  Add {type} address
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.addressText}>{formattedAddress}</Text>
              
              {type === 'billing' && address.phone && (
                <View style={styles.contactInfo}>
                  <Ionicons name="call-outline" size={14} color="#666" />
                  <Text style={styles.contactText}>{address.phone}</Text>
                </View>
              )}
              
              {type === 'billing' && address.email && (
                <View style={styles.contactInfo}>
                  <Ionicons name="mail-outline" size={14} color="#666" />
                  <Text style={styles.contactText}>{address.email}</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>My Addresses</Text>
      <Text style={styles.headerSubtitle}>
        Manage your billing and shipping addresses
      </Text>
    </View>
  );

  const renderInfoCard = () => (
    <View style={styles.infoCard}>
      <View style={styles.infoHeader}>
        <Ionicons name="information-circle" size={20} color="#007AFF" />
        <Text style={styles.infoTitle}>Address Information</Text>
      </View>
      <Text style={styles.infoText}>
        • Billing address is used for payment processing{"\n"}
        • Shipping address is where your orders will be delivered{"\n"}
        • You can use the same address for both billing and shipping
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Updating address...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {renderAddressCard('billing', addresses.billing)}
      {renderAddressCard('shipping', addresses.shipping)}
      {renderInfoCard()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  addressCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  addressTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  addressActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  addressContent: {
    padding: 16,
  },
  emptyAddress: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyAddressText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  addAddressButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addAddressButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  addressText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 6,
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
});

export default AddressesScreen;