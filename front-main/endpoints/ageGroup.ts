
import instance from './instance';

export interface AgeGroup {
  id: number;
  name: string;
  min_age: number;
  max_age?: number;
  description?: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  sort_order: number;
}

export const ageGroupAPI = {
  getAll: () => instance.get<AgeGroup[]>('/age-groups'),
  getById: (id: number) => instance.get<AgeGroup>(`/age-groups/${id}`),
  create: (data: Partial<AgeGroup>) => instance.post<AgeGroup>('/age-groups', data),
  update: (id: number, data: Partial<AgeGroup>) => 
    instance.put<AgeGroup>(`/age-groups/${id}`, data),
  delete: (id: number) => instance.delete(`/age-groups/${id}`)
};
