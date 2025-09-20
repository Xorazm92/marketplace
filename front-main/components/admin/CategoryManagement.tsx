'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import styles from './CategoryManagement.module.scss';

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  is_active: boolean;
  sort_order: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
  parent?: Category;
}

interface CategoryFormData {
  name: string;
  slug: string;
  description: string;
  image_url: string;
  parent_id: number | null;
  is_active: boolean;
  sort_order: number;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: null,
    is_active: true,
    sort_order: 0
  });

  // Load categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/category');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        toast.error('Kategoriyalarni yuklashda xatolik');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Kategoriyalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : type === 'number'
        ? parseInt(value) || 0
        : value
    }));

    // Auto-generate slug when name changes
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCategory 
        ? `http://localhost:4000/api/v1/category/${editingCategory.id}`
        : 'http://localhost:4000/api/v1/category';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingCategory ? 'Kategoriya yangilandi!' : 'Kategoriya yaratildi!');
        resetForm();
        loadCategories();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Kategoriyani saqlashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (id: number) => {
    if (!confirm('Bu kategoriyani o\'chirishni xohlaysizmi?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/category/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Kategoriya o\'chirildi!');
        loadCategories();
      } else {
        toast.error('Kategoriyani o\'chirishda xatolik');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Kategoriyani o\'chirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const toggleActive = async (category: Category) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/category/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...category,
          is_active: !category.is_active
        })
      });

      if (response.ok) {
        toast.success(`Kategoriya ${!category.is_active ? 'faollashtirildi' : 'o\'chirildi'}!`);
        loadCategories();
      } else {
        toast.error('Statusni o\'zgartirishda xatolik');
      }
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Statusni o\'zgartirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Edit category
  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      image_url: category.image_url || '',
      parent_id: category.parent_id || null,
      is_active: category.is_active,
      sort_order: category.sort_order
    });
    setShowAddForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      parent_id: null,
      is_active: true,
      sort_order: 0
    });
    setEditingCategory(null);
    setShowAddForm(false);
  };

  // Get main categories (no parent)
  const mainCategories = categories.filter(cat => !cat.parent_id);

  return (
    <div className={styles.categoryManagement}>
      <div className={styles.header}>
        <h2>Kategoriya boshqaruvi</h2>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
          disabled={loading}
        >
          <FaPlus /> Yangi kategoriya
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formModal}>
            <div className={styles.formHeader}>
              <h3>{editingCategory ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}</h3>
              <button onClick={resetForm} className={styles.closeButton}>×</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Kategoriya nomi *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Kategoriya nomini kiriting"
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
                  required
                  placeholder="kategoriya-slug"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Tavsif</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Kategoriya tavsifi"
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="parent_id">Asosiy kategoriya</label>
                <select
                  id="parent_id"
                  name="parent_id"
                  value={formData.parent_id || ''}
                  onChange={handleInputChange}
                >
                  <option value="">Asosiy kategoriya</option>
                  {mainCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

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

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="sort_order">Tartib raqami</label>
                  <input
                    type="number"
                    id="sort_order"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                    />
                    Faol
                  </label>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={resetForm} className={styles.cancelButton}>
                  Bekor qilish
                </button>
                <button type="submit" disabled={loading} className={styles.submitButton}>
                  {loading ? 'Saqlanmoqda...' : editingCategory ? 'Yangilash' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Categories Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Slug</th>
              <th>Asosiy kategoriya</th>
              <th>Status</th>
              <th>Tartib</th>
              <th>Yaratilgan</th>
              <th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className={styles.loading}>Yuklanmoqda...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={8} className={styles.empty}>Kategoriyalar topilmadi</td>
              </tr>
            ) : (
              categories.map(category => (
                <tr key={category.id}>
                  <td>{category.id}</td>
                  <td>
                    <div className={styles.categoryName}>
                      {category.image_url && (
                        <img src={category.image_url} alt={category.name} className={styles.categoryImage} />
                      )}
                      {category.name}
                    </div>
                  </td>
                  <td><code>{category.slug}</code></td>
                  <td>{category.parent?.name || '-'}</td>
                  <td>
                    <span className={`${styles.status} ${category.is_active ? styles.active : styles.inactive}`}>
                      {category.is_active ? 'Faol' : 'Nofaol'}
                    </span>
                  </td>
                  <td>{category.sort_order}</td>
                  <td>{new Date(category.createdAt).toLocaleDateString('uz-UZ')}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        onClick={() => handleEdit(category)}
                        className={styles.editButton}
                        title="Tahrirlash"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => toggleActive(category)}
                        className={styles.toggleButton}
                        title={category.is_active ? 'O\'chirish' : 'Faollashtirish'}
                      >
                        {category.is_active ? <FaEyeSlash /> : <FaEye />}
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className={styles.deleteButton}
                        title="O'chirish"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryManagement;
