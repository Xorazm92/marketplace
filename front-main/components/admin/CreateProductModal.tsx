'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FaTimes, FaUpload, FaTrash, FaImage } from 'react-icons/fa';
import { useToast } from '../common/Toast';
import { ImageUploader, UploadedImage } from '../gallery';
import styles from './CreateProductModal.module.scss';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id?: number;
  children?: Category[];
}

interface Brand {
  id: number;
  name: string;
  slug: string;
}

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  currency_id: number;
  category_id: number;
  subcategory_id?: number;
  brand_id: number;
  condition: string;
  negotiable: boolean;
  phone_number: string;
  age_range?: string;
  material?: string;
  color?: string;
  size?: string;
  weight?: number;
  manufacturer?: string;
  safety_info?: string;
  features?: string;
  dimensions?: string;
  images: File[];
}

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (product: any) => void;
}

const CreateProductModal: React.FC<CreateProductModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors, isValid }
  } = useForm<ProductFormData>({
    mode: 'onChange',
    defaultValues: {
      condition: 'yangi',
      negotiable: false,
      currency_id: 1,
      images: []
    }
  });

  const selectedCategoryId = watch('category_id');
  const selectedImages = watch('images');

  // Load categories and brands
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      loadBrands();
    }
  }, [isOpen]);

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      loadSubcategories(selectedCategoryId);
    } else {
      setSubcategories([]);
    }
  }, [selectedCategoryId]);

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/category');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      addToast({
        type: 'error',
        title: 'Xatolik',
        message: 'Kategoriyalarni yuklashda xatolik yuz berdi'
      });
    }
  };

  const loadBrands = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/brand');
      if (response.ok) {
        const data = await response.json();
        setBrands(data);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const loadSubcategories = async (parentId: number) => {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/category/subcategories/${parentId}`);
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data);
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      addToast({
        type: 'error',
        title: 'Noto\'g\'ri fayl formati',
        message: 'Faqat JPEG, PNG va WebP formatdagi rasmlar qabul qilinadi'
      });
      return;
    }

    // Validate file sizes (5MB max)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      addToast({
        type: 'error',
        title: 'Fayl hajmi katta',
        message: 'Har bir rasm 5MB dan kichik bo\'lishi kerak'
      });
      return;
    }

    // Limit total images to 5
    const currentImages = selectedImages || [];
    const totalImages = currentImages.length + files.length;
    
    if (totalImages > 5) {
      addToast({
        type: 'warning',
        title: 'Juda ko\'p rasm',
        message: 'Maksimal 5 ta rasm yuklash mumkin'
      });
      return;
    }

    // Update form data
    const newImages = [...currentImages, ...files];
    setValue('images', newImages);

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const currentImages = selectedImages || [];
    const newImages = currentImages.filter((_, i) => i !== index);
    setValue('images', newImages);

    // Clean up preview URL
    if (imagePreview[index]) {
      URL.revokeObjectURL(imagePreview[index]);
    }
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData) => {
    if (!isValid) {
      addToast({
        type: 'error',
        title: 'Form xatolari',
        message: 'Iltimos, barcha majburiy maydonlarni to\'ldiring'
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);

    try {
      const formData = new FormData();
      const data = watch();

      // Only add fields that exist in CreateProductDto
      const allowedFields = [
        'title', 'description', 'price', 'currency_id', 'category_id', 
        'brand_id', 'negotiable', 'condition', 'phone_number', 
        'subcategory_id', 'age_range', 'material', 'color', 'size', 
        'manufacturer', 'safety_info', 'features', 'weight', 'dimensions'
      ];

      // Add form fields with proper validation and type conversion
      allowedFields.forEach(key => {
        const value = (data as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          if (key === 'currency_id' || key === 'brand_id' || key === 'price' || key === 'weight') {
            // Convert to number for numeric fields
            formData.append(key, Number(value).toString());
          } else if (key === 'category_id' || key === 'subcategory_id') {
            // Convert to number for integer format
            formData.append(key, Number(value).toString());
          } else if (key === 'negotiable') {
            // Convert to boolean string
            formData.append(key, Boolean(value).toString());
          } else if (key === 'features' && Array.isArray(value)) {
            // Convert array to JSON string
            formData.append(key, JSON.stringify(value));
          } else if (key === 'dimensions' && typeof value === 'object') {
            // Convert object to JSON string
            formData.append(key, JSON.stringify(value));
          } else {
            // Everything else as string
            formData.append(key, String(value));
          }
        }
      });

      // Add user_id (demo user)
      formData.append('user_id', '1');

      // Add images
      if (data.images && data.images.length > 0) {
        data.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      // Debug: Log FormData contents
      if (process.env.NODE_ENV === 'development') {
        console.log('=== FORMDATA CONTENTS ===');
        Array.from(formData.entries()).forEach(([key, value]) => {
          console.log(`${key}:`, value);
        });
      }

      const response = await fetch('http://localhost:4000/api/v1/product/create', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        
        addToast({
          type: 'success',
          title: 'Mahsulot yaratildi!',
          message: 'Yangi mahsulot muvaffaqiyatli qo\'shildi'
        });

        // Clean up preview URLs
        imagePreview.forEach(url => URL.revokeObjectURL(url));
        setImagePreview([]);
        
        reset();
        onSuccess?.(result);
        onClose();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Server xatoligi');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      addToast({
        type: 'error',
        title: 'Xatolik yuz berdi',
        message: error instanceof Error ? error.message : 'Mahsulot yaratishda xatolik'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    
    // Clean up preview URLs
    imagePreview.forEach(url => URL.revokeObjectURL(url));
    setImagePreview([]);
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.modalOverlay} onClick={handleClose}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2>Yangi Mahsulot Qo'shish</h2>
            <button
              className={styles.closeButton}
              onClick={handleClose}
              disabled={isLoading}
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.formContent}>
              {/* Basic Information */}
              <div className={styles.section}>
                <h3>Asosiy Ma'lumotlar</h3>
                
                <div className={styles.formGroup}>
                  <label htmlFor="title">Mahsulot nomi *</label>
                  <input
                    type="text"
                    id="title"
                    {...register('title', {
                      required: 'Mahsulot nomi majburiy',
                      minLength: {
                        value: 3,
                        message: 'Kamida 3 ta belgi kiriting'
                      }
                    })}
                    className={errors.title ? styles.error : ''}
                    placeholder="Mahsulot nomini kiriting"
                  />
                  {errors.title && (
                    <span className={styles.errorMessage}>{errors.title.message}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Tavsif *</label>
                  <textarea
                    id="description"
                    rows={4}
                    {...register('description', {
                      required: 'Tavsif majburiy',
                      minLength: {
                        value: 10,
                        message: 'Kamida 10 ta belgi kiriting'
                      }
                    })}
                    className={errors.description ? styles.error : ''}
                    placeholder="Mahsulot haqida batafsil yozing"
                  />
                  {errors.description && (
                    <span className={styles.errorMessage}>{errors.description.message}</span>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="price">Narxi (so'm) *</label>
                    <input
                      type="number"
                      id="price"
                      {...register('price', {
                        required: 'Narx majburiy',
                        min: {
                          value: 1,
                          message: 'Narx 0 dan katta bo\'lishi kerak'
                        }
                      })}
                      className={errors.price ? styles.error : ''}
                      placeholder="0"
                    />
                    {errors.price && (
                      <span className={styles.errorMessage}>{errors.price.message}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="currency_id">Valyuta *</label>
                    <select
                      id="currency_id"
                      {...register('currency_id', {
                        required: 'Valyuta majburiy'
                      })}
                      className={errors.currency_id ? styles.error : ''}
                    >
                      <option value={1}>UZS - O'zbek so'mi</option>
                      <option value={2}>USD - Dollar</option>
                      <option value={3}>EUR - Evro</option>
                    </select>
                    {errors.currency_id && (
                      <span className={styles.errorMessage}>{errors.currency_id.message}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div className={styles.section}>
                <h3>Kategoriya</h3>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="category_id">Asosiy kategoriya *</label>
                    <select
                      id="category_id"
                      {...register('category_id', {
                        required: 'Kategoriya majburiy'
                      })}
                      className={errors.category_id ? styles.error : ''}
                    >
                      <option value="">Kategoriya tanlang</option>
                      {categories
                        .filter(cat => !cat.parent_id)
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                    {errors.category_id && (
                      <span className={styles.errorMessage}>{errors.category_id.message}</span>
                    )}
                  </div>

                  {subcategories.length > 0 && (
                    <div className={styles.formGroup}>
                      <label htmlFor="subcategory_id">Ichki kategoriya</label>
                      <select
                        id="subcategory_id"
                        {...register('subcategory_id')}
                      >
                        <option value="">Ichki kategoriya tanlang</option>
                        {subcategories.map(subcategory => (
                          <option key={subcategory.id} value={subcategory.id}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className={styles.formGroup}>
                    <label htmlFor="brand_id">Brend *</label>
                    <select
                      id="brand_id"
                      {...register('brand_id', {
                        required: 'Brend tanlash majburiy',
                        valueAsNumber: true
                      })}
                      className={errors.brand_id ? styles.error : ''}
                    >
                      <option value="">Brend tanlang</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    {errors.brand_id && (
                      <span className={styles.errorMessage}>{errors.brand_id.message}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="condition">Holat *</label>
                    <select
                      id="condition"
                      {...register('condition', {
                        required: 'Holat majburiy'
                      })}
                      className={errors.condition ? styles.error : ''}
                    >
                      <option value="yangi">Yangi</option>
                      <option value="ishlatilgan">Ishlatilgan</option>
                      <option value="yaxshi">Yaxshi holatda</option>
                    </select>
                    {errors.condition && (
                      <span className={styles.errorMessage}>{errors.condition.message}</span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="age_range">Yosh oralig'i</label>
                    <select id="age_range" {...register('age_range')}>
                      <option value="">Yosh oralig'ini tanlang</option>
                      <option value="0-1">0-1 yosh</option>
                      <option value="1-3">1-3 yosh</option>
                      <option value="3-6">3-6 yosh</option>
                      <option value="6-12">6-12 yosh</option>
                      <option value="12+">12+ yosh</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="phone_number">Telefon raqam *</label>
                  <input
                    type="tel"
                    id="phone_number"
                    {...register('phone_number', {
                      required: 'Telefon raqam majburiy',
                      pattern: {
                        value: /^\+998[0-9]{9}$/,
                        message: 'Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak'
                      }
                    })}
                    className={errors.phone_number ? styles.error : ''}
                    placeholder="+998901234567"
                  />
                  {errors.phone_number && (
                    <span className={styles.errorMessage}>{errors.phone_number.message}</span>
                  )}
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="material">Material</label>
                    <input
                      type="text"
                      id="material"
                      {...register('material')}
                      placeholder="Masalan: Paxta, Plastik"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="color">Rang</label>
                    <input
                      type="text"
                      id="color"
                      {...register('color')}
                      placeholder="Masalan: Qizil, Ko'k"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="weight">Og'irlik (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      id="weight"
                      {...register('weight')}
                      placeholder="0.5"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="dimensions">O'lchamlar (JSON)</label>
                    <input
                      type="text"
                      id="dimensions"
                      {...register('dimensions')}
                      placeholder='{"length":20,"width":15,"height":10}'
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="safety_info">Xavfsizlik ma'lumotlari</label>
                  <textarea
                    id="safety_info"
                    {...register('safety_info')}
                    placeholder="Bolalar uchun xavfsizlik bo'yicha ma'lumotlar"
                    rows={3}
                  />
                </div>

                <div className={styles.checkboxGroup}>
                  <label className={styles.checkboxLabel}>
                    <Controller
                      name="negotiable"
                      control={control}
                      render={({ field }) => (
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    <span>Narx kelishiladi</span>
                  </label>
                </div>
              </div>

              {/* Professional Image Upload */}
              <div className={styles.section}>
                <h3>Rasmlar</h3>
                <p className={styles.sectionDescription}>
                  Mahsulot rasmlarini yuklang. Birinchi rasm asosiy rasm bo'ladi.
                </p>
                
                <ImageUploader
                  maxFiles={10}
                  maxFileSize={5}
                  acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
                  onImagesChange={(images) => {
                    setUploadedImages(images);
                    // Convert to File array for form submission
                    const files = images.map(img => img.file);
                    setValue('images', files);
                  }}
                  enableCropping={true}
                  enableWatermark={true}
                  autoResize={true}
                  compressionQuality={0.8}
                  className={styles.imageUploader}
                />
                
                {errors.images && (
                  <span className={styles.error}>
                    {errors.images.message}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={isLoading}
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isLoading || !isValid}
              >
                {isLoading ? 'Saqlanmoqda...' : 'Mahsulot yaratish'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmDialog}>
            <h3>Tasdiqlash</h3>
            <p>Yangi mahsulotni yaratishni tasdiqlaysizmi?</p>
            <div className={styles.confirmActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setShowConfirmDialog(false)}
              >
                Yo'q
              </button>
              <button
                className={styles.confirmButton}
                onClick={confirmSubmit}
              >
                Ha, yaratish
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateProductModal;
