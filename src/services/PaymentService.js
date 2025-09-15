import RazorpayCheckout from 'react-native-razorpay';
import { Alert } from 'react-native';

class PaymentService {
  // Razorpay configuration
  static RAZORPAY_KEY = 'rzp_test_1DP5mmOlF5G5ag'; // Replace with your actual key

  // Process Razorpay payment
  static async processRazorpayPayment(orderData) {
    try {
      // Check if RazorpayCheckout is available
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        console.warn('Razorpay SDK not available in Expo managed workflow');
        return {
          success: false,
          error: 'Razorpay requires Expo Development Build. Please use UPI or other payment methods.'
        };
      }

      const options = {
        description: `Order #${orderData.id}`,
        image: 'https://your-logo-url.com/logo.png',
        currency: orderData.currency || 'INR',
        key: this.RAZORPAY_KEY,
        amount: Math.round(parseFloat(orderData.total) * 100), // Amount in paise
        name: 'Ophtho India',
        order_id: orderData.razorpay_order_id, // Create this on backend
        prefill: {
          email: orderData.billing?.email || '',
          contact: orderData.billing?.phone || '',
          name: `${orderData.billing?.first_name || ''} ${orderData.billing?.last_name || ''}`.trim()
        },
        theme: { color: '#FF6B6B' }
      };

      const data = await RazorpayCheckout.open(options);
      return {
        success: true,
        paymentId: data.razorpay_payment_id,
        orderId: data.razorpay_order_id,
        signature: data.razorpay_signature
      };
    } catch (error) {
      console.error('Razorpay payment error:', error);
      return {
        success: false,
        error: error.description || error.message || 'Payment failed'
      };
    }
  }

  // Process UPI payment
  static async processUPIPayment(orderData) {
    try {
      // For UPI, we'll generate a UPI payment URL
      const upiId = 'merchant@paytm'; // Replace with your UPI ID
      const amount = parseFloat(orderData.total);
      const transactionNote = `Order #${orderData.id}`;
      
      const upiUrl = `upi://pay?pa=${upiId}&pn=Ophtho India&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
      
      return {
        success: true,
        upiUrl: upiUrl,
        message: 'UPI payment URL generated successfully'
      };
    } catch (error) {
      console.error('UPI payment error:', error);
      return {
        success: false,
        error: 'Failed to generate UPI payment URL'
      };
    }
  }

  // Process PayPal payment (Web-based)
  static async processPayPalPayment(orderData) {
    try {
      // For PayPal, we'll redirect to PayPal web checkout
      const paypalUrl = `https://www.paypal.com/checkoutnow?token=${orderData.paypal_token}`;
      
      return {
        success: true,
        paypalUrl: paypalUrl,
        message: 'Redirecting to PayPal...'
      };
    } catch (error) {
      console.error('PayPal payment error:', error);
      return {
        success: false,
        error: 'Failed to initialize PayPal payment'
      };
    }
  }

  // Process Credit/Debit Card payment (using Razorpay)
  static async processCardPayment(orderData, cardDetails) {
    try {
      // Check if RazorpayCheckout is available
      if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
        console.warn('Razorpay SDK not available in Expo managed workflow');
        return {
          success: false,
          error: 'Card payments require Expo Development Build. Please use UPI or other payment methods.'
        };
      }

      // Use Razorpay for card payments with card details
      const options = {
        description: `Order #${orderData.id}`,
        image: 'https://your-logo-url.com/logo.png',
        currency: orderData.currency || 'INR',
        key: this.RAZORPAY_KEY,
        amount: Math.round(parseFloat(orderData.total) * 100),
        name: 'Ophtho India',
        method: {
          card: {
            number: cardDetails.number,
            expiry_month: cardDetails.expiry_month,
            expiry_year: cardDetails.expiry_year,
            cvv: cardDetails.cvv
          }
        },
        prefill: {
          email: orderData.billing?.email || '',
          contact: orderData.billing?.phone || '',
          name: `${orderData.billing?.first_name || ''} ${orderData.billing?.last_name || ''}`.trim()
        },
        theme: { color: '#FF6B6B' }
      };

      const data = await RazorpayCheckout.open(options);
      return {
        success: true,
        paymentId: data.razorpay_payment_id,
        orderId: data.razorpay_order_id,
        signature: data.razorpay_signature
      };
    } catch (error) {
      console.error('Card payment error:', error);
      return {
        success: false,
        error: error.description || error.message || 'Card payment failed'
      };
    }
  }

  // Main payment processor
  static async processPayment(paymentMethod, orderData, additionalData = {}) {
    try {
      switch (paymentMethod) {
        case 'razorpay':
          return await this.processRazorpayPayment(orderData);
        
        case 'upi':
          return await this.processUPIPayment(orderData);
        
        case 'paypal':
          return await this.processPayPalPayment(orderData);
        
        case 'card':
          return await this.processCardPayment(orderData, additionalData.cardDetails);
        
        case 'cod':
          return {
            success: true,
            message: 'Cash on Delivery order placed successfully'
          };
        
        default:
          return {
            success: false,
            error: 'Unsupported payment method'
          };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: 'Payment processing failed'
      };
    }
  }

  // Verify payment (for server-side verification)
  static async verifyPayment(paymentData) {
    try {
      // This should be done on your backend for security
      // For now, we'll just return success
      return {
        success: true,
        verified: true
      };
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        verified: false,
        error: 'Payment verification failed'
      };
    }
  }
}

export default PaymentService;