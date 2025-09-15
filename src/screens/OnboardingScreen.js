import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { APP_CONFIG } from '../config/api';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: '1',
    image: require('../../assets/images/Slider-1.jpg'),
    title: 'Welcome to Ophtho India',
    subtitle: 'Healthcare Experts & Bio-Medical Solutions',
    description: 'Your trusted partner for ophthalmic surgical instruments and medical equipment.',
  },
  {
    id: '2',
    image: require('../../assets/images/Slider-2.jpg'),
    title: 'Premium Medical Equipment',
    subtitle: 'OT / OPD / CSSD Segments',
    description: 'Comprehensive range of medical instruments and equipment for healthcare professionals.',
  },
  {
    id: '3',
    image: require('../../assets/images/Slider-3.jpg'),
    title: 'Expert Services',
    subtitle: 'Professional Support & Quality Assurance',
    description: 'Dedicated support team ensuring the highest quality standards for all our products.',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      // Navigate to main app after onboarding
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    }
  };

  const handleSkip = () => {
    // Navigate to main app when skipping onboarding
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainApp' }],
    });
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderOnboardingItem = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../assets/images/logo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {onboardingData.map((_, index) => (
        <View
          key={index}
          style={[
            styles.paginationDot,
            index === currentIndex && styles.paginationDotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={onboardingData}
        renderItem={renderOnboardingItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => item?.id?.toString() || `onboarding-${index}`}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      
      <View style={styles.bottomContainer}>
        {renderPagination()}
        
        <View style={[
          styles.buttonContainer,
          currentIndex === onboardingData.length - 1 && styles.buttonContainerCenter
        ]}>
          {currentIndex < onboardingData.length - 1 && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient
              colors={['#007AFF', '#0056CC']}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex === onboardingData.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width,
    height,
    flex: 1,
  },
  imageContainer: {
    flex: 0.45,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  contentContainer: {
    flex: 0.55,
    paddingHorizontal: 24,
    paddingTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logo: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  paginationDotActive: {
    backgroundColor: '#007AFF',
    width: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainerCenter: {
    justifyContent: 'center',
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#666',
  },
  nextButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default OnboardingScreen;