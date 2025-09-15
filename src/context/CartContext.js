import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext();

const initialState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload.items,
        totalItems: action.payload.totalItems,
        totalPrice: action.payload.totalPrice,
      };
    
    case 'ADD_TO_CART': {
      const { product, quantity = 1 } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item?.product?.id === product?.id);
      
      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item
        newItems = state.items.map((item, index) => 
          index === existingItemIndex 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item
        newItems = [...state.items, { product, quantity }];
      }
      
      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = newItems.reduce((sum, item) => sum + (parseFloat(item.product?.price || item.price) * item.quantity), 0);
      
      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      };
    }
    
    case 'REMOVE_FROM_CART': {
      const productId = action.payload;
      const newItems = state.items.filter(item => item?.product?.id !== productId);
      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = newItems.reduce((sum, item) => sum + (parseFloat(item.product?.price || item.price) * item.quantity), 0);
      
      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return cartReducer(state, { type: 'REMOVE_FROM_CART', payload: productId });
      }
      
      const newItems = state.items.map(item => 
        item?.product?.id === productId ? { ...item, quantity } : item
      );
      
      const newTotalItems = newItems.reduce((sum, item) => sum + item.quantity, 0);
      const newTotalPrice = newItems.reduce((sum, item) => sum + (parseFloat(item.product?.price || item.price) * item.quantity), 0);
      
      return {
        ...state,
        items: newItems,
        totalItems: newTotalItems,
        totalPrice: newTotalPrice,
      };
    }
    
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
      };
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from storage on app start
  useEffect(() => {
    loadCartFromStorage();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveCartToStorage();
  }, [state.items, state.totalItems, state.totalPrice]);

  const loadCartFromStorage = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const cartData = await AsyncStorage.getItem('cart');
      
      if (cartData) {
        const parsedCart = JSON.parse(cartData);
        dispatch({ type: 'LOAD_CART', payload: parsedCart });
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveCartToStorage = async () => {
    try {
      const cartData = {
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      };
      await AsyncStorage.setItem('cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const addToCart = (product, quantity = 1) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
  };

  const removeFromCart = (productId) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item?.product?.id === productId);
    return item ? item.quantity : 0;
  };

  const isInCart = (productId) => {
    return state.items.some(item => item?.product?.id === productId);
  };

  const getTotalItems = () => {
    return state.totalItems;
  };

  const getTotalPrice = () => {
    return state.totalPrice;
  };

  const value = {
    ...state,
    cartItems: state.items, // Alias for backward compatibility
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemQuantity,
    isInCart,
    getTotalItems,
    getTotalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};