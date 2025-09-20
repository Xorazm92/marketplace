'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaImage } from 'react-icons/fa';
import styles from './BrandManagement.module.scss';

interface Brand {
  id: number;
  name: string;
  logo?: string;
  description?: string;
  website?: string;
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

interface BrandFormData {
  name: string;
  logo: string;
  description: string;
  website: string;
  is_active: boolean;
}

const BrandManagement: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    logo: '',
    description: '',
    website: '',
    is_active: true
  });

  // Load brands
  const loadBrands = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/v1/brand');
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      } else {
        toast.error('Brendlarni yuklashda xatolik');
      }
    } catch (error) {
      console.error('Error loading brands:', error);
      toast.error('Brendlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked
        : value
    }));
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Brend nomi majburiy!');
      return;
    }

    setLoading(true);

    try {
      const url = editingBrand 
        ? `http://localhost:4000/api/v1/brand/${editingBrand.id}`
        : 'http://localhost:4000/api/v1/brand';
      
      const method = editingBrand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(editingBrand ? 'Brend yangilandi!' : 'Brend yaratildi!');
        resetForm();
        loadBrands();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Xatolik yuz berdi');
      }
    } catch (error) {
      console.error('Error saving brand:', error);
      toast.error('Brendni saqlashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Delete brand
  const handleDelete = async (id: number) => {
    if (!confirm('Bu brendni o\'chirishni xohlaysizmi?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/brand/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        toast.success('Brend o\'chirildi!');
        loadBrands();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Brendni o\'chirishda xatolik');
      }
    } catch (error) {
      console.error('Error deleting brand:', error);
      toast.error('Brendni o\'chirishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const toggleActive = async (brand: Brand) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/brand/${brand.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...brand,
          is_active: !brand.is_active
        })
      });

      if (response.ok) {
        toast.success(`Brend ${!brand.is_active ? 'faollashtirildi' : 'o\'chirildi'}!`);
        loadBrands();
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

  // Edit brand
  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo: brand.logo || '',
      description: brand.description || '',
      website: brand.website || '',
      is_active: brand.is_active
    });
    setShowAddForm(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      description: '',
      website: '',
      is_active: true
    });
    setEditingBrand(null);
    setShowAddForm(false);
  };

  return (
    <div className={styles.brandManagement}>
      <div className={styles.header}>
        <div>
          <h2>Brend boshqaruvi</h2>
          <p className={styles.subtitle}>
            Jami {brands.length} ta brend
          </p>
        </div>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
          disabled={loading}
        >
          <FaPlus /> Yangi brend
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formModal}>
            <div className={styles.formHeader}>
              <h3>{editingBrand ? 'Brendni tahrirlash' : 'Yangi brend'}</h3>
              <button onClick={resetForm} className={styles.closeButton}>×</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Brend nomi *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Brend nomini kiriting"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="logo">Logo URL</label>
                <input
                  type="url"
                  id="logo"
                  name="logo"
                  value={formData.logo}
                  onChange={handleInputChange}
                  placeholder="https://example.com/logo.png"
                />
                {formData.logo && (
                  <div className={styles.logoPreview}>
                    <img src={formData.logo} alt="Logo preview" />
                  </div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="website">Veb-sayt</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://brendwebsayti.com"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Tavsif</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brend haqida qisqacha ma'lumot"
                  rows={4}
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

              <div className={styles.formActions}>
                <button type="button" onClick={resetForm} className={styles.cancelButton}>
                  Bekor qilish
                </button>
                <button type="submit" disabled={loading} className={styles.submitButton}>
                  {loading ? 'Saqlanmoqda...' : editingBrand ? 'Yangilash' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Brands Grid */}
      <div className={styles.brandsGrid}>
        {loading ? (
          <div className={styles.loading}>Yuklanmoqda...</div>
        ) : brands.length === 0 ? (
          <div className={styles.empty}>
            <FaImage size={48} />
            <h3>Brendlar topilmadi</h3>
            <p>Birinchi brendni qo'shish uchun "Yangi brend" tugmasini bosing</p>
          </div>
        ) : (
          brands.map(brand => (
            <div key={brand.id} className={styles.brandCard}>
              <div className={styles.brandLogo}>
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.name} />
                ) : (
                  <div className={styles.noLogo}>
                    <FaImage />
                  </div>
                )}
              </div>

              <div className={styles.brandInfo}>
                <h3 className={styles.brandName}>{brand.name}</h3>
                {brand.description && (
                  <p className={styles.brandDescription}>{brand.description}</p>
                )}
                {brand.website && (
                  <a 
                    href={brand.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={styles.brandWebsite}
                  >
                    Veb-saytga o'tish
                  </a>
                )}
                
                <div className={styles.brandMeta}>
                  <span className={`${styles.status} ${brand.is_active ? styles.active : styles.inactive}`}>
                    {brand.is_active ? 'Faol' : 'Nofaol'}
                  </span>
                  {brand._count && (
                    <span className={styles.productCount}>
                      {brand._count.products} mahsulot
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.brandActions}>
                <button
                  onClick={() => handleEdit(brand)}
                  className={styles.editButton}
                  title="Tahrirlash"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => toggleActive(brand)}
                  className={styles.toggleButton}
                  title={brand.is_active ? 'O\'chirish' : 'Faollashtirish'}
                >
                  {brand.is_active ? <FaEyeSlash /> : <FaEye />}
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className={styles.deleteButton}
                  title="O'chirish"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrandManagement;
