import axios from 'axios';
import {
  AdminUser,
  DashboardStats,
  Order,
  PaginationResponse,
  Product,
  ProductCategory,
  ProductCreateRequest,
  User,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const adminAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login', { email: username, password }),

  dashboardStats: () => api.get('/admin/dashboard/stats'),
  orderStatusCounts: () => api.get('/admin/dashboard/orders-status'),
  topProducts: (limit?: number) => api.get('/admin/dashboard/top-products', { params: { limit } }),

  listProducts: (params?: { page?: number; page_size?: number; status?: string }) =>
    api.get('/admin/products', { params }),
  getProduct: (id: number) => api.get(`/admin/products/${id}`),
  createProduct: (data: ProductCreateRequest) => api.post('/admin/products', data),
  updateProduct: (id: number, data: ProductCreateRequest) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id: number) => api.delete(`/admin/products/${id}`),
  listCategories: () => api.get('/admin/categories'),
  createCategory: (data: { name: string; parent_id?: number }) => api.post('/admin/categories', data),

  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadImages: (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    return api.post('/admin/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  listOrders: (params?: { page?: number; page_size?: number; status?: string }) =>
    api.get('/admin/orders', { params }),
  getOrder: (id: number) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id: number, status: string) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  refundOrder: (id: number) => api.post(`/admin/orders/${id}/refund`),

  listUsers: (params?: { page?: number; page_size?: number; status?: string }) =>
    api.get('/admin/users', { params }),
  getUser: (id: number) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id: number, status: string) =>
    api.put(`/admin/users/${id}/status`, { status }),

  listAdminUsers: (params?: { page?: number; page_size?: number; status?: string }) =>
    api.get('/admin/admins', { params }),
  getAdminUser: (id: number) => api.get(`/admin/admins/${id}`),
  createAdminUser: (data: { username: string; email: string; password: string; name: string; role: string }) =>
    api.post('/admin/admins', data),
  updateAdminUserStatus: (id: number, status: string) =>
    api.put(`/admin/admins/${id}/status`, { status }),
  deleteAdminUser: (id: number) => api.delete(`/admin/admins/${id}`),
};
