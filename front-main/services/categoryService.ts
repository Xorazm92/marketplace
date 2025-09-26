import { CategoryNode } from '../components/category/CategoryTree';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export interface CategoryQueryParams {
  parentId?: string | null;
  search?: string;
  page?: number;
  limit?: number;
  active?: boolean;
}

export interface CategoryResponse {
  categories: CategoryNode[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateCategoryData {
  name: string;
  slug?: string;
  parent_id?: string;
  icon?: string;
  color?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateCategoryData extends Partial<CreateCategoryData> {
  id: string;
}

class CategoryService {
  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Get categories with hierarchy
  async getCategories(params: CategoryQueryParams = {}): Promise<CategoryResponse> {
    const searchParams = new URLSearchParams();
    
    if (params.parentId !== undefined) {
      searchParams.append('parentId', params.parentId || 'null');
    }
    if (params.search) {
      searchParams.append('search', params.search);
    }
    if (params.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString());
    }
    if (params.active !== undefined) {
      searchParams.append('active', params.active.toString());
    }

    const url = `/hierarchical-categories?${searchParams.toString()}`;
    return this.fetchWithAuth(url);
  }

  // Get category tree (all categories in hierarchy)
  async getCategoryTree(): Promise<CategoryNode[]> {
    try {
      const response = await this.fetchWithAuth('/hierarchical-categories/tree');
      return response.tree || response;
    } catch (error) {
      console.error('Failed to fetch category tree:', error);
      // Fallback to regular category endpoint
      try {
        const fallbackResponse = await this.fetchWithAuth('/category');
        return Array.isArray(fallbackResponse) ? fallbackResponse : fallbackResponse.categories || [];
      } catch (fallbackError) {
        console.error('Fallback category fetch failed:', fallbackError);
        return [];
      }
    }
  }

  // Get single category by ID
  async getCategoryById(id: string): Promise<CategoryNode> {
    return this.fetchWithAuth(`/hierarchical-categories/${id}`);
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<CategoryNode> {
    return this.fetchWithAuth(`/hierarchical-categories/slug/${slug}`);
  }

  // Create new category
  async createCategory(data: CreateCategoryData): Promise<CategoryNode> {
    return this.fetchWithAuth('/hierarchical-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update category
  async updateCategory(data: UpdateCategoryData): Promise<CategoryNode> {
    const { id, ...updateData } = data;
    return this.fetchWithAuth(`/hierarchical-categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    await this.fetchWithAuth(`/hierarchical-categories/${id}`, {
      method: 'DELETE',
    });
  }

  // Get category path (breadcrumbs)
  async getCategoryPath(id: string): Promise<CategoryNode[]> {
    return this.fetchWithAuth(`/hierarchical-categories/${id}/path`);
  }

  // Search categories
  async searchCategories(query: string, limit = 10): Promise<CategoryNode[]> {
    const response = await this.getCategories({ search: query, limit });
    return response.categories;
  }

  // Get popular categories
  async getPopularCategories(limit = 10): Promise<CategoryNode[]> {
    const response = await this.fetchWithAuth(`/hierarchical-categories/popular?limit=${limit}`);
    return response.categories || response;
  }

  // Reorder categories
  async reorderCategories(parentId: string | null, categoryIds: string[]): Promise<void> {
    await this.fetchWithAuth('/hierarchical-categories/reorder', {
      method: 'POST',
      body: JSON.stringify({
        parent_id: parentId,
        category_ids: categoryIds,
      }),
    });
  }

  // Update product counts for all categories
  async updateProductCounts(): Promise<void> {
    await this.fetchWithAuth('/hierarchical-categories/update-counts', {
      method: 'POST',
    });
  }
}

export const categoryService = new CategoryService();
export default categoryService;
