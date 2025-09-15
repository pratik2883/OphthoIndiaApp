import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import PriceDisplay from '../components/PriceDisplay';

const CartScreen = ({ navigation }) => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  } = useCart();

  const handleRemoveItem = (productId) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(productId) },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearCart },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout.');
      return;
    }
    navigation.navigate('Checkout');
  };

  const increaseQuantity = (productId, currentQuantity) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const decreaseQuantity = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    } else {
      handleRemoveItem(productId);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <TouchableOpacity 
        onPress={() => item?.product?.id && navigation.navigate('ProductDetail', { product: item.product })}
      >
        <Image 
          source={{ uri: item.product?.images?.[0]?.src || 'https://via.placeholder.com/80' }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
      
      <View style={styles.productInfo}>
        <TouchableOpacity 
          onPress={() => item?.product?.id && navigation.navigate('ProductDetail', { product: item.product })}
        >
          <Text style={styles.productName} numberOfLines={2}>
            {item?.product?.name}
          </Text>
        </TouchableOpacity>
        
        <PriceDisplay 
          price={item?.product?.price}
          size="small"
        />
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => item?.product?.id && decreaseQuantity(item?.product?.id, item.quantity)}
          >
            <Ionicons 
              name={item.quantity === 1 ? 'trash-outline' : 'remove'} 
              size={16} 
              color={item.quantity === 1 ? '#dc3545' : '#007AFF'} 
            />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => item?.product?.id && increaseQuantity(item?.product?.id, item.quantity)}
          >
            <Ionicons name="add" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <PriceDisplay 
          price={(parseFloat(item?.product?.price || 0) * item.quantity).toFixed(2)}
          size="small"
        />
        
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => item?.product?.id && handleRemoveItem(item?.product?.id)}
        >
          <Ionicons name="close" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        
        {cartItems.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={handleClearCart}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {cartItems.length > 0 && (
        <Text style={styles.itemCount}>
          {getTotalItems()} item{getTotalItems() !== 1 ? 's' : ''} in cart
        </Text>
      )}
    </View>
  );

  const renderSummary = () => {
    if (cartItems.length === 0) return null;

    const subtotal = getTotalPrice();
    const shipping = 0; // Free shipping for now
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shipping + tax;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Order Summary</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal:</Text>
          <PriceDisplay 
            price={subtotal.toFixed(2)}
            size="small"
          />
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping:</Text>
          <Text style={[styles.summaryValue, styles.freeShipping]}>Free</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax (10%):</Text>
          <PriceDisplay 
            price={tax.toFixed(2)}
            size="small"
          />
        </View>
        
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total:</Text>
          <PriceDisplay 
            price={total.toFixed(2)}
            size="medium"
          />
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cart-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptySubtitle}>
        Add some products to get started
      </Text>
      
      <TouchableOpacity 
        style={styles.shopButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.shopButtonText}>Start Shopping</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCheckoutButton = () => {
    if (cartItems.length === 0) return null;

    return (
      <View style={styles.checkoutContainer}>
        <LinearGradient
          colors={['#007AFF', '#0056CC']}
          style={styles.checkoutButton}
        >
          <TouchableOpacity 
            style={styles.checkoutButtonInner}
            onPress={handleCheckout}
          >
            <Ionicons name="card" size={20} color="#fff" />
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </LinearGradient>
        
        <TouchableOpacity 
          style={styles.continueShoppingButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.continueShoppingText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item, index) => item?.product?.id?.toString() || `cart-${index}`}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderSummary}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
          {renderCheckoutButton()}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#dc3545',
  },
  clearButtonText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
  },
  cartItem: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    padding: 2,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    padding: 4,
  },
  summaryContainer: {
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
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  checkoutContainer: {
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
  checkoutButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  checkoutButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  continueShoppingButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  continueShoppingText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  shopButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default CartScreen;