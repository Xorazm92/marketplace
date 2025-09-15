'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { getBrands, createBrand, updateBrand, deleteBrand } from '../../endpoints/brand';
import styles from './ProductManagement.module.scss';

interface Brand {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  is_active?: boolean;
}

interface BrandFormData {
  name: string;
  description: string;
  logo_url: string;
  website: string;
  is_active: boolean;
}

const BrandManagement: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
    logo_url: '',
    website: '',
    is_active: true
  });

  // Fetch brands
  const { data: brands = [], isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await getBrands();
      return Array.isArray(response) ? response : (response?.data || response?.brands || []);
    }
  });

  // Create brand mutation
  const createMutation = useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brend muvaffaqiyatli yaratildi!');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Brend yaratishda xatolik');
    }
  });

  // Update brand mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<BrandFormData> }) => 
      updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brend muvaffaqiyatli yangilandi!');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Brend yangilashda xatolik');
    }
  });

  // Delete brand mutation
  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brend muvaffaqiyatli o\'chirildi!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Brend o\'chirishda xatolik');
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      toast.error('Brend nomini kiriting');
      return;
    }

    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      logo_url: formData.logo_url.trim() || undefined,
      website: formData.website.trim() || undefined,
      is_active: formData.is_active
    };

    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      description: brand.description || '',
      logo_url: brand.logo_url || '',
      website: brand.website || '',
      is_active: brand.is_active ?? true
    });
    setShowAddForm(true);
  };

  const handleDelete = (brandId: number) => {
    if (window.confirm('Bu brendni o\'chirishni xohlaysizmi?')) {
      deleteMutation.mutate(brandId);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      logo_url: '',
      website: '',
      is_active: true
    });
    setShowAddForm(false);
    setEditingBrand(null);
  };

  const filteredBrands = brands.filter((brand: Brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.productManagement}>
      <div className={styles.header}>
        <div>
          <h2>Brend boshqaruvi</h2>
          <p>Brendlarni qo'shish, tahrirlash va o'chirish</p>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
          >
            + Yangi brend qo'shish
          </button>
        </div>
      </div>

      {/* Search */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Brendlarni qidirish..."
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
          <h3>Brendlar yuklanmoqda...</h3>
        </div>
      )}

      {/* Brands Grid */}
      <div className={styles.realProductsSection}>
        <h3 className={styles.sectionTitle}>Brendlar ({filteredBrands.length})</h3>
        <div className={styles.realProductsGrid}>
          {filteredBrands.map((brand: Brand) => (
            <div key={brand.id} className={styles.realProductCard}>
              <div className={styles.productImageContainer}>
                {brand.logo_url ? (
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className={styles.productImage}
                  />
                ) : (
                  <div className={styles.imagePlaceholder}>🏷️</div>
                )}
              </div>
              <div className={styles.productInfo}>
                <h4 className={styles.productTitle}>{brand.name}</h4>
                {brand.description && (
                  <p className={styles.productCategory}>{brand.description}</p>
                )}
                {brand.website && (
                  <p className={styles.productPrice}>
                    <a href={brand.website} target="_blank" rel="noopener noreferrer">
                      🌐 Veb-sayt
                    </a>
                  </p>
                )}
                <p className={styles.productCategory}>
                  Status: {brand.is_active ? '✅ Faol' : '❌ Nofaol'}
                </p>
              </div>
              <div className={styles.productActions}>
                <button
                  className={styles.editButton}
                  onClick={() => handleEdit(brand)}
                  title="Tahrirlash"
                >
                  ✏️
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDelete(brand.id)}
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
              <h3>{editingBrand ? 'Brendni tahrirlash' : 'Yangi brend qo\'shish'}</h3>
              <button className={styles.closeButton} onClick={resetForm}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.productForm}>
              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Brend nomi *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Brend nomini kiriting"
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
                    placeholder="Brend tavsifini kiriting"
                    rows={3}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="logo_url">Logo URL</label>
                  <input
                    type="url"
                    id="logo_url"
                    name="logo_url"
                    value={formData.logo_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="website">Veb-sayt</label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://example.com"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleCheckboxChange}
                    />
                    Faol brend
                  </label>
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

export default BrandManagement;
