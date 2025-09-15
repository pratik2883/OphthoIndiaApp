import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
  AppState,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import WooCommerceAPI from '../services/woocommerceApi';
import PaymentService from '../services/PaymentService';

const CheckoutScreen = ({ navigation }) => {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { formatPrice, convertPrice } = useCurrency();
  
  const [isLoading, setIsLoading] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    first_name: user?.billing?.first_name || user?.firstName || '',
    last_name: user?.billing?.last_name || user?.lastName || '',
    email: user?.billing?.email || user?.email || '',
    phone: user?.billing?.phone || user?.phone || '',
    address_1: user?.billing?.address_1 || '',
    address_2: user?.billing?.address_2 || '',
    city: user?.billing?.city || '',
    state: user?.billing?.state || '',
    postcode: user?.billing?.postcode || '',
    country: user?.billing?.country || 'US',
  });
  
  const [shippingInfo, setShippingInfo] = useState({
    first_name: user?.shipping?.first_name || user?.firstName || '',
    last_name: user?.shipping?.last_name || user?.lastName || '',
    address_1: user?.shipping?.address_1 || '',
    address_2: user?.shipping?.address_2 || '',
    city: user?.shipping?.city || '',
    state: user?.shipping?.state || '',
    postcode: user?.shipping?.postcode || '',
    country: user?.shipping?.country || 'US',
  });
  
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState(''); // No default payment method
  const [selectedCard, setSelectedCard] = useState(null);
  const [savedCards, setSavedCards] = useState([]);
  const [orderNotes, setOrderNotes] = useState('');

  // Update address fields when user data changes (async loading)
  useEffect(() => {
    if (user) {
      setBillingInfo({
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        email: user.email || '',
        phone: user.billing?.phone || '',
        address_1: user.billing?.address_1 || '',
        address_2: user.billing?.address_2 || '',
        city: user.billing?.city || '',
        state: user.billing?.state || '',
        postcode: user.billing?.postcode || '',
        country: user.billing?.country || 'IN',
      });
      
      setShippingInfo({
        first_name: user.firstName || '',
        last_name: user.lastName || '',
        email: user.email || '',
        phone: user.billing?.phone || '',
        address_1: user.shipping?.address_1 || user.billing?.address_1 || '',
        address_2: user.shipping?.address_2 || user.billing?.address_2 || '',
        city: user.shipping?.city || user.billing?.city || '',
        state: user.shipping?.state || user.billing?.state || '',
        postcode: user.shipping?.postcode || user.billing?.postcode || '',
        country: user.shipping?.country || user.billing?.country || 'IN',
      });
    }
  }, [user]);

  // Load saved payment methods
  useEffect(() => {
    loadSavedCards();
  }, []);

  const loadSavedCards = async () => {
    try {
      const stored = await AsyncStorage.getItem('paymentMethods');
      if (stored) {
        const cards = JSON.parse(stored);
        setSavedCards(cards);
        // Set default card if available
        const defaultCard = cards.find(card => card.isDefault);
        if (defaultCard) {
          setSelectedCard(defaultCard);
        }
      }
    } catch (error) {
      console.error('Error loading saved cards:', error);
    }
  };



  const subtotal = getTotalPrice();
  const shipping = 0; // Free shipping
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + shipping + tax;

  const updateBillingInfo = (field, value) => {
    setBillingInfo(prev => ({ ...prev, [field]: value }));
    
    // If same as billing is checked, update shipping info too
    if (sameAsBilling && ['first_name', 'last_name', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country'].includes(field)) {
      setShippingInfo(prev => ({ ...prev, [field]: value }));
    }
  };

  const updateShippingInfo = (field, value) => {
    setShippingInfo(prev => ({ ...prev, [field]: value }));
  };

  const toggleSameAsBilling = () => {
    setSameAsBilling(!sameAsBilling);
    if (!sameAsBilling) {
      // Copy billing to shipping
      setShippingInfo({
        first_name: billingInfo.first_name,
        last_name: billingInfo.last_name,
        address_1: billingInfo.address_1,
        address_2: billingInfo.address_2,
        city: billingInfo.city,
        state: billingInfo.state,
        postcode: billingInfo.postcode,
        country: billingInfo.country,
      });
    }
  };

  const validateForm = () => {
    const requiredBillingFields = ['first_name', 'last_name', 'email', 'phone', 'address_1', 'city', 'state', 'postcode'];
    const requiredShippingFields = ['first_name', 'last_name', 'address_1', 'city', 'state', 'postcode'];
    
    for (const field of requiredBillingFields) {
      if (!billingInfo[field]) {
        Alert.alert('Error', `Please fill in the billing ${field.replace('_', ' ')}.`);
        return false;
      }
    }
    
    if (!sameAsBilling) {
      for (const field of requiredShippingFields) {
        if (!shippingInfo[field]) {
          Alert.alert('Error', `Please fill in the shipping ${field.replace('_', ' ')}.`);
          return false;
        }
      }
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(billingInfo.email)) {
      Alert.alert('Error', 'Please enter a valid email address.');
      return false;
    }
    
    // Validate payment method selection
    if (!paymentMethod) {
      Alert.alert('Error', 'Please select a payment method to continue.');
      return false;
    }
    
    // Validate card selection for card payments
    if (paymentMethod === 'credit_debit_cards' && !selectedCard) {
      Alert.alert('Error', 'Please select a payment card.');
      return false;
    }
    
    return true;
  };

  const placeOrder = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // Map payment methods to WooCommerce payment gateway IDs
      const getPaymentMethodData = (method) => {
        switch (method) {
          case 'upi_qr':
            return { id: 'upi', title: 'UPI QR Code', set_paid: false };
          case 'razorpay':
            return { id: 'razorpay', title: 'Razorpay', set_paid: false };
          case 'paypal':
            return { id: 'paypal', title: 'PayPal', set_paid: false };
          default:
            return { id: 'bacs', title: 'Direct Bank Transfer', set_paid: true };
        }
      };
      
      const paymentData = getPaymentMethodData(paymentMethod);
      
      // Process payment
      let paymentResult = null;
      let transactionId = null;
        const orderDataForPayment = {
          id: Date.now(), // Temporary ID for payment
          total: convertPrice(getTotalPrice()),
          currency: 'INR', // Keep INR for backend compatibility
          billing: billingInfo
        };
        
        // Process payment based on selected method
        switch (paymentMethod) {
          case 'razorpay':
            paymentResult = await PaymentService.processPayment('razorpay', orderDataForPayment);
            if (!paymentResult.success) {
              setIsLoading(false);
              Alert.alert(
                'Payment Method Unavailable',
                paymentResult.error + '\n\nRecommended: Use UPI QR Code for instant payments.',
                [
                  { text: 'Switch to UPI', onPress: () => setPaymentMethod('upi_qr') },
                  { text: 'OK' }
                ]
              );
              return;
            }
            break;
          case 'upi_qr':
            paymentResult = await PaymentService.processPayment('upi', orderDataForPayment);
            if (paymentResult.success && paymentResult.upiUrl) {
              // Check if UPI app can be opened
              const canOpen = await Linking.canOpenURL(paymentResult.upiUrl);
              if (canOpen) {
                try {
                  // Track app state to detect if user actually went to UPI app
                  let appLeftTime = null;
                  let appReturnTime = null;
                  let appStateSubscription = null;
                  
                  const handleAppStateChange = (nextAppState) => {
                    if (nextAppState === 'background' || nextAppState === 'inactive') {
                      appLeftTime = Date.now();
                    } else if (nextAppState === 'active' && appLeftTime) {
                      appReturnTime = Date.now();
                    }
                  };
                  
                  // Subscribe to app state changes
                  appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
                  
                  // Open UPI app
                  await Linking.openURL(paymentResult.upiUrl);
                  
                  // Wait for user to return from UPI app
                  await new Promise(resolve => {
                    const checkReturn = setInterval(() => {
                      if (appReturnTime) {
                        clearInterval(checkReturn);
                        if (appStateSubscription) {
                          appStateSubscription.remove();
                        }
                        resolve();
                      }
                    }, 500);
                    
                    // Timeout after 5 minutes
                    setTimeout(() => {
                      clearInterval(checkReturn);
                      if (appStateSubscription) {
                        appStateSubscription.remove();
                      }
                      resolve();
                    }, 300000);
                  });
                  
                  // Check if user spent enough time in UPI app (at least 5 seconds)
                  const timeSpentInUPIApp = appReturnTime && appLeftTime ? appReturnTime - appLeftTime : 0;
                  
                  if (timeSpentInUPIApp < 5000) {
                    // User came back too quickly, likely pressed back without payment
                    paymentResult.success = false;
                    paymentResult.error = 'Payment cancelled - insufficient time spent in UPI app';
                    
                    Alert.alert(
                      'Payment Cancelled',
                      'It appears you returned from the UPI app without completing the payment. Please try again and complete the payment in your UPI app.',
                      [{ text: 'OK' }]
                    );
                  } else {
                    // User spent enough time, show confirmation dialog
                    const confirmed = await new Promise((resolve) => {
                      Alert.alert(
                        'UPI Payment',
                        'Please confirm if your payment was successful in the UPI app.\n\nNote: Only confirm if payment was actually completed.',
                        [
                          { 
                            text: 'Payment Failed', 
                            style: 'cancel',
                            onPress: () => resolve(false) 
                          },
                          { 
                            text: 'Payment Completed', 
                            style: 'default',
                            onPress: () => resolve(true) 
                          }
                        ],
                        { cancelable: false }
                      );
                    });
                    paymentResult.success = confirmed;
                  }
                } catch (error) {
                  console.error('Error opening UPI app:', error);
                  paymentResult.success = false;
                  paymentResult.error = 'Failed to open UPI app';
                }
              } else {
                paymentResult.success = false;
                paymentResult.error = 'No UPI app found on device';
              }
            }
            break;
          case 'paypal':
            paymentResult = await PaymentService.processPayment('paypal', orderDataForPayment);
            break;

          default:
            paymentResult = { success: true };
        }
        
      // Handle payment result
      if (paymentResult.success) {
        // Store transaction ID if available
        if (paymentResult.paymentId) {
          transactionId = paymentResult.paymentId;
        }
      } else {
        // Payment failed - stop order creation for UPI and other online payments
        if (paymentMethod === 'upi_qr') {
          setIsLoading(false);
          Alert.alert(
            'Payment Cancelled',
            'UPI payment was not completed. Please try again or choose a different payment method.',
            [{ text: 'OK' }]
          );
          return;
        } else {
          // For other payment methods, show error but allow order creation with pending status
          console.warn('Payment failed:', paymentResult.error);
          Alert.alert(
            'Payment Failed',
            `Payment could not be processed: ${paymentResult.error || 'Unknown error'}. Your order will be created with pending status.`,
            [{ text: 'Continue' }]
          );
        }
      }
      
      // Prepare order data according to WooCommerce REST API v3 specification
      const orderData = {
        status: paymentResult?.success ? 'processing' : 'pending',
        currency: 'INR',
        customer_id: user?.id || 0, // Include customer ID if user is logged in
        payment_method: paymentData.id,
        payment_method_title: paymentData.title,
        set_paid: paymentResult?.success ? true : paymentData.set_paid,
        transaction_id: transactionId || '',
        billing: {
          first_name: billingInfo.first_name,
          last_name: billingInfo.last_name,
          address_1: billingInfo.address_1,
          address_2: billingInfo.address_2,
          city: billingInfo.city,
          state: billingInfo.state,
          postcode: billingInfo.postcode,
          country: billingInfo.country,
          email: billingInfo.email,
          phone: billingInfo.phone,
        },
        shipping: {
          first_name: sameAsBilling ? billingInfo.first_name : shippingInfo.first_name,
          last_name: sameAsBilling ? billingInfo.last_name : shippingInfo.last_name,
          address_1: sameAsBilling ? billingInfo.address_1 : shippingInfo.address_1,
          address_2: sameAsBilling ? billingInfo.address_2 : shippingInfo.address_2,
          city: sameAsBilling ? billingInfo.city : shippingInfo.city,
          state: sameAsBilling ? billingInfo.state : shippingInfo.state,
          postcode: sameAsBilling ? billingInfo.postcode : shippingInfo.postcode,
          country: sameAsBilling ? billingInfo.country : shippingInfo.country,
        },
        line_items: cartItems.map(item => ({
          product_id: parseInt(item?.product?.id),
          quantity: parseInt(item.quantity),
          price: parseFloat(item?.product?.price || 0),
        })),
        shipping_lines: [
          {
            method_id: 'free_shipping',
            method_title: 'Free Shipping',
            total: '0.00',
          },
        ],
        fee_lines: [],
        coupon_lines: [],
        customer_note: orderNotes,
        meta_data: [
          {
            key: '_order_source',
            value: 'mobile_app'
          },
          {
            key: '_app_version',
            value: '1.0.0'
          },
          ...(transactionId ? [{
            key: '_transaction_id',
            value: transactionId
          }] : []),
          ...(paymentResult?.orderId ? [{
            key: '_payment_order_id',
            value: paymentResult.orderId
          }] : []),
          ...(paymentResult?.signature ? [{
            key: '_payment_signature',
            value: paymentResult.signature
          }] : [])
        ]
      };
      
      console.log('Placing order with data:', JSON.stringify(orderData, null, 2));
      
      const order = await WooCommerceAPI.createOrder(orderData);
      
      console.log('Order created successfully:', order);
      
      // Clear cart after successful order
      clearCart();
      
      // Create success message based on payment method
      let successMessage = `Your order #${order.number || order.id} has been placed successfully.\n\nOrder Total: ${formatPrice(getTotalPrice())}`;
      
      if (transactionId) {
        successMessage += `\n\nPayment Method: ${paymentData.title}\nTransaction ID: ${transactionId}\nPayment Status: Completed ✅`;
      } else {
        successMessage += `\n\nPayment Method: ${paymentData.title}`;
      }
      
      successMessage += `\n\nYou will receive a confirmation email shortly at ${billingInfo.email}`;
      
      Alert.alert(
        'Order Placed Successfully! 🎉',
        successMessage,
        [
          {
            text: 'View Orders',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
              navigation.navigate('Orders');
            },
          },
          {
            text: 'Continue Shopping',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      
      let errorMessage = 'There was an error placing your order. Please try again.';
      let errorTitle = 'Order Failed';
      
      // Handle specific error types
      if (error.status === 400) {
        errorTitle = 'Invalid Order Data';
        errorMessage = 'Please check your order details and try again. Make sure all required fields are filled correctly.';
      } else if (error.status === 401) {
        errorTitle = 'Authentication Error';
        errorMessage = 'Please log in again and try placing your order.';
      } else if (error.status === 403) {
        errorTitle = 'Permission Denied';
        errorMessage = 'You do not have permission to place orders. Please contact support.';
      } else if (error.status === 422) {
        errorTitle = 'Validation Error';
        errorMessage = error.message || 'Some order details are invalid. Please check and try again.';
      } else if (error.status === 0) {
        errorTitle = 'Network Error';
        errorMessage = 'Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert(
        errorTitle,
        errorMessage,
        [
          { text: 'OK' },
          {
            text: 'Retry',
            onPress: () => placeOrder(),
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      
      {cartItems.map((item, index) => (
        <View key={item?.product?.id || `checkout-item-${index}`} style={styles.orderItem}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item?.product?.name}
          </Text>
          <Text style={styles.itemQuantity}>x{item.quantity}</Text>
          <Text style={styles.itemPrice}>
            {formatPrice(parseFloat(item?.product?.price || 0) * item.quantity)}
          </Text>
        </View>
      ))}
      
      <View style={styles.divider} />
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal:</Text>
        <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Shipping:</Text>
        <Text style={[styles.summaryValue, styles.freeShipping]}>Free</Text>
      </View>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Tax (10%):</Text>
        <Text style={styles.summaryValue}>{formatPrice(tax)}</Text>
      </View>
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalValue}>{formatPrice(total)}</Text>
      </View>
    </View>
  );

  const renderBillingInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Billing Information</Text>
      
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="First Name *"
          value={billingInfo.first_name}
          onChangeText={(value) => updateBillingInfo('first_name', value)}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Last Name *"
          value={billingInfo.last_name}
          onChangeText={(value) => updateBillingInfo('last_name', value)}
        />
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Email Address *"
        value={billingInfo.email}
        onChangeText={(value) => updateBillingInfo('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Phone Number *"
        value={billingInfo.phone}
        onChangeText={(value) => updateBillingInfo('phone', value)}
        keyboardType="phone-pad"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Address Line 1 *"
        value={billingInfo.address_1}
        onChangeText={(value) => updateBillingInfo('address_1', value)}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Address Line 2 (Optional)"
        value={billingInfo.address_2}
        onChangeText={(value) => updateBillingInfo('address_2', value)}
      />
      
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="City *"
          value={billingInfo.city}
          onChangeText={(value) => updateBillingInfo('city', value)}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="State *"
          value={billingInfo.state}
          onChangeText={(value) => updateBillingInfo('state', value)}
        />
      </View>
      
      <TextInput
        style={styles.input}
        placeholder="Postal Code *"
        value={billingInfo.postcode}
        onChangeText={(value) => updateBillingInfo('postcode', value)}
      />
    </View>
  );

  const renderShippingInfo = () => (
    <View style={styles.section}>
      <View style={styles.shippingHeader}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <TouchableOpacity 
          style={styles.checkboxContainer}
          onPress={toggleSameAsBilling}
        >
          <Ionicons 
            name={sameAsBilling ? 'checkbox' : 'square-outline'} 
            size={20} 
            color="#007AFF" 
          />
          <Text style={styles.checkboxLabel}>Same as billing</Text>
        </TouchableOpacity>
      </View>
      
      {!sameAsBilling && (
        <>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="First Name *"
              value={shippingInfo.first_name}
              onChangeText={(value) => updateShippingInfo('first_name', value)}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Last Name *"
              value={shippingInfo.last_name}
              onChangeText={(value) => updateShippingInfo('last_name', value)}
            />
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Address Line 1 *"
            value={shippingInfo.address_1}
            onChangeText={(value) => updateShippingInfo('address_1', value)}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Address Line 2 (Optional)"
            value={shippingInfo.address_2}
            onChangeText={(value) => updateShippingInfo('address_2', value)}
          />
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="City *"
              value={shippingInfo.city}
              onChangeText={(value) => updateShippingInfo('city', value)}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="State *"
              value={shippingInfo.state}
              onChangeText={(value) => updateShippingInfo('state', value)}
            />
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Postal Code *"
            value={shippingInfo.postcode}
            onChangeText={(value) => updateShippingInfo('postcode', value)}
          />
        </>
      )}
    </View>
  );

  const renderPaymentMethod = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Method *</Text>
      {!paymentMethod && (
        <View style={styles.paymentPlaceholder}>
          <Ionicons name="warning-outline" size={20} color="#ff6b6b" />
          <Text style={styles.paymentPlaceholderText}>Please select a payment method to continue</Text>
        </View>
      )}
      
      {/* Saved Cards */}
      {savedCards.map((card) => (
        <TouchableOpacity 
          key={card.id}
          style={[
            styles.paymentOption,
            paymentMethod === 'card' && selectedCard?.id === card.id && styles.selectedPaymentOption
          ]}
          onPress={() => {
            setPaymentMethod('card');
            setSelectedCard(card);
          }}
        >
          <Ionicons 
            name={paymentMethod === 'card' && selectedCard?.id === card.id ? 'radio-button-on' : 'radio-button-off'} 
            size={20} 
            color="#007AFF" 
          />
          <View style={styles.paymentInfo}>
            <View style={styles.cardPaymentHeader}>
              <Ionicons 
                name={card.type === 'visa' ? 'card' : card.type === 'mastercard' ? 'card' : 'card'} 
                size={20} 
                color="#007AFF" 
              />
              <Text style={styles.paymentTitle}>•••• •••• •••• {card.lastFour}</Text>
              {card.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultBadgeText}>Default</Text>
                </View>
              )}
            </View>
            <Text style={styles.paymentDescription}>Expires {card.expiryDate} • {card.cardholderName}</Text>
          </View>
        </TouchableOpacity>
      ))}
      

      
      {/* UPI QR Code */}
      <TouchableOpacity 
        style={[
          styles.paymentOption,
          paymentMethod === 'upi_qr' && styles.selectedPaymentOption
        ]}
        onPress={() => {
          setPaymentMethod('upi_qr');
          setSelectedCard(null);
        }}
      >
        <Ionicons 
          name={paymentMethod === 'upi_qr' ? 'radio-button-on' : 'radio-button-off'} 
          size={20} 
          color="#007AFF" 
        />
        <View style={styles.paymentInfo}>
            <View style={styles.cardPaymentHeader}>
              <Ionicons name="qr-code" size={20} color="#007AFF" />
              <Text style={styles.paymentTitle}>UPI QR Code</Text>
              <Text style={[styles.availabilityBadge, styles.availableBadge]}>Recommended</Text>
            </View>
            <Text style={styles.paymentDescription}>Pay using UPI apps like Paytm, Google Pay, PhonePe</Text>
          </View>
      </TouchableOpacity>

      {/* Razorpay */}
      <TouchableOpacity 
        style={[
          styles.paymentOption,
          paymentMethod === 'razorpay' && styles.selectedPaymentOption
        ]}
        onPress={() => {
          setPaymentMethod('razorpay');
          setSelectedCard(null);
        }}
      >
        <Ionicons 
          name={paymentMethod === 'razorpay' ? 'radio-button-on' : 'radio-button-off'} 
          size={20} 
          color="#007AFF" 
        />
        <View style={styles.paymentInfo}>
            <View style={styles.cardPaymentHeader}>
              <Ionicons name="card" size={20} color="#007AFF" />
              <Text style={styles.paymentTitle}>Razorpay</Text>
              <Text style={[styles.availabilityBadge, styles.unavailableBadge]}>Requires Dev Build</Text>
            </View>
            <Text style={styles.paymentDescription}>Credit cards, debit cards, netbanking, wallet, and UPI payments</Text>
          </View>
      </TouchableOpacity>

      {/* PayPal */}
      <TouchableOpacity 
        style={[
          styles.paymentOption,
          paymentMethod === 'paypal' && styles.selectedPaymentOption
        ]}
        onPress={() => {
          setPaymentMethod('paypal');
          setSelectedCard(null);
        }}
      >
        <Ionicons 
          name={paymentMethod === 'paypal' ? 'radio-button-on' : 'radio-button-off'} 
          size={20} 
          color="#007AFF" 
        />
        <View style={styles.paymentInfo}>
          <View style={styles.cardPaymentHeader}>
            <Ionicons name="logo-paypal" size={20} color="#007AFF" />
            <Text style={styles.paymentTitle}>PayPal</Text>
          </View>
          <Text style={styles.paymentDescription}>Pay via PayPal</Text>
        </View>
      </TouchableOpacity>


      

      
      {/* Manage Payment Methods Link */}
      <TouchableOpacity 
        style={styles.managePaymentLink}
        onPress={() => navigation.navigate('PaymentMethods')}
      >
        <Ionicons name="settings-outline" size={16} color="#007AFF" />
        <Text style={styles.managePaymentText}>Manage Payment Methods</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOrderNotes = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Notes (Optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Special instructions for your order..."
        value={orderNotes}
        onChangeText={setOrderNotes}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderOrderSummary()}
        {renderBillingInfo()}
        {renderShippingInfo()}
        {renderPaymentMethod()}
        {renderOrderNotes()}
      </ScrollView>
      
      <View style={styles.bottomContainer}>
        <LinearGradient
          colors={['#007AFF', '#0056CC']}
          style={styles.placeOrderButton}
        >
          <TouchableOpacity 
            style={styles.placeOrderButtonInner}
            onPress={placeOrder}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="card" size={20} color="#fff" />
            )}
            <Text style={styles.placeOrderButtonText}>
              {isLoading ? 'Placing Order...' : `Place Order - ${formatPrice(total)}`}
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
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
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginHorizontal: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  freeShipping: {
    color: '#28a745',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  halfInput: {
    width: '48%',
  },
  textArea: {
    height: 80,
  },
  shippingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 12,
  },
  selectedPaymentOption: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  paymentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  cardPaymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  availabilityBadge: {
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
    fontWeight: '500',
  },
  unavailableBadge: {
    backgroundColor: '#FFE5E5',
    color: '#D32F2F',
  },
  availableBadge: {
    backgroundColor: '#E8F5E8',
    color: '#2E7D32',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  paymentDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  managePaymentLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
  },
  managePaymentText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  paymentPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    marginBottom: 16,
  },
  paymentPlaceholderText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
  bottomContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  placeOrderButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  placeOrderButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  placeOrderButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
});

export default CheckoutScreen;