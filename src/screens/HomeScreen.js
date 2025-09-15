import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  RefreshControl,
  Dimensions,
  BackHandler,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';
import WooCommerceAPI from '../services/woocommerceApi';
import PriceDisplay from '../components/PriceDisplay';
import { APP_CONFIG } from '../config/api';
import Header from '../components/common/Header';
import Button from '../components/common/Button';
import { InlineLoading } from '../components/common/Loading';


const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topSellingProducts, setTopSellingProducts] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const { user } = useAuth();
  const { totalItems } = useCart();
  const { isDarkMode } = useTheme();
  const theme = getTheme(isDarkMode);
  const styles = getStyles(theme);
  
  const sliderScrollRef = useRef(null);
  
  // Partner logos animation
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadHomeData();
  }, []);

  // Partner logos animation effect
  useEffect(() => {
    const partnerLogos = [
      { id: 1, name: 'Pricon', image: require('../../assets/images/partner-logo/imgi_56_Pricon-logo.webp') },
      { id: 2, name: 'Partner 2', image: require('../../assets/images/partner-logo/imgi_57_logo-2.png') },
      { id: 3, name: 'Zeiss', image: require('../../assets/images/partner-logo/imgi_58_zeiss-logo_new.png') },
      { id: 4, name: 'Volk', image: require('../../assets/images/partner-logo/imgi_59_volk-logo-banner.png') },
      { id: 5, name: 'Geuder', image: require('../../assets/images/partner-logo/imgi_60_RZ-Geuder-Logo-RGB_1331x340px-300dpi.png') },
      { id: 6, name: 'Partner 6', image: require('../../assets/images/partner-logo/imgi_62_logo-2x.png') },
      { id: 7, name: 'Aktive', image: require('../../assets/images/partner-logo/imgi_63_logo-aktive-home.png') },
      { id: 8, name: 'Partner 8', image: require('../../assets/images/partner-logo/imgi_64_img_header_logo.png') },
    ];
    
    const cardWidth = 120 + 16; // card width + margin
    const totalWidth = partnerLogos.length * cardWidth;

    const startAnimation = () => {
      scrollX.setValue(0);
      Animated.timing(scrollX, {
        toValue: -totalWidth,
        duration: 15000, // 15 seconds for one complete cycle
        useNativeDriver: true,
      }).start(() => {
        startAnimation(); // Restart animation
      });
    };

    startAnimation();
  }, [scrollX]);



  // Handle back button press to show exit confirmation only when at root
  useEffect(() => {
    const backAction = () => {
      // Only show exit popup if we can't go back in the navigation stack
      if (!navigation.canGoBack()) {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit the app?',
          [
            {
              text: 'Cancel',
              onPress: () => null,
              style: 'cancel',
            },
            {
              text: 'Exit',
              onPress: () => BackHandler.exitApp(),
            },
          ],
          { cancelable: false }
        );
        return true;
      }
      // Allow default back behavior if we can go back
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [navigation]);

  const loadHomeData = async () => {
    try {
      setIsLoading(true);
      
      // Load top selling products and categories in parallel
      const [productsResponse, categoriesResponse] = await Promise.all([
        WooCommerceAPI.getProducts({ orderby: 'popularity', per_page: 6 }),
        WooCommerceAPI.getCategories({ per_page: 8, hide_empty: true })
      ]);
      
      setTopSellingProducts(productsResponse);
      setCategories(categoriesResponse);
      
      // Load related products for the first top selling product
      if (productsResponse.length > 0) {
        const firstProduct = productsResponse[0];
        const relatedParams = {
          per_page: 8,
          exclude: [firstProduct?.id],
        };
        
        if (firstProduct?.categories && firstProduct.categories.length > 0) {
        relatedParams.category = firstProduct?.categories[0]?.id;
      }
        
        const relatedResponse = await WooCommerceAPI.getProducts(relatedParams);
        setRelatedProducts(relatedResponse);
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHomeData();
    setRefreshing(false);
  };

  const renderHeader = () => (
    <Header
        showLogo={true}
        showCart={true}
        showSearch={true}
        showWishlist={true}
        showCurrency={true}
        onCartPress={() => navigation.jumpTo('Cart')}
        onSearchPress={() => navigation.navigate('Search')}
        onWishlistPress={() => Alert.alert(
          'Coming Soon',
          'Wishlist feature is coming soon!',
          [{ text: 'OK' }]
        )}
        backgroundColor={theme.colors.primary}
      />
  );

  const renderPromotionalCard = () => (
    <View style={styles.promoContainer}>
      <LinearGradient
        colors={['#007AFF', '#0056CC']}
        style={styles.promoCard}
      >
        <View style={styles.promoContent}>
          <View style={styles.promoHeader}>
            <Ionicons name="medical" size={32} color="#FFFFFF" style={styles.promoIcon} />
            <Text style={styles.promoTitle}>Healthcare Excellence</Text>
          </View>
          <Text style={styles.promoSubtitle}>
            Premium medical equipment for healthcare professionals
          </Text>
          <View style={styles.promoFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              <Text style={styles.featureText}>Quality Assured</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
              <Text style={styles.featureText}>Expert Support</Text>
            </View>
          </View>
          <TouchableOpacity 
            style={styles.promoButton}
            onPress={() => navigation.jumpTo('Products')}
          >
            <Text style={styles.promoButtonText}>Shop Now</Text>
            <Ionicons name="arrow-forward" size={16} color="#007AFF" style={styles.buttonIcon} />
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Categories</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item?.id?.toString() || `category-${index}`}
        contentContainerStyle={{ paddingHorizontal: theme.spacing.md }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.categoryCard}
            onPress={() => navigation.navigate('ProductList', { categoryId: item?.id, categoryName: item?.name })}
          >
            <View style={styles.categoryIcon}>
              <Ionicons name="medical-outline" size={24} color="#007AFF" />
            </View>
            <Text style={styles.categoryName} numberOfLines={2}>{item?.name}</Text>
            <Text style={styles.categoryCount}>{item.count} items</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderFeaturedProducts = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Selling Products</Text>
        <TouchableOpacity onPress={() => navigation.jumpTo('Products')}>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={topSellingProducts}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item?.id?.toString() || `featured-${index}`}
        renderItem={({ item }) => (
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
              <PriceDisplay 
                price={item?.price}
                size="medium"
                showDecimals={false}
              />
            </View>
          </TouchableOpacity>
        )}
      />
      
      {relatedProducts.length > 0 && (
        <View style={styles.relatedSection}>
          <Text style={styles.relatedTitle}>Related Products</Text>
          <View style={styles.relatedProductsGrid}>
            {relatedProducts.slice(0, 8).map((item, index) => (
              <TouchableOpacity 
                key={item?.id?.toString() || `related-product-${index}`}
                style={styles.relatedProductCard}
                onPress={() => item?.id && navigation.navigate('ProductDetail', { product: item })}
              >
                <Image 
                  source={{ uri: item.images?.[0]?.src || 'https://via.placeholder.com/150' }}
                  style={styles.relatedProductImage}
                  resizeMode="cover"
                />
                <View style={styles.relatedProductInfo}>
                  <Text style={styles.relatedProductName} numberOfLines={2}>{item?.name}</Text>
                  <PriceDisplay 
                    price={item?.price}
                    size="small"
                    showDecimals={false}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
          {relatedProducts.length > 8 && (
            <TouchableOpacity 
              style={styles.viewMoreButton}
              onPress={() => navigation.navigate('ProductList', { 
                title: 'Related Products',
                products: relatedProducts 
              })}
            >
              <Text style={styles.viewMoreText}>View More</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderQuickActions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Orders')}
        >
          <Ionicons name="receipt-outline" size={32} color="#007AFF" />
          <Text style={styles.quickActionText}>My Orders</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Categories')}
        >
          <Ionicons name="grid-outline" size={32} color="#007AFF" />
          <Text style={styles.quickActionText}>Categories</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.navigate('Search')}
        >
          <Ionicons name="search-outline" size={32} color="#007AFF" />
          <Text style={styles.quickActionText}>Search</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.quickActionCard}
          onPress={() => navigation.jumpTo('Profile')}
        >
          <Ionicons name="person-outline" size={32} color="#007AFF" />
          <Text style={styles.quickActionText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPartners = () => {
    const partnerLogos = [
      { id: 1, name: 'Pricon', image: require('../../assets/images/partner-logo/imgi_56_Pricon-logo.webp') },
      { id: 2, name: 'Partner 2', image: require('../../assets/images/partner-logo/imgi_57_logo-2.png') },
      { id: 3, name: 'Zeiss', image: require('../../assets/images/partner-logo/imgi_58_zeiss-logo_new.png') },
      { id: 4, name: 'Volk', image: require('../../assets/images/partner-logo/imgi_59_volk-logo-banner.png') },
      { id: 5, name: 'Geuder', image: require('../../assets/images/partner-logo/imgi_60_RZ-Geuder-Logo-RGB_1331x340px-300dpi.png') },
      { id: 6, name: 'Partner 6', image: require('../../assets/images/partner-logo/imgi_62_logo-2x.png') },
      { id: 7, name: 'Aktive', image: require('../../assets/images/partner-logo/imgi_63_logo-aktive-home.png') },
      { id: 8, name: 'Partner 8', image: require('../../assets/images/partner-logo/imgi_64_img_header_logo.png') },
    ];

    // Duplicate the array for infinite scroll effect
    const duplicatedLogos = [...partnerLogos, ...partnerLogos, ...partnerLogos];

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Partners</Text>
        
        <View style={styles.partnerScrollContainer}>
          <Animated.View
            style={[
              styles.partnerScrollContent,
              {
                transform: [{ translateX: scrollX }],
              },
            ]}
          >
            {duplicatedLogos.map((item, index) => (
              <View key={`partner-logo-${item?.id || item?.name}-${index}`} style={styles.partnerCard}>
                <Image 
                  source={item.image}
                  style={styles.partnerLogo}
                  resizeMode="contain"
                />
              </View>
            ))}
          </Animated.View>
        </View>
      </View>
    );
  };

  const renderProductSlider = () => {
    const sliderImages = [
      {
        id: 1,
        title: 'Best Quality Products',
        image: require('../../assets/images/home-slider-images/imgi_47_Best-quality.jpg')
      },
      {
        id: 2,
        title: 'MEGATRON S4 HPS',
        image: require('../../assets/images/home-slider-images/imgi_48_MEGATRON-S4-HPS.jpg')
      },
      {
        id: 3,
        title: 'XENOTRON III',
        image: require('../../assets/images/home-slider-images/imgi_49_XENOTRON-III.jpg')
      },
      {
        id: 4,
        title: 'TonoCare Wireless Non-Contact Tonometer',
        image: require('../../assets/images/home-slider-images/imgi_50_TonoCare-Wireless-Non-Contact-Tonometer.jpg')
      },
      {
        id: 5,
        title: 'Vantage Plus',
        image: require('../../assets/images/home-slider-images/imgi_51_Vantage-plus.jpg')
      },
      {
        id: 6,
        title: 'Pulsair Desktop',
        image: require('../../assets/images/home-slider-images/imgi_52_Pulsair-Desktop.jpg')
      }
    ];

    const goToSlide = (index) => {
      if (sliderScrollRef.current) {
        sliderScrollRef.current.scrollTo({
          x: index * width,
          animated: true
        });
        setCurrentSlide(index);
      }
    };

    const goToPrevSlide = () => {
      const prevIndex = currentSlide > 0 ? currentSlide - 1 : sliderImages.length - 1;
      goToSlide(prevIndex);
    };

    const goToNextSlide = () => {
      const nextIndex = currentSlide < sliderImages.length - 1 ? currentSlide + 1 : 0;
      goToSlide(nextIndex);
    };

    const handleScroll = (event) => {
      const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setCurrentSlide(slideIndex);
    };

    return (
      <View style={styles.productSliderSection}>
        <ScrollView 
          ref={sliderScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          contentContainerStyle={styles.productSliderContainer}
          style={styles.productSliderScrollView}
          onMomentumScrollEnd={handleScroll}
          decelerationRate="fast"
        >
          {sliderImages.map((item, index) => (
            <TouchableOpacity key={item?.id || `slider-product-${index}`} style={styles.productSliderCard}>
              <Image 
                source={item.image}
                style={styles.productSliderImage}
                resizeMode="cover"
              />
              <View style={styles.productSliderOverlay}>
                <Text style={styles.productSliderTitle}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Left Arrow */}
        <TouchableOpacity 
          style={[styles.sliderArrow, styles.leftArrow]}
          onPress={goToPrevSlide}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Right Arrow */}
        <TouchableOpacity 
          style={[styles.sliderArrow, styles.rightArrow]}
          onPress={goToNextSlide}
        >
          <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Slide Indicators */}
        <View style={styles.sliderIndicators}>
          {sliderImages.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.sliderIndicator,
                currentSlide === index && styles.activeSliderIndicator
              ]}
              onPress={() => goToSlide(index)}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderStars = (rating = 5) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#FFD700' : '#E0E0E0'}
            style={styles.star}
          />
        ))}
      </View>
    );
  };

  const renderTestimonials = () => {
    const testimonials = [
      {
        id: 1,
        name: 'Dr. Olga Denisiuk',
        location: 'Ukraine',
        text: 'Excellent product range, competitive price, efficient service. It\'s Ophtho India Inc.',
        image: require('../../assets/images/testimonial-images/ukraine-doctor.jpg'),
        rating: 5
      },
      {
        id: 2,
        name: 'Dr. Yogesh Khandve',
        location: 'Thane, India',
        text: 'Ophtho India Inc. is truly \'House of ophthalmic.\' Complete one stop solution for surgical instruments and services.',
        image: require('../../assets/images/testimonial-images/dr-yogesh-khandave.jpg'),
        rating: 5
      },
      {
        id: 3,
        name: 'Dr. Girish Gadre',
        location: 'Kolhapur, India',
        text: 'Instruments, IOL, consumable equipment\'s, service, C.S.S.D they have all the solutions and expertise on it.',
        image: require('../../assets/images/testimonial-images/dr-gadre.png'),
        rating: 5
      },
      {
        id: 4,
        name: 'Dr. Madhavi Seth',
        location: 'Vadodara',
        text: 'Ophtho India\'s portfolio for any VR surgeon is like 1 stop solution. I have been satisfied with their overall service and commitment.',
        image: require('../../assets/images/testimonial-images/dr-Madhavi-Seth.jpg'),
        rating: 5
      },
      {
        id: 5,
        name: 'Dr. Abdirahman Hayle',
        location: 'Somalia',
        text: 'Ophtho India is capable to handle all my requirements in ophthalmic front. Ophtho\'s technical team also well qualified and provide service to my existing equipment\'s.',
        image: require('../../assets/images/testimonial-images/dr-Adirehaman.png'),
        rating: 5
      }
    ];

    return (
      <View style={styles.testimonialSection}>
        <View style={styles.testimonialHeader}>
          <Text style={styles.testimonialSubtitle}>Testimonials</Text>
          <Text style={styles.testimonialTitle}>Our Clients Review</Text>
        </View>
        
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.testimonialScrollContainer}
          style={styles.testimonialScrollView}
        >
          {testimonials.map((item, index) => (
            <View key={item?.id || `testimonial-${index}`} style={styles.testimonialCard}>
              <View style={styles.quoteIcon}>
                <Text style={styles.quoteText}>"</Text>
              </View>
              
              <Image 
                source={item.image}
                style={styles.testimonialImage}
                resizeMode="cover"
              />
              
              <Text style={styles.testimonialName}>{item?.name}</Text>
              <Text style={styles.testimonialLocation}>{item.location}</Text>
              
              <Text style={styles.testimonialText}>{item.text}</Text>
              
              {renderStars(item.rating)}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <InlineLoading text="Loading home content..." size="large" />
        </View>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          key="home-refresh-control"
          refreshing={refreshing} 
          onRefresh={onRefresh} 
        />
      }
    >
      {renderHeader()}
      {renderProductSlider()}
      {renderPromotionalCard()}
      {renderCategories()}
      {renderFeaturedProducts()}
      {renderPartners()}
      {renderTestimonials()}
      {renderQuickActions()}
    </ScrollView>
  );
};

const getStyles = (theme) => StyleSheet.create({
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
    section: {
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textPrimary,
    },
    seeAllText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.medium,
    },
    promoContainer: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.xl,
    },
    promoCard: {
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      ...theme.shadows.md,
    },
    promoContent: {
      alignItems: 'flex-start',
    },
    promoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    promoIcon: {
      marginRight: theme.spacing.sm,
    },
    promoTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF',
    },
    promoSubtitle: {
      fontSize: theme.typography.fontSize.md,
      color: '#FFFFFF',
      marginBottom: theme.spacing.md,
      opacity: 0.9,
    },
    promoFeatures: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: theme.spacing.lg,
      marginBottom: theme.spacing.xs,
    },
    featureText: {
      fontSize: theme.typography.fontSize.sm,
      color: '#FFFFFF',
      marginLeft: theme.spacing.xs,
    },
    promoButton: {
      backgroundColor: '#FFFFFF',
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginTop: theme.spacing.md,
      ...theme.shadows.sm,
    },
    promoButtonText: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#007AFF',
      marginRight: theme.spacing.xs,
    },
    buttonIcon: {
      marginLeft: theme.spacing.xs,
    },
    productCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginRight: theme.spacing.md,
      width: 160,
      ...theme.shadows.sm,
    },
    productImage: {
      width: '100%',
      height: 120,
      borderTopLeftRadius: theme.borderRadius.lg,
      borderTopRightRadius: theme.borderRadius.lg,
    },
    productInfo: {
      padding: theme.spacing.sm,
    },
    productName: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    productPrice: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    quickActionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    quickActionCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      alignItems: 'center',
      width: '48%',
      marginBottom: theme.spacing.md,
      ...theme.shadows.sm,
    },
    quickActionText: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textPrimary,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
    partnerScrollContainer: {
      height: 80,
      overflow: 'hidden',
    },
    partnerScrollContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    partnerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      marginRight: theme.spacing.md,
      width: 120,
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      ...theme.shadows.xs,
    },
    partnerLogo: {
      width: 100,
      height: 40,
    },
    relatedSection: {
      marginTop: theme.spacing.lg,
    },
    relatedTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.md,
    },
    relatedProductsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    relatedProductCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      width: '48%',
      marginBottom: theme.spacing.md,
      ...theme.shadows.xs,
    },
    relatedProductImage: {
      width: '100%',
      height: 100,
      borderTopLeftRadius: theme.borderRadius.md,
      borderTopRightRadius: theme.borderRadius.md,
    },
    relatedProductInfo: {
      padding: theme.spacing.sm,
    },
    relatedProductName: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.textPrimary,
      marginBottom: theme.spacing.xs,
    },
    relatedProductPrice: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    viewMoreButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    viewMoreText: {
      color: theme.colors.surface,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.medium,
    },
    sliderContainer: {
      marginBottom: theme.spacing.xl,
    },
    sliderCard: {
      width: width - 32,
      marginHorizontal: 16,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      ...theme.shadows.md,
    },
    sliderImage: {
      width: '100%',
      height: 200,
    },
    sliderContent: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      padding: theme.spacing.lg,
    },
    sliderTitle: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF',
      marginBottom: theme.spacing.xs,
    },
    sliderSubtitle: {
      fontSize: theme.typography.fontSize.md,
      color: '#FFFFFF',
      opacity: 0.9,
    },
    sliderIndicators: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    sliderIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.borderLight,
      marginHorizontal: 4,
    },
    activeSliderIndicator: {
      backgroundColor: theme.colors.primary,
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    categoryCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      width: 120,
      marginRight: theme.spacing.md,
      marginBottom: theme.spacing.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      overflow: 'hidden',
      ...theme.shadows.sm,
    },
    categoryImage: {
      width: '100%',
      height: 100,
    },
    categoryInfo: {
      padding: theme.spacing.sm,
    },
    categoryIcon: {
      backgroundColor: theme.colors.primaryLight || '#E3F2FD',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    categoryName: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.textPrimary,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    categoryCount: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    testimonialsContainer: {
      height: 200,
    },
    testimonialSection: {
      marginBottom: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
    },
    testimonialHeader: {
      marginBottom: theme.spacing.lg,
      alignItems: 'center',
    },
    testimonialSubtitle: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.medium,
      textAlign: 'center',
      marginBottom: theme.spacing.xs,
    },
    testimonialTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textPrimary,
      textAlign: 'center',
    },
    testimonialScrollContainer: {
      paddingHorizontal: theme.spacing.sm,
    },
    testimonialScrollView: {
      marginTop: theme.spacing.md,
    },
    testimonialCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginRight: theme.spacing.md,
      width: width - 80,
      alignItems: 'center',
      ...theme.shadows.sm,
    },
    quoteIcon: {
      position: 'absolute',
      top: theme.spacing.md,
      left: theme.spacing.md,
    },
    quoteText: {
      fontSize: 40,
      color: theme.colors.primary,
      fontWeight: theme.typography.fontWeight.bold,
      opacity: 0.3,
    },
    testimonialImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    testimonialAvatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: theme.spacing.md,
    },
    testimonialName: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.textPrimary,
    },
    testimonialLocation: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    testimonialText: {
      fontSize: theme.typography.fontSize.md,
      color: theme.colors.textPrimary,
      lineHeight: 22,
      marginBottom: theme.spacing.sm,
    },
    starsContainer: {
      flexDirection: 'row',
    },
    // Product Slider Styles
    productSliderSection: {
      position: 'relative',
      marginBottom: theme.spacing.xl,
      height: 250,
    },
    productSliderContainer: {
      alignItems: 'center',
    },
    productSliderScrollView: {
      height: 250,
    },
    productSliderCard: {
      width: width,
      height: 250,
      position: 'relative',
    },
    productSliderImage: {
      width: '100%',
      height: '100%',
    },
    productSliderOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      padding: theme.spacing.lg,
    },
    productSliderTitle: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: '#FFFFFF',
      textAlign: 'center',
    },
    sliderArrow: {
      position: 'absolute',
      top: '50%',
      transform: [{ translateY: -20 }],
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    leftArrow: {
      left: theme.spacing.md,
    },
    rightArrow: {
      right: theme.spacing.md,
    },
  });

export default HomeScreen;