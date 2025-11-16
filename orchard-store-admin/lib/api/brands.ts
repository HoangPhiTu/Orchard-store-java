import apiClient from './axios';
import { BrandDTO } from '@/types/brand';

export const brandApi = {
  // Get all brands
  getAll: async (activeOnly?: boolean) => {
    const response = await apiClient.get('/brands', {
      params: { activeOnly: activeOnly ?? false },
    });
    return response.data;
  },

  // Get brand by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/brands/${id}`);
    return response.data;
  },

  // Get brand by slug
  getBySlug: async (slug: string) => {
    const response = await apiClient.get(`/brands/slug/${slug}`);
    return response.data;
  },

  // Create brand
  create: async (data: BrandDTO) => {
    const response = await apiClient.post('/brands', data);
    return response.data;
  },

  // Update brand
  update: async (id: number, data: Partial<BrandDTO>) => {
    const response = await apiClient.put(`/brands/${id}`, data);
    return response.data;
  },

  // Delete brand
  delete: async (id: number) => {
    const response = await apiClient.delete(`/brands/${id}`);
    return response.data;
  },
};

