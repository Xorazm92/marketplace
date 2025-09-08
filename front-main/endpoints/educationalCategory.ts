import apiClient from '../lib/api-client';
import type { EducationalCategory } from '../types/product';

export interface EducationalCategoryResponse {
  educational_categories: EducationalCategory[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class EducationalCategoryAPI {
  private client = apiClient;

  async getAllEducationalCategories(): Promise<EducationalCategory[]> {
    try {
      const response = await this.client.get<EducationalCategoryResponse>('/educational-categories');
      return response.educational_categories || [];
    } catch (error) {
      console.error('Error fetching educational categories:', error);
      throw error;
    }
  }

  async getEducationalCategoryById(id: number): Promise<EducationalCategory> {
    try {
      const response = await this.client.get<EducationalCategory>(`/educational-categories/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching educational category:', error);
      throw error;
    }
  }

  async createEducationalCategory(data: Omit<EducationalCategory, 'id'>): Promise<EducationalCategory> {
    try {
      const response = await this.client.post<EducationalCategory>('/educational-categories', data);
      return response;
    } catch (error) {
      console.error('Error creating educational category:', error);
      throw error;
    }
  }

  async updateEducationalCategory(id: number, data: Partial<EducationalCategory>): Promise<EducationalCategory> {
    try {
      const response = await this.client.put<EducationalCategory>(`/educational-categories/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating educational category:', error);
      throw error;
    }
  }

  async deleteEducationalCategory(id: number): Promise<void> {
    try {
      await this.client.delete(`/educational-categories/${id}`);
    } catch (error) {
      console.error('Error deleting educational category:', error);
      throw error;
    }
  }
}

export const educationalCategoryAPI = new EducationalCategoryAPI();
export default educationalCategoryAPI;
