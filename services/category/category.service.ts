// src/services/category/category.service.ts
import { apiClient } from '@/services/api';
import { API_CONFIG } from '@/services/api/config';
import { ENDPOINTS } from '@/services/api/endpoints';

export interface Category {
  id: string;
  name: string;
}

/**
 * Fetch all available categories
 */
export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await apiClient.get<Category[]>(ENDPOINTS.CATEGORIES.LIST);
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Get category by ID
 */
export async function getCategoryById(id: string): Promise<Category | null> {
  try {
    const response = await apiClient.get<Category>(ENDPOINTS.CATEGORIES.DETAIL(id));
    
    if (response.error) {
      throw new Error(response.error.message);
    }
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching category with ID ${id}:`, error);
    throw error;
  }
}