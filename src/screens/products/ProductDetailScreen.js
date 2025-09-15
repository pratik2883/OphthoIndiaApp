import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCart } from '../../context/CartContext';
import WooCommerceAPI from '../../services/woocommerceApi';
import PriceDisplay from '../../components/PriceDisplay';

const { width } = Dimensions.get('window');

const ProductDetailScreen = ({ navigation, route }) => {
  const { product: initialProduct } = route.params;
  const [product, setProduct] = useState(initialProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const { addToCart, isInCart, getItemQuantity } = useCart();

  useEffect(() => {
    loadProductDetails();
    loadRelatedProducts();
  }, []);

  const loadProductDetails = async () => {
    try {
      setIsLoading(true);
      const productDetails = await WooCommerceAPI.getProduct(product?.id);
      setProduct(productDetails);
    } catch (error) {
      console.error('Error loading product details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelatedProducts = async () => {
    try {
      const params = {
        per_page: 4,
        exclude: [product?.id],
      };
      
      if (product?.categories && product.categories.length > 0) {
        params.category = product.categories[0]?.id;
      }
      
      const related = await WooCommerceAPI.getProducts(params);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, quantity);
    Alert.alert(
      'Added to Cart',
      `${quantity} x ${product?.name} added to cart!`,
      [
        { text: 'Continue Shopping', style: 'cancel' },
        { text: 'View Cart', onPress: () => navigation.navigate('MainTabs', { screen: 'Cart' }) },
      ]
    );
  };

  const handleBuyNow = () => {
    // Add product to cart first
    addToCart(product, quantity);
    // Navigate directly to checkout
    navigation.navigate('MainTabs', { screen: 'Cart' });
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderImageGallery = () => {
    const images = product?.images || [];
    
    if (images.length === 0) {
      return (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/400' }}
            style={styles.mainImage}
            resizeMode="cover"
          />
        </View>
      );
    }

    return (
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: images[selectedImageIndex]?.src }}
          style={styles.mainImage}
          resizeMode="cover"
        />
        
        {images.length > 1 && (
          <ScrollView 
            horizontal 
            style={styles.thumbnailContainer}
            showsHorizontalScrollIndicator={false}
          >
            {images.map((image, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setSelectedImageIndex(index)}
                style={[
                  styles.thumbnail,
                  selectedImageIndex === index && styles.selectedThumbnail
                ]}
              >
                <Image 
                  source={{ uri: image.src }}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
    );
  };

  const renderProductInfo = () => (
    <View style={styles.productInfo}>
      <View style={styles.header}>
        <Text style={styles.productName}>{product?.name}</Text>
        
        <View style={styles.priceContainer}>
          <PriceDisplay 
            price={product?.price}
            regularPrice={product?.regular_price}
            size="large"
          />
        </View>
      </View>

      {product.categories && product.categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          {product.categories.map((category, index) => (
            <View key={`category-${index}`} style={styles.categoryTag}>
               <Text style={styles.categoryText}>{category?.name}</Text>
             </View>
          ))}
        </View>
      )}

      <View style={styles.stockContainer}>
        <Ionicons 
          name={product.stock_status === 'instock' ? 'checkmark-circle' : 'close-circle'} 
          size={16} 
          color={product.stock_status === 'instock' ? '#28a745' : '#dc3545'} 
        />
        <Text style={[
          styles.stockText,
          { color: product.stock_status === 'instock' ? '#28a745' : '#dc3545' }
        ]}>
          {product.stock_status === 'instock' ? 'In Stock' : 'Out of Stock'}
        </Text>
      </View>

      {product.short_description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>
            {product.short_description.replace(/<[^>]*>/g, '')}
          </Text>
        </View>
      )}

      {product.description && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Details</Text>
          <Text style={styles.description}>
            {product.description.replace(/<[^>]*>/g, '')}
          </Text>
        </View>
      )}
    </View>
  );

  const renderQuantitySelector = () => (
    <View style={styles.quantityContainer}>
      <Text style={styles.quantityLabel}>Quantity:</Text>
      <View style={styles.quantitySelector}>
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={decreaseQuantity}
          disabled={quantity <= 1}
        >
          <Ionicons name="remove" size={20} color={quantity <= 1 ? '#ccc' : '#007AFF'} />
        </TouchableOpacity>
        
        <Text style={styles.quantityText}>{quantity}</Text>
        
        <TouchableOpacity 
          style={styles.quantityButton}
          onPress={increaseQuantity}
        >
          <Ionicons name="add" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRelatedProducts = () => {
    if (relatedProducts.length === 0) return null;

    return (
      <View style={styles.relatedContainer}>
        <Text style={styles.relatedTitle}>Related Products</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {relatedProducts.map((item, index) => (
            <TouchableOpacity
              key={`related-${index}`}
              style={styles.relatedProduct}
              onPress={() => {
                if (item?.id) {
                  navigation.push('ProductDetail', { product: item });
                }
              }}
            >
              <Image 
                source={{ uri: item.images?.[0]?.src || 'https://via.placeholder.com/150' }}
                style={styles.relatedImage}
                resizeMode="cover"
              />
              <Text style={styles.relatedName} numberOfLines={2}>{item?.name}</Text>
              <PriceDisplay 
                price={item?.price}
                size="small"
                showDecimals={false}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderAddToCartButton = () => {
    const inCart = isInCart(product?.id);
    const cartQuantity = getItemQuantity(product?.id);
    
    return (
      <View style={styles.bottomContainer}>
        {renderQuantitySelector()}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.addToCartButtonStyle]}
            onPress={handleAddToCart}
            disabled={product.stock_status !== 'instock'}
          >
            <Ionicons name="cart" size={18} color="#007AFF" />
            <Text style={styles.addToCartButtonText}>
              {inCart ? `Add More (${cartQuantity})` : 'Add to Cart'}
            </Text>
          </TouchableOpacity>
          
          <LinearGradient
            colors={['#28a745', '#1e7e34']}
            style={[styles.actionButton, styles.buyNowButton]}
          >
            <TouchableOpacity 
              style={styles.buyNowButtonInner}
              onPress={handleBuyNow}
              disabled={product.stock_status !== 'instock'}
            >
              <Ionicons name="flash" size={18} color="#fff" />
              <Text style={styles.buyNowText}>Buy Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading product details...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {renderImageGallery()}
        {renderProductInfo()}
        {renderRelatedProducts()}
      </ScrollView>
      
      {renderAddToCartButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    backgroundColor: '#f8f9fa',
  },
  mainImage: {
    width: width,
    height: width,
  },
  thumbnailContainer: {
    padding: 10,
  },
  thumbnail: {
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedThumbnail: {
    borderColor: '#007AFF',
  },
  thumbnailImage: {
    width: 60,
    height: 60,
  },
  productInfo: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  regularPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  stockText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  relatedContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  relatedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  relatedProduct: {
    width: 120,
    marginRight: 16,
  },
  relatedImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  relatedName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  relatedPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
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
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  addToCartButtonStyle: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  addToCartButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginLeft: 6,
  },
  buyNowButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buyNowButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  buyNowText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 6,
  },
});

export default ProductDetailScreen;