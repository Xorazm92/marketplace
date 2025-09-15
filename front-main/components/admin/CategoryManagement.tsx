'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getAllCategories, createCategory, updateCategory, deleteCategory, CreateCategoryDto } from '../../endpoints/category';
import styles from './ProductManagement.module.scss';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  is_active?: boolean;
  sort_order?: number;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: string;
  is_active: boolean;
  sort_order: string;
}

const CategoryManagement: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: '',
    is_active: true,
    sort_order: ''
  });

  // Fetch categories
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getAllCategories();
      const list = Array.isArray(response) ? response : (response?.data || response?.categories || []);
      return list.map((c: any) => ({
        id: c.id,
        name: c.name || c.title,
        slug: c.slug,
        description: c.description,
        image_url: c.image_url,
        parent_id: c.parent_id,
        is_active: c.is_active,
        sort_order: c.sort_order
      }));
    }
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategoriya muvaffaqiyatli yaratildi!');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Kategoriya yaratishda xatolik');
    }
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateCategoryDto }) => 
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategoriya muvaffaqiyatli yangilandi!');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Kategoriya yangilashda xatolik');
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Kategoriya muvaffaqiyatli o\'chirildi!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Kategoriya o\'chirishda xatolik');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Kategoriya nomini kiriting');
      return;
    }
    
    if (!formData.slug.trim()) {
      toast.error('Slug kiriting');
      return;
    }

    const submitData: CreateCategoryDto = {
      name: formData.name.trim(),
      slug: formData.slug.trim(),
      description: formData.description.trim() || undefined,
      image_url: formData.image_url.trim() || undefined,
      parent_id: formData.parent_id ? Number(formData.parent_id) : undefined,
      is_active: formData.is_active,
      sort_order: formData.sort_order ? Number(formData.sort_order) : undefined,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id?.toString() || '',
      is_active: category.is_active ?? true,
      sort_order: category.sort_order?.toString() || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = (categoryId: number) => {
    if (window.confirm('Bu kategoriyani o\'chirishni xohlaysizmi?')) {
      deleteMutation.mutate(categoryId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      parent_id: '',
      is_active: true,
      sort_order: ''
    });
    setShowAddForm(false);
    setEditingCategory(null);
  };

  const filteredCategories = categories.filter((category: Category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.productManagement}>
      <div className={styles.header}>
        <div>
          <h2>Kategoriya boshqaruvi</h2>
          <p>Kategoriyalarni qo'shish, tahrirlash va o'chirish</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
          >
            + Yangi kategoriya qo'shish
          </button>
        </div>
      </div>

      {/* Search */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Kategoriyalarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className={styles.loadingState}>
          <div className={styles.loadingIcon}>⏳</div>
          <h3>Kategoriyalar yuklanmoqda...</h3>
        </div>
      )}

      {/* Categories Grid */}
      <div className={styles.realProductsSection}>
        <h3 className={styles.sectionTitle}>Kategoriyalar ({filteredCategories.length})</h3>
        <div className={styles.realProductsGrid}>
          {filteredCategories.map((category: Category) => (
            <div key={category.id} className={styles.realProductCard}>
              <div className={styles.productImageContainer}>
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className={styles.productImage}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>📂</div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h4 className={styles.productTitle}>{category.name}</h4>
                <p className={styles.productCategory}>Slug: {category.slug}</p>
                {category.description && (
                  <p className={styles.productCategory}>{category.description}</p>
                )}
                <p className={styles.productPrice}>
                  Status: {category.is_active ? '✅ Faol' : '❌ Nofaol'}
                </p>
                {category.parent_id && (
                  <p className={styles.productCategory}>
                    Ota kategoriya: {categories.find(c => c.id === category.parent_id)?.name || 'Noma\'lum'}
                  </p>
                )}
              </div>
              <div className={styles.productActions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEdit(category)}
                  title="Tahrirlash"
                >
                  ✏️
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(category.id)}
                  title="O'chirish"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h3>{editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya qo\'shish'}</h3>
              <button className={styles.closeButton} onClick={resetForm}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.productForm}>
              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Kategoriya nomi *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Kategoriya nomini kiriting"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="slug">Slug *</label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    placeholder="kategoriya-slug"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Tavsif</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Kategoriya tavsifini kiriting"
                    rows={3}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="image_url">Rasm URL</label>
                    <input
                      type="url"
                      id="image_url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="parent_id">Ota kategoriya</label>
                    <select
                      id="parent_id"
                      name="parent_id"
                      value={formData.parent_id}
                      onChange={handleInputChange}
                    >
                      <option value="">—</option>
                      {categories.map((category: Category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>
                      <input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleCheckboxChange}
                      />
                      Faol kategoriya
                    </label>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="sort_order">Tartib raqami</label>
                    <input
                      type="number"
                      id="sort_order"
                      name="sort_order"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={resetForm}>
                  Bekor qilish
                </button>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
