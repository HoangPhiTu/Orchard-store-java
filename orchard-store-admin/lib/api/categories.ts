import apiClient from './axios';
import { CategoryDTO } from '@/types/category';

export const categoryApi = {
  // Get all categories
  getAll: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // Get root categories
  getRoots: async () => {
    const response = await apiClient.get('/categories/roots');
    return response.data;
  },

  // Get category by ID
  getById: async (id: number) => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Get category by slug
  getBySlug: async (slug: string) => {
    const response = await apiClient.get(`/categories/slug/${slug}`);
    return response.data;
  },

  // Get children categories
  getChildren: async (parentId: number) => {
    const response = await apiClient.get(`/categories/parent/${parentId}/children`);
    return response.data;
  },

  // Create category
  create: async (data: CategoryDTO) => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  // Update category
  update: async (id: number, data: Partial<CategoryDTO>) => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category
  delete: async (id: number) => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },
};

