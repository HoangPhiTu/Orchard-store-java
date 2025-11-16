import apiClient from './axios';
import { ProductDTO } from '@/types/product';

export const productApi = {
  // Get all products with pagination
  getAll: async (params?: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // Get product by slug
  getBySlug: async (slug: string) => {
    const response = await apiClient.get(`/products/slug/${slug}`);
    return response.data;
  },

  // Search products
  search: async (params: {
    brandId?: number;
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    searchTerm?: string;
    page?: number;
    size?: number;
  }) => {
    const response = await apiClient.get('/products/search', { params });
    return response.data;
  },

  // Create product
  create: async (data: ProductDTO) => {
    const response = await apiClient.post('/products', data);
    return response.data;
  },

  // Update product
  update: async (id: number, data: Partial<ProductDTO>) => {
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product
  delete: async (id: number) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  // Get featured products
  getFeatured: async () => {
    const response = await apiClient.get('/products/featured');
    return response.data;
  },

  // Get new products
  getNew: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get('/products/new', { params });
    return response.data;
  },

  // Get bestseller products
  getBestseller: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get('/products/bestseller', { params });
    return response.data;
  },
};

