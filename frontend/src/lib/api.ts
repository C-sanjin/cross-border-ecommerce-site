import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refresh_token: refreshToken,
          });
          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/account/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post('/auth/register', { email, password, name }),
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh_token: refreshToken }),
  getProfile: () => api.get('/profile'),
  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put('/profile', data),
};

// Products API
export const productsAPI = {
  list: (params?: { page?: number; page_size?: number; category_id?: number; keyword?: string }) =>
    api.get('/products', { params }),
  getById: (id: number) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
};

// Cart API
export const cartAPI = {
  get: () => api.get('/cart'),
  addItem: (productId: number, quantity: number) =>
    api.post('/cart/items', { product_id: productId, quantity }),
  updateItem: (itemId: number, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: number) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  create: (data: { shipping_address: any; payment_method: string; note?: string; coupon_code?: string }) =>
    api.post('/orders', data),
  list: (params?: { page?: number; page_size?: number; status?: string }) =>
    api.get('/orders', { params }),
  getById: (id: number) => api.get(`/orders/${id}`),
  cancel: (id: number) => api.post(`/orders/${id}/cancel`),
};

// Reviews API
export const reviewsAPI = {
  list: (productId: number, params?: { page?: number; page_size?: number }) =>
    api.get(`/products/${productId}/reviews`, { params }),
  create: (productId: number, data: { rating: number; title?: string; content?: string }) =>
    api.post(`/products/${productId}/reviews`, data),
};

// Addresses API
export const addressesAPI = {
  list: () => api.get('/addresses'),
  create: (data: { name: string; phone: string; country: string; state?: string; city?: string; district?: string; street?: string; zip_code?: string; is_default?: boolean }) =>
    api.post('/addresses', data),
  update: (id: number, data: { name: string; phone: string; country: string; state?: string; city?: string; district?: string; street?: string; zip_code?: string; is_default?: boolean }) =>
    api.put(`/addresses/${id}`, data),
  delete: (id: number) => api.delete(`/addresses/${id}`),
};

// Coupons API
export const couponsAPI = {
  validate: (code: string, orderAmount: number) =>
    api.post('/coupons/validate', { code, order_amount: orderAmount }),
  list: () => api.get('/coupons'),
};

// Currency API
export const currencyAPI = {
  getRates: () => api.get('/currency/rates'),
  convert: (from: string, to: string, amount: number) =>
    api.get('/currency/convert', { params: { from, to, amount } }),
};
