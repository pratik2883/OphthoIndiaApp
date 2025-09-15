import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';
import WooCommerceAPI from '../services/woocommerceApi';
import PriceDisplay from '../components/PriceDisplay';

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: 12,
  },
  filterChip: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeFilterChip: {
    backgroundColor: theme.colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeFilterText: {
    color: theme.colors.textOnPrimary,
  },
  categoryFilters: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  categoryChip: {
    backgroundColor: theme.colors.surfaceVariant,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  activeCategoryChip: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: theme.colors.textOnPrimary,
  },
  // Removed recent searches styles as they're no longer needed
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  resultsContainer: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
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
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  regularPrice: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
    marginLeft: 4,
  },
  addToCartButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  addToCartButtonAdded: {
    backgroundColor: theme.colors.success,
  },
});

const SearchScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // Removed recentSearches state as it's no longer needed
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('date');
  
  const { addToCart, isInCart } = useCart();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = createStyles(theme);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      const delayedSearch = setTimeout(() => {
        performSearch();
      }, 500);
      
      return () => clearTimeout(delayedSearch);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, selectedCategory, sortBy]);

  const loadCategories = async () => {
    try {
      const response = await WooCommerceAPI.getCategories({
        per_page: 20,
        hide_empty: true,
      });
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // Removed loadRecentSearches function as it's no longer needed

  const performSearch = async () => {
    if (searchQuery.length < 3) return;
    
    try {
      setIsLoading(true);
      
      const params = {
        search: searchQuery,
        per_page: 20,
      };
      
      if (selectedCategory) {
        params.category = selectedCategory?.id;
      }
      
      switch (sortBy) {
        case 'price_low':
          params.orderby = 'price';
          params.order = 'asc';
          break;
        case 'price_high':
          params.orderby = 'price';
          params.order = 'desc';
          break;
        case 'name':
          params.orderby = 'title';
          params.order = 'asc';
          break;
        case 'date':
          params.orderby = 'date';
          params.order = 'desc';
          break;
        default:
          // Use 'date' as default instead of 'relevance' which is not supported
          params.orderby = 'date';
          params.order = 'desc';
      }
      
      const results = await WooCommerceAPI.getProducts(params);
      setSearchResults(results);
      
      // Recent searches functionality removed
    } catch (error) {
      console.error('Error searching products:', error);
      Alert.alert('Error', 'Failed to search products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    Alert.alert('Success', `${product?.name} added to cart!`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCategory(null);
  };

  const selectCategory = (category) => {
    if (selectedCategory?.id === category?.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoFocus
          returnKeyType="search"
          onSubmitEditing={performSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Sort:</Text>
          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'date' && styles.activeFilterChip]}
            onPress={() => setSortBy('date')}
          >
            <Text style={[styles.filterText, sortBy === 'date' && styles.activeFilterText]}>
              Newest
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'price_low' && styles.activeFilterChip]}
            onPress={() => setSortBy('price_low')}
          >
            <Text style={[styles.filterText, sortBy === 'price_low' && styles.activeFilterText]}>
              Price: Low to High
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterChip, sortBy === 'price_high' && styles.activeFilterChip]}
            onPress={() => setSortBy('price_high')}
          >
            <Text style={[styles.filterText, sortBy === 'price_high' && styles.activeFilterText]}>
              Price: High to Low
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {categories.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilters}>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={category?.id || `filter-category-${index}`}
              style={[
                styles.categoryChip,
                selectedCategory?.id === category?.id && styles.activeCategoryChip
              ]}
              onPress={() => selectCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory?.id === category?.id && styles.activeCategoryText
              ]}>
                {category?.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );

  // Removed renderRecentSearches function as it's no longer needed

  const renderProduct = ({ item }) => (
    <TouchableOpacity 
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { product: item })}
    >
      <Image 
        source={{ uri: item.images?.[0]?.src || 'https://via.placeholder.com/150' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item?.name}</Text>
        
        {item.short_description && (
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.short_description.replace(/<[^>]*>/g, '')}
          </Text>
        )}
        
        <View style={styles.productFooter}>
          <PriceDisplay 
            price={item?.price}
            regularPrice={item?.regular_price}
            size="medium"
            showDecimals={false}
          />
          
          <TouchableOpacity 
            style={[
              styles.addToCartButton,
              isInCart(item?.id) && styles.addToCartButtonAdded
            ]}
            onPress={() => handleAddToCart(item)}
          >
            <Ionicons 
              name={isInCart(item?.id) ? 'checkmark' : 'add'} 
              size={16} 
              color="#fff" 
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResults = () => {
    if (searchQuery.length < 3) return null;
    
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }
    
    if (searchResults.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#ccc" />
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>
            Try adjusting your search terms or filters
          </Text>
        </View>
      );
    }
    
    return (
      <FlatList
        data={searchResults}
        renderItem={renderProduct}
        keyExtractor={(item, index) => item?.id?.toString() || `search-${index}`}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.resultsContainer}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderSearchBar()}
      {renderFilters()}
      {renderSearchResults()}
    </View>
  );
};



export default SearchScreen;