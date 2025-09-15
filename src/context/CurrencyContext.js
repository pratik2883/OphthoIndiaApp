import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CurrencyContext = createContext();

const CURRENCIES = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
  },
};

const initialState = {
  currentCurrency: CURRENCIES.INR, // Default to INR as requested
  exchangeRate: 83.0, // Default USD to INR rate (1 USD = 83 INR)
  isLoading: false,
};

const currencyReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_CURRENCY':
      return { ...state, currentCurrency: action.payload };
    
    case 'SET_EXCHANGE_RATE':
      return { ...state, exchangeRate: action.payload };
    
    case 'LOAD_CURRENCY_SETTINGS':
      return {
        ...state,
        currentCurrency: action.payload.currentCurrency || CURRENCIES.INR,
        exchangeRate: action.payload.exchangeRate || 83.0,
      };
    
    default:
      return state;
  }
};

export const CurrencyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(currencyReducer, initialState);

  // Load currency settings from AsyncStorage on app start
  useEffect(() => {
    loadCurrencySettings();
  }, []);

  const loadCurrencySettings = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const savedSettings = await AsyncStorage.getItem('currencySettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        dispatch({ type: 'LOAD_CURRENCY_SETTINGS', payload: settings });
      }
    } catch (error) {
      console.error('Error loading currency settings:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const saveCurrencySettings = async (settings) => {
    try {
      await AsyncStorage.setItem('currencySettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving currency settings:', error);
    }
  };

  const setCurrency = async (currencyCode) => {
    const currency = CURRENCIES[currencyCode];
    if (currency) {
      dispatch({ type: 'SET_CURRENCY', payload: currency });
      await saveCurrencySettings({
        currentCurrency: currency,
        exchangeRate: state.exchangeRate,
      });
    }
  };

  const updateExchangeRate = async (rate) => {
    dispatch({ type: 'SET_EXCHANGE_RATE', payload: rate });
    await saveCurrencySettings({
      currentCurrency: state.currentCurrency,
      exchangeRate: rate,
    });
  };

  // Convert price from INR to current currency
  const convertPrice = (priceInINR) => {
    const price = parseFloat(priceInINR) || 0;
    
    if (state.currentCurrency.code === 'INR') {
      return price;
    } else if (state.currentCurrency.code === 'USD') {
      return price / state.exchangeRate;
    }
    
    return price;
  };

  // Format price with currency symbol
  const formatPrice = (priceInINR, showDecimals = true) => {
    const convertedPrice = convertPrice(priceInINR);
    const decimals = showDecimals ? 2 : 0;
    
    if (state.currentCurrency.code === 'USD') {
      return `${state.currentCurrency.symbol}${convertedPrice.toFixed(decimals)}`;
    } else {
      return `${state.currentCurrency.symbol}${convertedPrice.toFixed(decimals)}`;
    }
  };

  // Get available currencies
  const getAvailableCurrencies = () => {
    return Object.values(CURRENCIES);
  };

  // Toggle between INR and USD
  const toggleCurrency = () => {
    const newCurrency = state.currentCurrency.code === 'INR' ? 'USD' : 'INR';
    setCurrency(newCurrency);
  };

  const value = {
    ...state,
    setCurrency,
    updateExchangeRate,
    convertPrice,
    formatPrice,
    getAvailableCurrencies,
    toggleCurrency,
    CURRENCIES,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;