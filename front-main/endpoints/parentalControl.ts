
import instance from './instance';

export interface ParentalControl {
  id: number;
  user_id: number;
  child_profile_id: number;
  spending_limit?: number;
  daily_spending_limit?: number;
  allowed_categories?: string[];
  blocked_categories?: string[];
  time_restrictions?: any;
  is_active: boolean;
}

export interface ChildProfile {
  id: number;
  parent_id: number;
  name: string;
  birth_date: string;
  gender?: string;
  interests?: any;
  allergies?: any;
  avatar?: string;
  is_active: boolean;
}

export const parentalControlAPI = {
  getByUser: (userId: number) => 
    instance.get<ParentalControl[]>(`/users/${userId}/parental-controls`),
  create: (data: Partial<ParentalControl>) => 
    instance.post<ParentalControl>('/parental-controls', data),
  update: (id: number, data: Partial<ParentalControl>) => 
    instance.put<ParentalControl>(`/parental-controls/${id}`, data)
};

export const childProfileAPI = {
  getByParent: (parentId: number) => 
    instance.get<ChildProfile[]>(`/users/${parentId}/child-profiles`),
  create: (data: Partial<ChildProfile>) => 
    instance.post<ChildProfile>('/child-profiles', data),
  update: (id: number, data: Partial<ChildProfile>) => 
    instance.put<ChildProfile>(`/child-profiles/${id}`, data),
  delete: (id: number) => instance.delete(`/child-profiles/${id}`)
};
