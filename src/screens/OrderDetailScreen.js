import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WooCommerceAPI from '../services/woocommerceApi';

const OrderDetailScreen = ({ route, navigation }) => {
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: `Order #${order?.number || 'N/A'}`,
    });
  }, [navigation, order?.number]);

  const refreshOrder = async () => {
    try {
      setIsLoading(true);
      const updatedOrder = await WooCommerceAPI.getOrder(order?.id);
      setOrder(updatedOrder);
    } catch (error) {
      console.error('Error refreshing order:', error);
      Alert.alert('Error', 'Failed to refresh order details.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffc107';
      case 'processing':
        return '#007AFF';
      case 'on-hold':
        return '#6c757d';
      case 'completed':
        return '#28a745';
      case 'cancelled':
        return '#dc3545';
      case 'refunded':
        return '#6f42c1';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'processing':
        return 'sync-outline';
      case 'on-hold':
        return 'pause-outline';
      case 'completed':
        return 'checkmark-circle-outline';
      case 'cancelled':
        return 'close-circle-outline';
      case 'refunded':
        return 'return-up-back-outline';
      case 'failed':
        return 'alert-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleTrackOrder = () => {
    if (order?.tracking_number) {
      // Open tracking URL if available
      const trackingUrl = `https://track.example.com/${order.tracking_number}`;
      Linking.openURL(trackingUrl).catch(() => {
        Alert.alert('Error', 'Unable to open tracking link.');
      });
    } else {
      Alert.alert('Tracking', 'Tracking information is not available yet.');
    }
  };

  const handleReorder = () => {
    Alert.alert(
      'Reorder Items',
      'Add all items from this order to your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add to Cart',
          onPress: () => {
            // Navigate to cart or add items logic
            navigation.navigate('MainTabs', { screen: 'Cart' });
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact us?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => Linking.openURL('mailto:support@ophtho-india.com'),
        },
        {
          text: 'Phone',
          onPress: () => Linking.openURL('tel:+911234567890'),
        },
      ]
    );
  };

  const renderOrderStatus = () => (
    <View style={styles.statusCard}>
      <View style={styles.statusHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order?.status) }]}>
          <Ionicons 
            name={getStatusIcon(order?.status)} 
            size={16} 
            color="#fff" 
            style={styles.statusIcon}
          />
          <Text style={styles.statusText}>
            {order?.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('-', ' ') : 'Unknown'}
          </Text>
        </View>
        
        <TouchableOpacity onPress={refreshOrder} disabled={isLoading}>
          <Ionicons 
            name="refresh" 
            size={20} 
            color="#007AFF" 
            style={isLoading && { opacity: 0.5 }}
          />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.orderDate}>Placed on {formatDate(order?.date_created)}</Text>
      
      {order?.date_modified !== order?.date_created && (
        <Text style={styles.lastUpdated}>
          Last updated: {formatDate(order?.date_modified)}
        </Text>
      )}
    </View>
  );

  const renderOrderItems = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Items</Text>
      
      {order?.line_items?.map((item, index) => (
        <View key={index} style={styles.itemRow}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item?.name}
            </Text>
            
            {item?.meta_data && item.meta_data.length > 0 && (
              <View style={styles.itemMeta}>
                {item.meta_data.map((meta, metaIndex) => (
                  <Text key={metaIndex} style={styles.metaText}>
                    {meta?.display_key}: {meta?.display_value}
                  </Text>
                ))}
              </View>
            )}
          </View>
          
          <View style={styles.itemPricing}>
            <Text style={styles.itemQuantity}>Qty: {item?.quantity}</Text>
            <Text style={styles.itemPrice}>₹{item?.total}</Text>
          </View>
        </View>
      )) || []}
    </View>
  );

  const renderOrderSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Order Summary</Text>
      
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>₹{(order?.total || 0) - (order?.total_tax || 0) - (order?.shipping_total || 0)}</Text>
      </View>
      
      {parseFloat(order?.shipping_total || 0) > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>₹{order?.shipping_total}</Text>
        </View>
      )}
      
      {parseFloat(order?.total_tax || 0) > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>₹{order?.total_tax}</Text>
        </View>
      )}
      
      {parseFloat(order?.discount_total || 0) > 0 && (
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <Text style={[styles.summaryValue, { color: '#28a745' }]}>-₹{order?.discount_total}</Text>
        </View>
      )}
      
      <View style={[styles.summaryRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>₹{order?.total}</Text>
      </View>
    </View>
  );

  const renderShippingInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Shipping Information</Text>
      
      <View style={styles.addressContainer}>
        <Text style={styles.addressName}>
          {order?.shipping?.first_name} {order?.shipping?.last_name}
        </Text>
        
        <Text style={styles.addressLine}>{order?.shipping?.address_1}</Text>
        
        {order?.shipping?.address_2 && (
          <Text style={styles.addressLine}>{order?.shipping?.address_2}</Text>
        )}
        
        <Text style={styles.addressLine}>
          {order?.shipping?.city}, {order?.shipping?.state} {order?.shipping?.postcode}
        </Text>
        
        <Text style={styles.addressLine}>{order?.shipping?.country}</Text>
      </View>
      
      {order?.shipping_lines && order.shipping_lines.length > 0 && (
        <View style={styles.shippingMethod}>
          <Text style={styles.shippingMethodLabel}>Shipping Method:</Text>
          <Text style={styles.shippingMethodValue}>
            {order?.shipping_lines?.[0]?.method_title}
          </Text>
        </View>
      )}
    </View>
  );

  const renderPaymentInfo = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Payment Information</Text>
      
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Payment Method:</Text>
        <Text style={styles.paymentValue}>{order?.payment_method_title}</Text>
      </View>
      
      <View style={styles.paymentRow}>
        <Text style={styles.paymentLabel}>Transaction ID:</Text>
        <Text style={styles.paymentValue}>
          {order?.transaction_id || 'Not available'}
        </Text>
      </View>
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsSection}>
      <TouchableOpacity style={styles.actionButton} onPress={handleTrackOrder}>
        <Ionicons name="location-outline" size={20} color="#007AFF" />
        <Text style={styles.actionButtonText}>Track Order</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={handleReorder}>
        <Ionicons name="repeat-outline" size={20} color="#007AFF" />
        <Text style={styles.actionButtonText}>Reorder</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.actionButton} onPress={handleContactSupport}>
        <Ionicons name="help-circle-outline" size={20} color="#007AFF" />
        <Text style={styles.actionButtonText}>Support</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderOrderStatus()}
      {renderOrderItems()}
      {renderOrderSummary()}
      {renderShippingInfo()}
      {renderPaymentInfo()}
      {renderActions()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  statusCard: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  orderDate: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
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
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemInfo: {
    flex: 1,
    marginRight: 16,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemMeta: {
    marginTop: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  itemPricing: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  addressContainer: {
    marginBottom: 12,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  addressLine: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  shippingMethod: {
    flexDirection: 'row',
    marginTop: 8,
  },
  shippingMethodLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  shippingMethodValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  actionsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    alignItems: 'center',
    padding: 12,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default OrderDetailScreen;