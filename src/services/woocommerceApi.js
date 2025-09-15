import axios from 'axios';
import { API_CONFIG, ENDPOINTS } from '../config/api';
import { 
  getMockProducts, 
  getMockProduct, 
  getMockCategories, 
  getMockProductsByCategory 
} from './mockData';

class WooCommerceAPI {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}${API_CONFIG.WC_ENDPOINT}`,
      timeout: API_CONFIG.TIMEOUT,
      auth: {
        username: API_CONFIG.CONSUMER_KEY,
        password: API_CONFIG.CONSUMER_SECRET,
      },
    });
    
    this.retryAttempts = API_CONFIG.RETRY_ATTEMPTS || 3;
    this.retryDelay = API_CONFIG.RETRY_DELAY || 1000;

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url);
        return config;
      },
      (error) => {
        console.error('API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log('API Response:', response.status, response.config.url);
        return response;
      },
      (error) => {
        // Don't log 404 errors as they will be handled by fallback
        if (error.response?.status !== 404) {
          console.error('API Response Error:', error.response?.status, error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  // Retry method for handling API failures
  async retryRequest(requestFn, attempt = 1) {
    try {
      return await requestFn();
    } catch (error) {
      const isRetryableError = 
        error.code === 'ECONNABORTED' || // Timeout
        error.response?.status === 504 || // Gateway timeout
        error.response?.status === 502 || // Bad gateway
        error.response?.status === 503;   // Service unavailable
      
      if (isRetryableError && attempt < this.retryAttempts) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`API request failed (attempt ${attempt}/${this.retryAttempts}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryRequest(requestFn, attempt + 1);
      }
      
      throw error;
    }
  }

  // Products
  async getProducts(params = {}) {
    try {
      const response = await this.retryRequest(() => 
        this.api.get(ENDPOINTS.PRODUCTS, { params })
      );
      return response.data;
    } catch (error) {
      console.warn('API failed after retries, using mock data:', error.message);
      return getMockProducts(params);
    }
  }

  async getProduct(id) {
    try {
      const response = await this.api.get(`${ENDPOINTS.PRODUCTS}/${id}`);
      return response.data;
    } catch (error) {
      console.warn('API failed, using mock data:', error.message);
      return getMockProduct(id);
    }
  }

  async searchProducts(query, params = {}) {
    try {
      const response = await this.api.get(ENDPOINTS.PRODUCTS, {
        params: { search: query, ...params },
      });
      return response.data;
    } catch (error) {
      console.warn('API failed, using mock data:', error.message);
      return getMockProducts({ ...params, search: query });
    }
  }

  // Categories
  async getCategories(params = {}) {
    try {
      const response = await this.retryRequest(() => 
        this.api.get(ENDPOINTS.CATEGORIES, { params })
      );
      return response.data;
    } catch (error) {
      console.warn('API failed after retries, using mock data:', error.message);
      return getMockCategories(params);
    }
  }

  async getProductsByCategory(categoryId, params = {}) {
    try {
      const response = await this.api.get(ENDPOINTS.PRODUCTS, {
        params: { category: categoryId, ...params },
      });
      return response.data;
    } catch (error) {
      console.warn('API failed, using mock data:', error.message);
      return getMockProductsByCategory(categoryId, params);
    }
  }

  // Orders
  async createOrder(orderData) {
    try {
      console.log('Creating order with WooCommerce API...');
      const response = await this.api.post(ENDPOINTS.ORDERS, orderData);
      console.log('Order created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Order creation failed:', error.response?.data || error.message);
      throw this.handleError(error);
    }
  }

  async getOrder(id) {
    try {
      const response = await this.api.get(`${ENDPOINTS.ORDERS}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrders(params = {}) {
    try {
      const response = await this.api.get(ENDPOINTS.ORDERS, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrdersByCustomer(customerId, params = {}) {
    try {
      const response = await this.api.get(ENDPOINTS.ORDERS, {
        params: { customer: customerId, ...params },
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateOrderStatus(orderId, status, note = '') {
    try {
      const response = await this.api.put(`${ENDPOINTS.ORDERS}/${orderId}`, {
        status: status,
        customer_note: note
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async addOrderNote(orderId, note, customerNote = false) {
    try {
      const response = await this.api.post(`${ENDPOINTS.ORDERS}/${orderId}/notes`, {
        note: note,
        customer_note: customerNote
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getOrderNotes(orderId) {
    try {
      const response = await this.api.get(`${ENDPOINTS.ORDERS}/${orderId}/notes`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Authentication
  async authenticateUser(email, password) {
    try {
      // First, try to get customer by email to check if user exists
      const customers = await this.api.get(ENDPOINTS.CUSTOMERS, {
        params: { email: email, per_page: 1 }
      });
      
      if (customers.data.length === 0) {
        throw new Error('User not found. Please check your email or register first.');
      }
      
      const customer = customers.data[0];
      
      // For WooCommerce, we'll use a custom authentication endpoint
      // Since WooCommerce doesn't have built-in password verification via REST API,
      // we'll create a custom endpoint or use WordPress REST API
      const authResponse = await axios.post(`${API_CONFIG.BASE_URL}/wp-json/wp/v2/users/login`, {
        username: email,
        password: password
      });
      
      return {
        success: true,
        user: {
          id: customer.id,
          email: customer.email,
          firstName: customer.first_name,
          lastName: customer.last_name,
          username: customer.username,
          role: customer.role,
          billing: customer.billing,
          shipping: customer.shipping,
          avatar_url: customer.avatar_url
        },
        token: authResponse.data.token
      };
    } catch (error) {
      console.error('Authentication error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Authentication failed');
    }
  }

  // Customers
  async createCustomer(customerData) {
    try {
      const response = await this.api.post(ENDPOINTS.CUSTOMERS, customerData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCustomer(id) {
    try {
      const response = await this.api.get(`${ENDPOINTS.CUSTOMERS}/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCustomer(id, customerData) {
    try {
      console.log('Updating customer:', id, customerData);
      const response = await this.api.put(`${ENDPOINTS.CUSTOMERS}/${id}`, customerData);
      console.log('Customer updated successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw this.handleError(error);
    }
  }

  async getCustomerByEmail(email) {
    try {
      const response = await this.api.get(ENDPOINTS.CUSTOMERS, {
        params: { email: email, per_page: 1 }
      });
      return response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Enhanced customer profile methods
  async getCustomers(params = {}) {
    try {
      const response = await this.api.get(ENDPOINTS.CUSTOMERS, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCustomer(id, force = false) {
    try {
      const response = await this.api.delete(`${ENDPOINTS.CUSTOMERS}/${id}`, {
        params: { force }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCustomerBilling(id, billingData) {
    try {
      const response = await this.api.put(`${ENDPOINTS.CUSTOMERS}/${id}`, {
        billing: billingData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCustomerShipping(id, shippingData) {
    try {
      const response = await this.api.put(`${ENDPOINTS.CUSTOMERS}/${id}`, {
        shipping: shippingData
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCustomerProfile(id, profileData) {
    try {
      console.log('Updating customer profile:', id, profileData);
      
      // Prepare the update data according to WooCommerce REST API v3 structure
      const updateData = {
        first_name: profileData.firstName || profileData.first_name,
        last_name: profileData.lastName || profileData.last_name,
        email: profileData.email,
        username: profileData.username,
        billing: {
          first_name: profileData.firstName || profileData.first_name || '',
          last_name: profileData.lastName || profileData.last_name || '',
          company: profileData.billing?.company || '',
          address_1: profileData.billing?.address_1 || '',
          address_2: profileData.billing?.address_2 || '',
          city: profileData.billing?.city || '',
          state: profileData.billing?.state || '',
          postcode: profileData.billing?.postcode || '',
          country: profileData.billing?.country || '',
          email: profileData.email || profileData.billing?.email || '',
          phone: profileData.phone || profileData.billing?.phone || ''
        },
        shipping: {
          first_name: profileData.firstName || profileData.first_name || '',
          last_name: profileData.lastName || profileData.last_name || '',
          company: profileData.shipping?.company || '',
          address_1: profileData.shipping?.address_1 || '',
          address_2: profileData.shipping?.address_2 || '',
          city: profileData.shipping?.city || '',
          state: profileData.shipping?.state || '',
          postcode: profileData.shipping?.postcode || '',
          country: profileData.shipping?.country || ''
        }
      };

      // Remove empty fields to avoid overwriting existing data
      Object.keys(updateData).forEach(key => {
        if (typeof updateData[key] === 'object' && updateData[key] !== null) {
          Object.keys(updateData[key]).forEach(subKey => {
            if (updateData[key][subKey] === '') {
              delete updateData[key][subKey];
            }
          });
        } else if (updateData[key] === '' || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const response = await this.api.put(`${ENDPOINTS.CUSTOMERS}/${id}`, updateData);
      console.log('Customer profile updated successfully:', response.data);
      
      // Return normalized user data
      return {
        id: response.data.id,
        email: response.data.email,
        firstName: response.data.first_name,
        lastName: response.data.last_name,
        username: response.data.username,
        role: response.data.role,
        billing: response.data.billing,
        shipping: response.data.shipping,
        avatar_url: response.data.avatar_url,
        date_created: response.data.date_created,
        date_modified: response.data.date_modified
      };
    } catch (error) {
      console.error('Error updating customer profile:', error);
      throw this.handleError(error);
    }
  }

  // Payment Gateways
  async getPaymentGateways() {
    try {
      const response = await this.api.get('/payment_gateways');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment gateways:', error);
      // Return default payment gateways if API fails
      return [
        {
          id: 'cod',
          title: 'Cash on Delivery',
          description: 'Pay when you receive your order',
          enabled: true
        },
        {
          id: 'upi',
          title: 'UPI QR Code',
          description: 'Pay using UPI apps like Paytm, Google Pay, PhonePe',
          enabled: true
        },
        {
          id: 'razorpay',
          title: 'Razorpay',
          description: 'Credit cards, debit cards, netbanking, wallet, and UPI payments',
          enabled: true
        },
        {
          id: 'paypal',
          title: 'PayPal',
          description: 'Pay via PayPal',
          enabled: true
        },
        {
          id: 'stripe',
          title: 'Credit/Debit Cards',
          description: 'Visa, MasterCard, American Express, Rupay',
          enabled: true
        }
      ];
    }
  }

  async getPaymentGateway(id) {
    try {
      const response = await this.api.get(`/payment_gateways/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment gateway ${id}:`, error);
      throw this.handleError(error);
    }
  }

  async updatePaymentGateway(id, data) {
    try {
      const response = await this.api.put(`/payment_gateways/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating payment gateway ${id}:`, error);
      throw this.handleError(error);
    }
  }

  // Process payment for specific gateways
  async processPayment(orderId, paymentMethod, paymentData = {}) {
    try {
      // For now, we'll just update the order with payment info
      // In a real implementation, you'd integrate with actual payment processors
      const orderUpdate = {
        status: paymentMethod === 'cod' ? 'processing' : 'pending',
        meta_data: [
          {
            key: '_payment_method_data',
            value: JSON.stringify(paymentData)
          },
          {
            key: '_payment_processed_at',
            value: new Date().toISOString()
          }
        ]
      };
      
      const response = await this.api.put(`/orders/${orderId}`, orderUpdate);
      return response.data;
    } catch (error) {
      console.error(`Error processing payment for order ${orderId}:`, error);
      throw this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        status,
        message: data.message || 'Server error occurred',
        data: data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        status: 0,
        message: 'Network error - please check your connection',
        data: null,
      };
    } else {
      // Something else happened
      return {
        status: -1,
        message: error.message || 'An unexpected error occurred',
        data: null,
      };
    }
  }
}

export default new WooCommerceAPI();