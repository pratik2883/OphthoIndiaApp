import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';

const PaymentMethodsScreen = ({ navigation }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = createStyles(theme);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    isDefault: false,
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const stored = await AsyncStorage.getItem('paymentMethods');
      if (stored) {
        setPaymentMethods(JSON.parse(stored));
      } else {
        // Start with empty payment methods for new users
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePaymentMethods = async (methods) => {
    try {
      await AsyncStorage.setItem('paymentMethods', JSON.stringify(methods));
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error saving payment methods:', error);
      Alert.alert('Error', 'Failed to save payment method');
    }
  };

  const formatCardNumber = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add spaces every 4 digits
    const formatted = cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted.substring(0, 19); // Limit to 16 digits + 3 spaces
  };

  const formatExpiryDate = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    // Add slash after 2 digits
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const getCardIcon = (type) => {
    switch (type) {
      case 'visa':
        return 'card-outline';
      case 'mastercard':
        return 'card-outline';
      case 'amex':
        return 'card-outline';
      default:
        return 'card-outline';
    }
  };

  const detectCardType = (cardNumber) => {
    const cleaned = cardNumber.replace(/\D/g, '');
    if (cleaned.startsWith('4')) return 'visa';
    if (cleaned.startsWith('5') || cleaned.startsWith('2')) return 'mastercard';
    if (cleaned.startsWith('3')) return 'amex';
    return 'unknown';
  };

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.expiryDate || !newCard.cvv || !newCard.cardholderName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const cardNumber = newCard.cardNumber.replace(/\D/g, '');
    if (cardNumber.length < 13 || cardNumber.length > 19) {
      Alert.alert('Error', 'Please enter a valid card number');
      return;
    }

    if (newCard.cvv.length < 3 || newCard.cvv.length > 4) {
      Alert.alert('Error', 'Please enter a valid CVV');
      return;
    }

    const newMethod = {
      id: Date.now().toString(),
      type: detectCardType(newCard.cardNumber),
      lastFour: cardNumber.slice(-4),
      expiryDate: newCard.expiryDate,
      cardholderName: newCard.cardholderName,
      isDefault: newCard.isDefault,
    };

    let updatedMethods = [...paymentMethods];
    
    // If this is set as default, remove default from others
    if (newCard.isDefault) {
      updatedMethods = updatedMethods.map(method => ({
        ...method,
        isDefault: false,
      }));
    }

    updatedMethods.push(newMethod);
    savePaymentMethods(updatedMethods);

    // Reset form
    setNewCard({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: '',
      isDefault: false,
    });
    setShowAddModal(false);
  };

  const handleSetDefault = (id) => {
    const updatedMethods = paymentMethods.map(method => ({
      ...method,
      isDefault: method.id === id,
    }));
    savePaymentMethods(updatedMethods);
  };

  const handleDeleteCard = (id) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedMethods = paymentMethods.filter(method => method.id !== id);
            savePaymentMethods(updatedMethods);
          },
        },
      ]
    );
  };

  const renderPaymentMethod = ({ item }) => (
    <View style={styles.paymentMethodCard}>
      <View style={styles.cardHeader}>
        <View style={styles.cardInfo}>
          <Ionicons name={getCardIcon(item.type)} size={24} color={theme.colors.primary} />
          <View style={styles.cardDetails}>
            <Text style={styles.cardNumber}>•••• •••• •••• {item.lastFour}</Text>
            <Text style={styles.cardExpiry}>Expires {item.expiryDate}</Text>
            <Text style={styles.cardholderName}>{item.cardholderName}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteCard(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      {!item.isDefault && (
        <TouchableOpacity
          style={styles.setDefaultButton}
          onPress={() => handleSetDefault(item.id)}
        >
          <Text style={styles.setDefaultText}>Set as Default</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Methods</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={theme.colors.white} />
          <Text style={styles.addButtonText}>Add Card</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading payment methods...</Text>
        </View>
      ) : (
        <FlatList
          data={paymentMethods}
          renderItem={renderPaymentMethod}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={64} color={theme.colors.gray} />
              <Text style={styles.emptyText}>No payment methods added</Text>
              <Text style={styles.emptySubtext}>Add a card to get started</Text>
            </View>
          }
        />
      )}

      {/* Add Card Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Payment Method</Text>
            <TouchableOpacity onPress={handleAddCard}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Card Number</Text>
              <TextInput
                style={styles.input}
                value={newCard.cardNumber}
                onChangeText={(text) => setNewCard({ ...newCard, cardNumber: formatCardNumber(text) })}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  value={newCard.expiryDate}
                  onChangeText={(text) => setNewCard({ ...newCard, expiryDate: formatExpiryDate(text) })}
                  placeholder="MM/YY"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  value={newCard.cvv}
                  onChangeText={(text) => setNewCard({ ...newCard, cvv: text.replace(/\D/g, '') })}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                value={newCard.cardholderName}
                onChangeText={(text) => setNewCard({ ...newCard, cardholderName: text })}
                placeholder="John Doe"
                autoCapitalize="words"
              />
            </View>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setNewCard({ ...newCard, isDefault: !newCard.isDefault })}
            >
              <Ionicons
                name={newCard.isDefault ? 'checkbox' : 'checkbox-outline'}
                size={24}
                color={theme.colors.primary}
              />
              <Text style={styles.checkboxLabel}>Set as default payment method</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
    marginLeft: 4,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  paymentMethodCard: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  cardDetails: {
    marginLeft: 12,
    flex: 1,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cardExpiry: {
    fontSize: 14,
    color: theme.colors.gray,
    marginTop: 2,
  },
  cardholderName: {
    fontSize: 14,
    color: theme.colors.gray,
    marginTop: 2,
  },
  cardActions: {
    alignItems: 'flex-end',
  },
  defaultBadge: {
    backgroundColor: theme.colors.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  defaultText: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  actionButton: {
    padding: 4,
  },
  setDefaultButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  setDefaultText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.gray,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  cancelText: {
    fontSize: 16,
    color: theme.colors.gray,
  },
  saveText: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: theme.colors.white,
  },
  row: {
    flexDirection: 'row',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 16,
    color: theme.colors.text,
  },
});

export default PaymentMethodsScreen;