import apiClient from '../lib/api-client';
import type { AgeGroup } from '../types/product';

export interface AgeGroupResponse {
  age_groups: AgeGroup[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class AgeGroupAPI {
  private client = apiClient;

  async getAllAgeGroups(): Promise<AgeGroup[]> {
    try {
      const response = await this.client.get<AgeGroupResponse>('/age-groups');
      return response.age_groups || [];
    } catch (error) {
      console.error('Error fetching age groups:', error);
      throw error;
    }
  }

  async getAgeGroupById(id: number): Promise<AgeGroup> {
    try {
      const response = await this.client.get<AgeGroup>(`/age-groups/${id}`);
      return response;
    } catch (error) {
      console.error('Error fetching age group:', error);
      throw error;
    }
  }

  async createAgeGroup(data: Omit<AgeGroup, 'id'>): Promise<AgeGroup> {
    try {
      const response = await this.client.post<AgeGroup>('/age-groups', data);
      return response;
    } catch (error) {
      console.error('Error creating age group:', error);
      throw error;
    }
  }

  async updateAgeGroup(id: number, data: Partial<AgeGroup>): Promise<AgeGroup> {
    try {
      const response = await this.client.put<AgeGroup>(`/age-groups/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error updating age group:', error);
      throw error;
    }
  }

  async deleteAgeGroup(id: number): Promise<void> {
    try {
      await this.client.delete(`/age-groups/${id}`);
    } catch (error) {
      console.error('Error deleting age group:', error);
      throw error;
    }
  }
}

export const ageGroupAPI = new AgeGroupAPI();
export default ageGroupAPI;
