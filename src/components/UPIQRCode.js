import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Path } from 'react-native-svg';

const UPIQRCode = ({ upiId, amount, transactionNote, onPaymentComplete }) => {
  const upiUrl = `upi://pay?pa=${upiId}&pn=Ophtho India&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

  const handleUPIPayment = async () => {
    try {
      const canOpen = await Linking.canOpenURL(upiUrl);
      if (canOpen) {
        await Linking.openURL(upiUrl);
        
        // Show confirmation dialog after opening UPI app
        setTimeout(() => {
          Alert.alert(
            'UPI Payment',
            'Please complete the payment in your UPI app and then confirm.',
            [
              { 
                text: 'Payment Failed', 
                style: 'cancel',
                onPress: () => onPaymentComplete(false) 
              },
              { 
                text: 'Payment Completed', 
                onPress: () => onPaymentComplete(true) 
              }
            ]
          );
        }, 1000);
      } else {
        Alert.alert(
          'UPI App Not Found',
          'Please install a UPI app like Google Pay, PhonePe, or Paytm to make UPI payments.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('UPI payment error:', error);
      Alert.alert('Error', 'Failed to open UPI app. Please try again.');
    }
  };

  // Simple QR code representation (you can use a proper QR code library)
  const QRCodeSVG = () => (
    <Svg width={200} height={200} viewBox="0 0 200 200">
      {/* QR Code pattern - simplified representation */}
      <Rect x={0} y={0} width={200} height={200} fill="white" stroke="#000" strokeWidth={2} />
      
      {/* Corner squares */}
      <Rect x={10} y={10} width={50} height={50} fill="black" />
      <Rect x={20} y={20} width={30} height={30} fill="white" />
      <Rect x={25} y={25} width={20} height={20} fill="black" />
      
      <Rect x={140} y={10} width={50} height={50} fill="black" />
      <Rect x={150} y={20} width={30} height={30} fill="white" />
      <Rect x={155} y={25} width={20} height={20} fill="black" />
      
      <Rect x={10} y={140} width={50} height={50} fill="black" />
      <Rect x={20} y={150} width={30} height={30} fill="white" />
      <Rect x={25} y={155} width={20} height={20} fill="black" />
      
      {/* Data pattern - simplified */}
      {Array.from({ length: 15 }, (_, i) => (
        Array.from({ length: 15 }, (_, j) => {
          const shouldFill = (i + j) % 3 === 0 && i > 5 && j > 5 && i < 18 && j < 18;
          return shouldFill ? (
            <Rect 
              key={`${i}-${j}`} 
              x={10 + i * 10} 
              y={10 + j * 10} 
              width={8} 
              height={8} 
              fill="black" 
            />
          ) : null;
        })
      )).flat()}
    </Svg>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>UPI QR Code Payment</Text>
      
      <View style={styles.qrContainer}>
        <QRCodeSVG />
      </View>
      
      <View style={styles.paymentDetails}>
        <Text style={styles.detailText}>Amount: ₹{amount}</Text>
        <Text style={styles.detailText}>UPI ID: {upiId}</Text>
        <Text style={styles.detailText}>Note: {transactionNote}</Text>
      </View>
      
      <TouchableOpacity style={styles.payButton} onPress={handleUPIPayment}>
        <Ionicons name="card-outline" size={24} color="white" />
        <Text style={styles.payButtonText}>Pay with UPI App</Text>
      </TouchableOpacity>
      
      <Text style={styles.instructionText}>
        Scan this QR code with any UPI app or tap the button above to pay
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 20,
  },
  paymentDetails: {
    alignItems: 'center',
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  instructionText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default UPIQRCode;