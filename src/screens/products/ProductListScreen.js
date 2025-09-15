import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import WooCommerceAPI from '../../services/woocommerceApi';
import Header from '../../components/common/Header';
import Button from '../../components/common/Button';
import { InlineLoading } from '../../components/common/Loading';
import { useTheme } from '../../context/ThemeContext';
import { getTheme } from '../../theme';
import PriceDisplay from '../../components/PriceDisplay';

const ProductListScreen = ({ navigation, route }) => {
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = createStyles(theme);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const { categoryId, categoryName } = route.params || {};
  const { addToCart, isInCart } = useCart();

  const loadProducts = async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setPage(1);
      } else {
        setLoadingMore(true);
      }

      const currentPage = reset ? 1 : page;
      const params = {
        page: currentPage,
        per_page: 10,
        orderby: sortBy,
        order: sortOrder,
      };

      if (categoryId) {
        params.category = categoryId;
      }

      const response = await WooCommerceAPI.getProducts(params);
      
      if (reset) {
        setProducts(response);
      } else {
        // Filter out any duplicate products based on ID before adding
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newProducts = response.filter(p => !existingIds.has(p.id));
          return [...prev, ...newProducts];
        });
      }
      
      setHasMore(response.length === 10);
      if (!reset) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadProducts(true);
  }, [categoryId, sortBy, sortOrder]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts(true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadProducts(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    Alert.alert('Success', `${product?.name} added to cart!`);
  };

  const toggleSort = () => {
    const sortOptions = [
      { label: 'Newest First', value: 'date', order: 'desc' },
      { label: 'Oldest First', value: 'date', order: 'asc' },
      { label: 'Price: Low to High', value: 'price', order: 'asc' },
      { label: 'Price: High to Low', value: 'price', order: 'desc' },
      { label: 'Name: A to Z', value: 'title', order: 'asc' },
      { label: 'Name: Z to A', value: 'title', order: 'desc' },
    ];

    Alert.alert(
      'Sort Products',
      'Choose sorting option',
      sortOptions.map(option => ({
        text: option.label,
        onPress: () => {
          setSortBy(option.value);
          setSortOrder(option.order);
        },
      }))
    );
  };

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => item?.id && navigation.navigate('ProductDetail', { product: item })}
    >
      <Image 
        source={{ uri: item.images?.[0]?.src || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item?.name}</Text>
        
        {item.short_description ? (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.short_description.replace(/<[^>]*>/g, '')}
          </Text>
        ) : null}
        
        <View style={styles.productFooter}>
          <View style={styles.priceContainer}>
            <PriceDisplay 
              price={item?.price}
              regularPrice={item?.regular_price}
              size="medium"
            />
          </View>
          
          <Button
            title=""
            variant="primary"
            size="sm"
            onPress={() => item?.id && handleAddToCart(item)}
            style={[
              styles.addToCartButton,
              isInCart(item?.id) && styles.addToCartButtonAdded
            ]}
            icon={isInCart(item?.id) ? 'checkmark' : 'add'}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>
          {categoryName || 'All Products'}
        </Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.sortButton}
            onPress={toggleSort}
          >
            <Ionicons name="funnel-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation.navigate('Search')}
          >
            <Ionicons name="search-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.productCount}>
        {products.length} product{products.length !== 1 ? 's' : ''} found
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more products...</Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Products Found</Text>
      <Text style={styles.emptySubtitle}>
        {categoryName 
          ? `No products available in ${categoryName} category.`
          : 'No products available at the moment.'
        }
      </Text>
    </View>
  );

  if (isLoading && products.length === 0) {
    return (
      <View style={styles.container}>
        <Header
          title={categoryName || 'Products'}
          showBack={true}
          showCart={true}
          onBackPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
          onCartPress={() => navigation.jumpTo('Cart')}
        />
        <View style={styles.loadingContainer}>
          <InlineLoading text="Loading products..." size="large" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header
        title={categoryName || 'Products'}
        showBack={true}
        showCart={true}
        onBackPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('Home');
          }
        }}
        onCartPress={() => navigation.jumpTo('Cart')}
      />
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item, index) => `product_${item?.id || 'fallback'}_${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl 
            key="product-list-refresh-control"
            refreshing={refreshing} 
            onRefresh={onRefresh} 
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={products.length === 0 ? styles.emptyList : null}
      />
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.sm,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography?.fontWeight?.bold || '700',
    color: theme.colors.textPrimary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    padding: theme.spacing.xs,
    marginRight: theme.spacing.sm,
  },
  searchButton: {
    padding: theme.spacing.xs,
  },
  productCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
    productCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.md,
      width: '48%',
      ...theme.shadows.md,
    },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  productInfo: {
    padding: theme.spacing.sm,
  },
  productName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography?.fontWeight?.semibold || '600',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  productDescription: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography?.fontWeight?.bold || '700',
    color: theme.colors.primary,
  },
  regularPrice: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
    marginLeft: theme.spacing.xs,
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  addToCartButtonAdded: {
    backgroundColor: theme.colors.success,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography?.fontWeight?.bold || '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ProductListScreen;