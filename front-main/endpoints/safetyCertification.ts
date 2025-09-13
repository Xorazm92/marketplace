
import instance from './instance';

export interface SafetyCertification {
  id: number;
  name: string;
  code: string;
  description?: string;
  required_for_age?: string;
  logo?: string;
  is_active: boolean;
}

export const safetyCertificationAPI = {
  getAll: () => instance.get<SafetyCertification[]>('/safety-certifications'),
  getById: (id: number) => instance.get<SafetyCertification>(`/safety-certifications/${id}`),
  getByProduct: (productId: number) => 
    instance.get<SafetyCertification[]>(`/products/${productId}/safety-certifications`)
};
