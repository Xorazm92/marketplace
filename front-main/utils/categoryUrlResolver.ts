import { CategoryNode } from '../components/category/CategoryTree';

export interface ResolvedCategoryUrl {
  category: CategoryNode;
  breadcrumbs: CategoryNode[];
  isValid: boolean;
}

export class CategoryUrlResolver {
  private categoryMap: Map<string, CategoryNode> = new Map();
  private slugToIdMap: Map<string, string> = new Map();
  private categoryHierarchy: Map<string, CategoryNode[]> = new Map();

  constructor(categories: CategoryNode[]) {
    categories.forEach(category => {
      this.categoryMap.set(category.id, category);
      this.slugToIdMap.set(category.slug, category.id);
    });
    
    // Build hierarchy map
    categories.forEach(category => {
      if (category.parent_id) {
        if (!this.categoryHierarchy.has(category.parent_id)) {
          this.categoryHierarchy.set(category.parent_id, []);
        }
        this.categoryHierarchy.get(category.parent_id)!.push(category);
      }
    });
  }

  resolveUrl(slugs: string[]): ResolvedCategoryUrl {
    if (!slugs?.length) {
      return { category: null as any, breadcrumbs: [], isValid: false };
    }

    const breadcrumbs: CategoryNode[] = [];
    let parentId: string | null = null;

    for (let i = 0; i < slugs.length; i++) {
      const categoryId = this.slugToIdMap.get(slugs[i]);
      const category = categoryId ? this.categoryMap.get(categoryId) : null;
      
      if (!category || (i > 0 && category.parent_id !== parentId)) {
        return { category: null as any, breadcrumbs: [], isValid: false };
      }

      breadcrumbs.push(category);
      parentId = category.id;
    }

    return {
      category: breadcrumbs[breadcrumbs.length - 1],
      breadcrumbs,
      isValid: true
    };
  }

  generateUrl(categoryId: string): string {
    const category = this.categoryMap.get(categoryId);
    if (!category) return '';

    const path = this.buildPath(category);
    return `/category/${path.map(c => c.slug).join('/')}`;
  }

  buildPath(category: CategoryNode): CategoryNode[] {
    const path: CategoryNode[] = [];
    let current: CategoryNode | undefined = category;

    while (current) {
      path.unshift(current);
      current = current.parent_id ? this.categoryMap.get(current.parent_id) : undefined;
    }

    return path;
  }

  getCategoryBySlug(slug: string): CategoryNode | null {
    const categoryId = this.slugToIdMap.get(slug);
    return categoryId ? this.categoryMap.get(categoryId) || null : null;
  }

  getSubcategories(categoryId: string): CategoryNode[] {
    return this.categoryHierarchy.get(categoryId) || [];
  }
}
