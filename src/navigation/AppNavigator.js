import React from 'react';
import { TouchableOpacity } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../theme';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import ProfileWrapper from '../screens/ProfileWrapper';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import SearchScreen from '../screens/SearchScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import PaymentMethodsScreen from '../screens/PaymentMethodsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AddressesScreen from '../screens/profile/AddressesScreen';
import EditAddressScreen from '../screens/profile/EditAddressScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main app screens
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Products') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarTestID: 'home-tab' }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductListScreen} 
        options={{ tabBarTestID: 'products-tab' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen} 
        options={{ tabBarTestID: 'cart-tab' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileWrapper} 
        options={{ tabBarTestID: 'profile-tab' }}
      />
    </Tab.Navigator>
  );
};

// Auth Stack Navigator
const AuthStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainApp" component={MainStackNavigator} />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={({ route, navigation }) => ({
          headerShown: true,
          title: 'Login',
          headerBackTitleVisible: false,
          headerLeft: () => {
            const fromProfile = route?.params?.fromProfile;
            return (
              <TouchableOpacity
                onPress={() => {
                  if (fromProfile) {
                    // If user came from profile, go back two steps (skip profile screen)
                    navigation.reset({
                      index: 0,
                      routes: [{ name: 'MainApp' }],
                    });
                  } else {
                    if (navigation.canGoBack()) {
                      navigation.goBack();
                    } else {
                      navigation.reset({
                        index: 0,
                        routes: [{ name: 'MainApp' }],
                      });
                    }
                  }
                }}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
              </TouchableOpacity>
            );
          },
        })}
      />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

// Main Stack Navigator
const MainStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{
          title: 'Product Details',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{
          title: 'Checkout',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{
          title: 'My Orders',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="OrderDetail" 
        component={OrderDetailScreen}
        options={{
          title: 'Order Details',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="ProductList" 
        component={ProductListScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          title: 'Search Products',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Categories" 
        component={CategoriesScreen}
        options={{
          title: 'Categories',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          title: 'Login',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Register',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="ChangePassword" 
        component={ChangePasswordScreen}
        options={{
          title: 'Change Password',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="PaymentMethods" 
        component={PaymentMethodsScreen}
        options={{
          title: 'Payment Methods',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="Addresses" 
        component={AddressesScreen}
        options={{
          title: 'My Addresses',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="EditAddress" 
        component={EditAddressScreen}
        options={{
          title: 'Edit Address',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    // You can return a loading screen here
    return null;
  }

  // If user is authenticated, show the main app
  if (isAuthenticated) {
    return <MainStackNavigator />;
  }

  // If not authenticated, show auth flow
  return <AuthStackNavigator />;
};

export default AppNavigator;