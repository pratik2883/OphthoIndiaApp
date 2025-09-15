// WooCommerce API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://ophthoindia.in',
  WC_ENDPOINT: '/wp-json/wc/v3',
  CONSUMER_KEY: 'ck_3b3a18c4af0ba7f0d205ec9350534ad2e32ce07c',
  CONSUMER_SECRET: 'cs_11341498a15f8142d51117d77bb05fa6f2a1a1ed',
  TIMEOUT: 30000, // Increased timeout to 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second delay between retries
};

// API Endpoints
export const ENDPOINTS = {
  PRODUCTS: '/products',
  CATEGORIES: '/products/categories',
  ORDERS: '/orders',
  CUSTOMERS: '/customers',
  CART: '/cart',
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'Ophtho India',
  COMPANY_NAME: 'Ophtho India Inc',
  DESCRIPTION: 'Healthcare experts and Bio-Medical personnel product selling site',
  VERSION: '1.0.0',
};