import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import WooCommerceAPI from '../services/woocommerceApi';

const CategoriesScreen = ({ navigation }) => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await WooCommerceAPI.getCategories({
        per_page: 50,
        hide_empty: true,
        orderby: 'name',
        order: 'asc',
      });
      setCategories(response);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  };

  const handleCategoryPress = (category) => {
    navigation.navigate('ProductList', {
      categoryId: category?.id,
      categoryName: category?.name,
    });
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity 
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item)}
    >
      <View style={styles.categoryImageContainer}>
        {item.image ? (
          <Image 
            source={{ uri: item.image.src }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="grid-outline" size={40} color="#ccc" />
          </View>
        )}
        
        <View style={styles.categoryOverlay}>
          <Text style={styles.categoryName}>{item?.name}</Text>
          <Text style={styles.categoryCount}>{item.count} products</Text>
        </View>
      </View>
      
      {item.description && (
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryDescription} numberOfLines={2}>
            {item.description.replace(/<[^>]*>/g, '')}
          </Text>
        </View>
      )}
      
      <View style={styles.categoryFooter}>
        <Text style={styles.viewProductsText}>View Products</Text>
        <Ionicons name="chevron-forward" size={16} color="#007AFF" />
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Categories</Text>
      <Text style={styles.headerSubtitle}>
        Browse products by category
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="grid-outline" size={64} color="#ccc" />
      <Text style={styles.emptyTitle}>No Categories Found</Text>
      <Text style={styles.emptySubtitle}>
        No product categories are available at the moment.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderCategory}
        keyExtractor={(item, index) => `category-${index}`}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl 
            key="categories-refresh-control"
            refreshing={refreshing} 
            onRefresh={onRefresh} 
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={categories.length === 0 ? styles.emptyList : styles.listContent}
      />
    </View>
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
  categoryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  categoryImageContainer: {
    position: 'relative',
    height: 150,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 16,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  categoryCount: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  categoryInfo: {
    padding: 16,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  categoryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  viewProductsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default CategoriesScreen;