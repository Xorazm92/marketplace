import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ProductManagement.module.scss';
import { MdOutlineCameraAlt } from 'react-icons/md';
import { toast } from 'react-toastify';
import { RootState } from '../../store/store';
import { setProducts, addProduct, updateProduct, deleteProduct, setLoading } from '../../store/features/productSlice';
import { createAdminProduct, getAllProducts, updateAdminProduct } from '../../endpoints/product';
import { getAllCategories, getSubcategoriesByParent } from '../../endpoints/category';

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  currency_id: number;
  category_id: number;
  subcategory_id?: number;
  brand_id: number;
  user_id: number;
  negotiable: boolean;
  condition: boolean;
  phone_number: string;
  age_range: string;
  material: string;
  color: string;
  size: string;
  manufacturer: string;
  safety_info: string;
  features: string[];
  weight: number;
  dimensions: string;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  parent_id: number;
}

const ProductManagement: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  
  // Redux state
  const { products: realProducts, loading } = useSelector((state: RootState) => state.products);
  
  // Local state
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('disconnected');
  
  // Form states
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    currency_id: 1, // UZS
    category_id: 0,
    subcategory_id: undefined,
    brand_id: 1,
    user_id: 1,
    negotiable: false,
    condition: true, // true = new, false = used
    phone_number: '',
    age_range: '3-6',
    material: '',
    color: '',
    size: '',
    manufacturer: '',
    safety_info: 'Bolalar uchun xavfsiz',
    features: [],
    weight: 0,
    dimensions: JSON.stringify({ length: 20, width: 15, height: 10 }),
    stock: 0
  });
  const [images, setImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0); // Asosiy rasm indexi

  // Load products function (useCallback bilan)
  const loadProducts = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      // Load real products from API
      if (process.env.NODE_ENV === "development") console.log('Loading products from API...');
      const apiProducts = await getAllProducts();

      if (apiProducts && Array.isArray(apiProducts)) {
        dispatch(setProducts(apiProducts));
        toast.success(`${apiProducts.length} ta mahsulot yuklandi`);
      } else {
        // Fallback to empty array
        dispatch(setProducts([]));
        toast.info('Hech qanday mahsulot topilmadi');
      }

    } catch (error) {
      console.error('Error loading products:', error);
      // Fallback to empty array on error
      dispatch(setProducts([]));
      toast.error('Mahsulotlarni yuklashda xatolik');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Load products on component mount
  useEffect(() => {
    if (process.env.NODE_ENV === "development") console.log('=== ADMIN PANEL LOADING ===');
    if (process.env.NODE_ENV === "development") console.log('Current products in Redux:', realProducts);
    loadProducts();
  }, [loadProducts]);

  // Load categories from API
  const loadCategories = useCallback(async () => {
    try {
      if (process.env.NODE_ENV === "development") console.log('Loading categories from API...');
      const apiCategories = await getAllCategories();
      
      if (apiCategories && Array.isArray(apiCategories)) {
        setCategories(apiCategories);
        if (process.env.NODE_ENV === "development") console.log('Categories loaded:', apiCategories);
      } else {
        // Fallback to mock data if API fails
        const mockCategories = [
          { id: 1, name: "Kiyim-kechak", slug: "kiyim-kechak" },
          { id: 4, name: "O'yinchiqlar", slug: "oyinchoqlar" },
          { id: 7, name: "Kitoblar", slug: "kitoblar" },
          { id: 10, name: "Sport", slug: "sport" },
          { id: 11, name: "Maktab", slug: "maktab" },
          { id: 12, name: "Chaqaloq", slug: "chaqaloq" }
        ];
        setCategories(mockCategories);
        if (process.env.NODE_ENV === "development") console.log('Using mock categories');
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback to mock data
      const mockCategories = [
        { id: 1, name: "Kiyim-kechak", slug: "kiyim-kechak" },
        { id: 4, name: "O'yinchiqlar", slug: "oyinchoqlar" },
        { id: 7, name: "Kitoblar", slug: "kitoblar" },
        { id: 10, name: "Sport", slug: "sport" },
        { id: 11, name: "Maktab", slug: "maktab" },
        { id: 12, name: "Chaqaloq", slug: "chaqaloq" }
      ];
      setCategories(mockCategories);
      toast.error('Kategoriyalarni yuklashda xatolik, mock data ishlatilmoqda');
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Load subcategories for selected category
  const loadSubcategories = useCallback(async (categoryId: number) => {
    try {
      if (process.env.NODE_ENV === "development") console.log('Loading subcategories for category:', categoryId);
      const apiSubcategories = await getSubcategoriesByParent(categoryId);
      
      if (apiSubcategories && Array.isArray(apiSubcategories)) {
        setSubcategories(apiSubcategories);
        if (process.env.NODE_ENV === "development") console.log('Subcategories loaded:', apiSubcategories);
      } else {
        // Fallback to mock data based on category
        const mockSubcategories = getMockSubcategories(categoryId);
        setSubcategories(mockSubcategories);
        if (process.env.NODE_ENV === "development") console.log('Using mock subcategories for category:', categoryId);
      }
    } catch (error) {
      console.error('Error loading subcategories:', error);
      // Fallback to mock data
      const mockSubcategories = getMockSubcategories(categoryId);
      setSubcategories(mockSubcategories);
    }
  }, []);

  // Mock subcategories helper function
  const getMockSubcategories = (categoryId: number) => {
    const mockData: { [key: number]: any[] } = {
      1: [ // Kiyim-kechak
        { id: 2, name: "Ichki kiyim", slug: "ichki-kiyim", parent_id: 1 },
        { id: 3, name: "Tashqi kiyim", slug: "tashqi-kiyim", parent_id: 1 }
      ],
      4: [ // O'yinchiqlar
        { id: 5, name: "Konstruktor", slug: "konstruktor", parent_id: 4 },
        { id: 6, name: "Yumshoq o'yinchiqlar", slug: "yumshoq-oyinchoqlar", parent_id: 4 }
      ],
      7: [ // Kitoblar
        { id: 8, name: "Ta'lim kitoblari", slug: "talim-kitoblari", parent_id: 7 },
        { id: 9, name: "Ertaklar", slug: "ertaklar", parent_id: 7 }
      ]
    };
    return mockData[categoryId] || [];
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' 
        ? parseFloat(value) || 0
        : type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : value
    }));

    // Kategoriya o'zgarganida subcategory ni reset qilish va yangi subcategory yuklash
    if (name === 'category_id') {
      setFormData(prev => ({
        ...prev,
        subcategory_id: undefined
      }));
      
      // Yangi kategoriya uchun subcategory yuklash
      const categoryId = parseInt(value);
      if (categoryId > 0) {
        loadSubcategories(categoryId);
      } else {
        setSubcategories([]);
      }
    }
  };

  // Handle features array input
  const handleFeaturesChange = (features: string[]) => {
    setFormData(prev => ({
      ...prev,
      features
    }));
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
      // Agar birinchi rasm bo'lsa, uni asosiy qilib qo'yamiz
      if (images.length === 0) {
        setMainImageIndex(0);
      }
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    // Agar asosiy rasm o'chirilsa, birinchi rasmni asosiy qilamiz
    if (index === mainImageIndex) {
      setMainImageIndex(0);
    } else if (index < mainImageIndex) {
      setMainImageIndex(prev => prev - 1);
    }
  };

  // Asosiy rasm tanlash
  const setMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle edit product
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price || 0,
      currency_id: product.currency_id || 1,
      category_id: product.category_id || 0,
      subcategory_id: product.subcategory_id,
      brand_id: product.brand_id || 1,
      user_id: product.user_id || 1,
      negotiable: product.negotiable || false,
      condition: product.condition !== undefined ? product.condition : true,
      phone_number: product.phone_number || '',
      age_range: product.age_range || '3-6',
      material: product.material || '',
      color: product.color || '',
      size: product.size || '',
      manufacturer: product.manufacturer || '',
      safety_info: product.safety_info || 'Bolalar uchun xavfsiz',
      features: product.features || [],
      weight: product.weight || 0,
      dimensions: product.dimensions || JSON.stringify({ length: 20, width: 15, height: 10 }),
      stock: product.stock || 0
    });
    setImages([]);
    setMainImageIndex(0);
    setShowAddForm(true);
  };

  // Handle delete product
  const handleDeleteProduct = (productId: number) => {
    if (window.confirm('Bu mahsulotni o\'chirishni xohlaysizmi?')) {
      dispatch(deleteProduct(productId));
      toast.success('Mahsulot o\'chirildi');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced validation
    if (!formData.title.trim()) {
      toast.error('Mahsulot nomini kiriting');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Mahsulot tavsifini kiriting');
      return;
    }

    if (!formData.price || formData.price <= 0) {
      toast.error('To\'g\'ri narx kiriting');
      return;
    }

    if (!formData.category_id || formData.category_id === 0) {
      toast.error('Kategoriya tanlang');
      return;
    }

    if (!formData.phone_number.trim()) {
      toast.error('Telefon raqamini kiriting');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+998[0-9]{9}$/;
    if (!phoneRegex.test(formData.phone_number)) {
      toast.error('Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak');
      return;
    }

    // Validate images
    if (images.length === 0) {
      toast.error('Kamida bitta rasm yuklash majburiy');
      return;
    }

    try {
      dispatch(setLoading(true));

      // Prepare data for API with all required fields (backend DTO ga mos)
      const productData: any = {
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        currency_id: Number(formData.currency_id),
        category_id: Number(formData.category_id),
        brand_id: Number(formData.brand_id),
        user_id: Number(formData.user_id),
        negotiable: Boolean(formData.negotiable),
        condition: formData.condition ? 'new' : 'used',
        phone_number: formData.phone_number
      };

      // Optional maydonlarni faqat qiymat bor bo'lsa qo'shamiz
      if (formData.subcategory_id && formData.subcategory_id > 0) {
        productData.subcategory_id = Number(formData.subcategory_id);
      }
      
      if (formData.age_range) {
        productData.age_range = formData.age_range;
      }
      
      if (formData.material && formData.material.trim()) {
        productData.material = formData.material.trim();
      }
      
      if (formData.color && formData.color.trim()) {
        productData.color = formData.color.trim();
      }
      
      if (formData.size && formData.size.trim()) {
        productData.size = formData.size.trim();
      }
      
      if (formData.manufacturer && formData.manufacturer.trim()) {
        productData.manufacturer = formData.manufacturer.trim();
      }
      
      if (formData.safety_info && formData.safety_info.trim()) {
        productData.safety_info = formData.safety_info.trim();
      }
      
      if (formData.features && formData.features.length > 0) {
        productData.features = formData.features.filter(f => f.trim());
      }
      
      if (formData.weight && formData.weight > 0) {
        productData.weight = Number(formData.weight);
      }
      
      if (formData.dimensions) {
        productData.dimensions = formData.dimensions;
      }

      if (process.env.NODE_ENV === "development") {
        console.log('=== FORM SUBMISSION ===');
        console.log('Form data:', formData);
        console.log('Product data for API:', productData);
        console.log('Images:', images);
        console.log('Main image index:', mainImageIndex);
      }

      if (editingProduct) {
        // Update existing product
        try {
          const updateResponse = await updateAdminProduct(editingProduct.id, productData, images, mainImageIndex);
          
          if (updateResponse && (updateResponse.data || updateResponse.product)) {
            const updatedProduct = updateResponse.data || updateResponse.product;
            if (process.env.NODE_ENV === "development") console.log('Product updated successfully:', updatedProduct);

            toast.success('Mahsulot muvaffaqiyatli yangilandi!');
            
            // Update Redux store
            dispatch(updateProduct(updatedProduct));
            
            // Reload products from API to get fresh data
            await loadProducts();
          } else {
            throw new Error('API javob bo\'sh yoki noto\'g\'ri');
          }
        } catch (error: any) {
          console.error('Error updating product:', error);
          if (error.response && error.response.data && error.response.data.message) {
            toast.error('Yangilashda xato: ' + error.response.data.message);
          } else {
            toast.error('Mahsulotni yangilashda xatolik yuz berdi');
          }
          throw error;
        }
      } else {
        // Create new product via API
        const apiResponse = await createAdminProduct(productData, images, mainImageIndex);

        if (apiResponse && (apiResponse.data || apiResponse.product)) {
          const product = apiResponse.data || apiResponse.product;
          if (process.env.NODE_ENV === "development") console.log('Product created successfully:', product);

          toast.success('Mahsulot muvaffaqiyatli yaratildi!');
          
          // Reload products from API to get fresh data
          await loadProducts();
        } else {
          throw new Error('API javob bo\'sh yoki noto\'g\'ri');
        }
      }
      
      resetForm();

    } catch (error: any) {
      console.error('Error saving product:', error);
      // Show backend error message if available
      if (error.response && error.response.data && error.response.data.message) {
        toast.error('API xato: ' + error.response.data.message);
      } else {
        toast.error('Mahsulot saqlashda xatolik yuz berdi: ' + (error as Error).message);
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      currency_id: 1,
      category_id: 0,
      subcategory_id: undefined,
      brand_id: 1,
      user_id: 1,
      negotiable: false,
      condition: true,
      phone_number: '',
      age_range: '3-6',
      material: '',
      color: '',
      size: '',
      manufacturer: '',
      safety_info: 'Bolalar uchun xavfsiz',
      features: [],
      weight: 0,
      dimensions: JSON.stringify({ length: 20, width: 15, height: 10 }),
      stock: 0
    });
    setImages([]);
    setMainImageIndex(0);
    setShowAddForm(false);
    setEditingProduct(null);
  };

  return (
    <div className={styles.productManagement}>
      <div className={styles.header}>
        <div>
          <h2>Mahsulot boshqaruvi</h2>
          <div className={styles.apiStatus}>
            <span className={`${styles.statusIndicator} ${styles[apiStatus]}`}>
              {apiStatus === 'checking' && '🔄 API tekshirilmoqda...'}
              {apiStatus === 'connected' && '✅ Database ulangan'}
              {apiStatus === 'disconnected' && '❌ Database ulanmagan (Mock data)'}
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            className={styles.testButton}
            onClick={async () => {
              // Test mahsulot qo'shish via API
              try {
                const testProductData = {
                  title: "Test Mahsulot " + Math.floor(Math.random() * 1000),
                  description: "Bu test uchun yaratilgan mahsulot",
                  price: Math.floor(Math.random() * 100000) + 10000,
                  currency_id: 1,
                  category_id: 4, // O'yinchiqlar (backend ID)
                  brand_id: 1,
                  user_id: 1,
                  negotiable: true,
                  condition: true,
                  phone_number: "+998901234567",
                  age_range: "3-12",
                  material: "Plastik",
                  color: "Ko'p rangli",
                  size: "O'rta",
                  manufacturer: "Test Brand",
                  safety_info: "Bolalar uchun xavfsiz",
                  features: [],
                  weight: 0.5,
                  dimensions: JSON.stringify({length: 20, width: 15, height: 10})
                };

                // Test uchun dummy rasm yaratamiz
                const canvas = document.createElement('canvas');
                canvas.width = 200;
                canvas.height = 200;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#3498db';
                  ctx.fillRect(0, 0, 200, 200);
                  ctx.fillStyle = 'white';
                  ctx.font = '20px Arial';
                  ctx.textAlign = 'center';
                  ctx.fillText('TEST', 100, 100);
                  ctx.fillText('RASM', 100, 130);
                }
                
                // Canvas ni File ga aylantirish
                const testImages: File[] = await new Promise((resolve) => {
                  canvas.toBlob((blob) => {
                    if (blob) {
                      const file = new File([blob], 'test-image.png', { type: 'image/png' });
                      resolve([file]);
                    } else {
                      resolve([]);
                    }
                  }, 'image/png');
                });

                const apiResponse = await createAdminProduct(testProductData, testImages);

                if (apiResponse) {
                  toast.success('Test mahsulot API orqali qo\'shildi!');
                  loadProducts(); // Reload products
                }
              } catch (error) {
                console.error('Test product creation error:', error);
                toast.error('Test mahsulot yaratishda xatolik');
              }
            }}
          >
            🧪 Test mahsulot
          </button>
          <button
            className={styles.addButton}
            onClick={() => setShowAddForm(true)}
          >
            + Yangi mahsulot qo'shish
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Mahsulotlarni qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.loadingIcon}>⏳</div>
          <h3>Mahsulotlar yuklanmoqda...</h3>
          <p>Iltimos, kuting...</p>
        </div>
      )}

      {/* Real Products */}
      {realProducts.length > 0 && (
        <div className={styles.realProductsSection}>
          <h3 className={styles.sectionTitle}>Mahsulotlar ({realProducts.length})</h3>
          <div className={styles.realProductsGrid}>
            {realProducts.map((product) => (
              <div key={product?.id || Math.random()} className={styles.realProductCard}>
                <div className={styles.productImageContainer}>
                  {product?.product_image?.[0]?.url ? (
                    <img
                      src={product.product_image[0].url}
                      alt={product.title}
                      className={styles.productImage}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>📦</div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <h4 className={styles.productTitle}>{product?.title || 'Mahsulot'}</h4>
                  <p className={styles.productPrice}>{product?.price?.toLocaleString() || '0'} so'm</p>
                  <p className={styles.productCategory}>
                    Kategoriya: {
                      typeof product?.category === 'object'
                        ? ((product.category as any)?.name || (product.category as any)?.title || 'Noma\'lum')
                        : (product?.category || 'Noma\'lum')
                    }
                  </p>
                  <p className={styles.productDate}>
                    {product?.createdAt ? new Date(product.createdAt).toLocaleDateString('uz-UZ') : 'Noma\'lum'}
                  </p>

                  <div className={styles.productActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditProduct(product)}
                      title="Tahrirlash"
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteProduct(product?.id)}
                      title="O'chirish"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h3>{editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}</h3>
              <button
                className={styles.closeButton}
                onClick={resetForm}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.productForm}>
              {/* Basic Information Section */}
              <div className={styles.formSection}>
                <h4>Asosiy ma'lumotlar</h4>

                <div className={styles.formGroup}>
                  <label htmlFor="title">Mahsulot nomi *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Mahsulot nomini kiriting"
                    required
                    minLength={3}
                    maxLength={100}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Tavsif *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mahsulot tavsifini kiriting"
                    required
                    minLength={10}
                    rows={4}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="price">Narx (so'm) *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="1"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="stock">Zaxira miqdori</label>
                    <input
                      type="number"
                      id="stock"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Product Details Section */}
              <div className={styles.formSection}>
                <h4>Mahsulot tafsilotlari</h4>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="category_id">Kategoriya *</label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Kategoriyani tanlang</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="subcategory_id">Subkategoriya</label>
                    <select
                      id="subcategory_id"
                      name="subcategory_id"
                      value={formData.subcategory_id || ''}
                      onChange={handleInputChange}
                      disabled={!formData.category_id}
                    >
                      <option value="">Subkategoriya tanlang</option>
                      {subcategories
                        .filter(sub => sub.parent_id === formData.category_id)
                        .map(sub => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="age_range">Yosh oralig'i</label>
                    <select
                      id="age_range"
                      name="age_range"
                      value={formData.age_range}
                      onChange={handleInputChange}
                    >
                      <option value="0-1">0-1 yosh</option>
                      <option value="1-3">1-3 yosh</option>
                      <option value="3-6">3-6 yosh</option>
                      <option value="6-9">6-9 yosh</option>
                      <option value="9-12">9-12 yosh</option>
                      <option value="12+">12+ yosh</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="condition">Holati</label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition ? 'true' : 'false'}
                      onChange={(e) => setFormData({...formData, condition: e.target.value === 'true'})}
                    >
                      <option value="true">Yangi</option>
                      <option value="false">Ishlatilgan</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="condition">Holati</label>
                    <select
                      id="condition"
                      name="condition"
                      value={formData.condition ? 'true' : 'false'}
                      onChange={(e) => setFormData({...formData, condition: e.target.value === 'true'})}
                    >
                      <option value="true">Yangi</option>
                      <option value="false">Ishlatilgan</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="material">Materiali</label>
                    <input
                      type="text"
                      id="material"
                      name="material"
                      value={formData.material}
                      onChange={handleInputChange}
                      placeholder="Masalan: Plastik, Yog'och, Metall"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="color">Rangi</label>
                    <input
                      type="text"
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="Masalan: Qizil, Ko'k, Ko'p rangli"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="size">O'lchami</label>
                    <input
                      type="text"
                      id="size"
                      name="size"
                      value={formData.size}
                      onChange={handleInputChange}
                      placeholder="Masalan: Katta, O'rta, Kichik"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="weight">Og'irligi (kg)</label>
                    <input
                      type="number"
                      id="weight"
                      name="weight"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="0.5"
                      min="0"
                      step="0.1"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="manufacturer">Ishlab chiqaruvchi</label>
                    <input
                      type="text"
                      id="manufacturer"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleInputChange}
                      placeholder="Kompaniya nomi"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="safety_info">Xavfsizlik ma'lumotlari</label>
                  <textarea
                    id="safety_info"
                    name="safety_info"
                    value={formData.safety_info}
                    onChange={handleInputChange}
                    placeholder="Xavfsizlik haqida ma'lumot"
                    rows={2}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className={styles.formSection}>
                <h4>Bog'lanish ma'lumotlari</h4>
                
                <div className={styles.formGroup}>
                  <label htmlFor="phone_number">Telefon raqami *</label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    required
                    pattern="^\+998[0-9]{9}$"
                    placeholder="+998901234567"
                  />
                  <small>Format: +998XXXXXXXXX</small>
                </div>

                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      name="negotiable"
                      checked={formData.negotiable}
                      onChange={(e) => setFormData({...formData, negotiable: e.target.checked})}
                    />
                    Narx kelishiladi
                  </label>
                </div>
              </div>

              <div className={styles.formSection}>
                <h4>Rasmlar</h4>
                <div className={styles.imageUploadSection}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                  />

                  <div className={styles.imageGrid}>
                    {images.map((image, index) => (
                      <div 
                        key={index} 
                        className={`${styles.imagePreview} ${index === mainImageIndex ? styles.mainImage : ''}`}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                        />
                        
                        {/* Asosiy rasm belgisi */}
                        {index === mainImageIndex && (
                          <div className={styles.mainImageBadge}>
                            ⭐ Asosiy
                          </div>
                        )}
                        
                        {/* Asosiy rasm qilish tugmasi */}
                        {index !== mainImageIndex && (
                          <button
                            type="button"
                            className={styles.setMainImageButton}
                            onClick={() => setMainImage(index)}
                            title="Asosiy rasm qilish"
                          >
                            ⭐
                          </button>
                        )}
                        
                        <button
                          type="button"
                          className={styles.removeImageButton}
                          onClick={() => removeImage(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      className={styles.addImageButton}
                      onClick={triggerFileInput}
                    >
                      <MdOutlineCameraAlt size={24} />
                      <span>Rasm qo'shish</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={resetForm}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  {editingProduct ? 'Yangilash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {realProducts.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>Hech qanday mahsulot topilmadi</h3>
          <p>Birinchi mahsulotni qo'shing!</p>
          <button
            className={styles.addFirstProductButton}
            onClick={() => setShowAddForm(true)}
          >
            + Birinchi mahsulotni qo'shish
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
