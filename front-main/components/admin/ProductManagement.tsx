import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ProductManagement.module.scss';
import { MdOutlineCameraAlt } from 'react-icons/md';
import { toast } from 'react-toastify';
import { RootState } from '../../store/store';
import { setProducts, addProduct, updateProduct, deleteProduct, setLoading } from '../../store/features/productSlice';
import { createAdminProduct, getAllProducts, getAllProductsForAdmin } from '../../endpoints/product';
import { getAllCategories, getCurrency, createCategory, CreateCategoryDto, updateCategory, deleteCategory } from '../../endpoints/category';
import { getBrands } from '../../endpoints/brand';
import { getColors } from '../../endpoints/colors';
import { approveProduct as approveProductApi } from '../../endpoints/admin';

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string; // will store category_id as string
  brand_id: string; // will store brand_id as string
  currency_id: string; // will store currency_id as string
  phone_number: string;
  negotiable: boolean;
  condition: boolean;
  stock: number;
  // Optional attributes aligned with backend DTO
  age_range?: string;
  material?: string;
  color?: string;
  size?: string;
  manufacturer?: string;
  safety_info?: string;
  featuresText?: string; // comma-separated list -> features: string[]
  weight?: number;
  dimensions?: string; // JSON string or free text
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface BrandItem {
  id: number;
  name: string;
}

interface CurrencyItem {
  id: number;
  name: string;
}

interface ColorItem {
  id: number;
  name: string;
  hex?: string;
}

const ProductManagement: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  
  // Redux state
  const { products: realProducts, loading } = useSelector((state: RootState) => state.products);
  
  // Local state
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyItem[]>([]);
  const [colors, setColors] = useState<ColorItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('disconnected');
  
  // Form states
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    brand_id: '',
    currency_id: '',
    phone_number: '',
    negotiable: false,
    condition: true,
    stock: 0,
    age_range: '',
    material: '',
    color: '',
    size: '',
    manufacturer: '',
    safety_info: '',
    featuresText: '',
    weight: undefined,
    dimensions: ''
  });
  const [images, setImages] = useState<File[]>([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0);
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([]);

  // Category create form state
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    slug: string;
    description?: string;
    image_url?: string;
    parent_id?: string;
    is_active: boolean;
    sort_order?: string;
  }>({
    name: '',
    slug: '',
    description: '',
    image_url: '',
    parent_id: '',
    is_active: true,
    sort_order: ''
  });

  // Load products function (useCallback bilan)
  const loadProducts = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      // Load real products from API (admin version - includes pending)
      console.log('Loading admin products from API...');
      const apiProducts = await getAllProductsForAdmin();

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
    console.log('=== ADMIN PANEL LOADING ===');
    console.log('Current products in Redux:', realProducts);
    loadProducts();
  }, [loadProducts]);

  // Load categories from API
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllCategories();
        // Backend may return array or wrapped object; normalize
        const list = Array.isArray(res) ? res : (res?.data || res?.categories || []);
        const normalized: Category[] = list.map((c: any) => ({
          id: c.id,
          name: c.name || c.title,
          slug: c.slug,
        }));
        setCategories(normalized);
        // Load brands
        const brandRes = await getBrands();
        const brandList: BrandItem[] = (Array.isArray(brandRes) ? brandRes : (brandRes?.data || brandRes?.brands || []))
          .map((b: any) => ({ id: b.id, name: b.name }));
        setBrands(brandList);
        // Load currencies
        const currencyRes = await getCurrency();
        const currencyList: CurrencyItem[] = (Array.isArray(currencyRes) ? currencyRes : (currencyRes?.data || currencyRes?.currencies || []))
          .map((c: any) => ({ id: c.id, name: c.name }));
        setCurrencies(currencyList);
        // Load colors
        const colorsRes = await getColors();
        const colorList: ColorItem[] = (Array.isArray(colorsRes) ? colorsRes : (colorsRes?.data || colorsRes?.colors || []))
          .map((c: any) => ({ id: c.id, name: c.name, hex: c.hex }));
        setColors(colorList);
      } catch (e) {
        // keep empty list; UI will still work
      }
    })();
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'price' || name === 'originalPrice' || name === 'stock')
        ? (parseInt(value) || 0)
        : (name === 'weight'
          ? (value === '' ? undefined : Number(value))
          : value)
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => {
        const merged = [...prev, ...newImages];
        // If no primary set yet, default to first image
        if (merged.length > 0 && primaryImageIndex >= merged.length) {
          setPrimaryImageIndex(0);
        }
        return merged;
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      // Adjust primary index if needed
      if (index === primaryImageIndex) {
        setPrimaryImageIndex(0);
      } else if (index < primaryImageIndex) {
        setPrimaryImageIndex(Math.max(0, primaryImageIndex - 1));
      }
      return next;
    });
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const setAsPrimaryImage = (index: number) => {
    setImages(prev => {
      const newArr = [...prev];
      const [img] = newArr.splice(index, 1);
      newArr.unshift(img);
      return newArr;
    });
    setPrimaryImageIndex(0);
  };

  // Category create handlers
  const handleCategoryInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: checked }));
  };

  const submitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      toast.error('Kategoriya nomini kiriting');
      return;
    }
    if (!categoryForm.slug.trim()) {
      toast.error('Slug kiriting');
      return;
    }
    try {
      const dto: CreateCategoryDto = {
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim(),
        description: categoryForm.description?.trim() || undefined,
        image_url: categoryForm.image_url?.trim() || undefined,
        parent_id: categoryForm.parent_id ? Number(categoryForm.parent_id) : undefined,
        is_active: !!categoryForm.is_active,
        sort_order: categoryForm.sort_order ? Number(categoryForm.sort_order) : undefined,
      };
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, dto);
        toast.success('Kategoriya yangilandi');
      } else {
        await createCategory(dto);
        toast.success('Kategoriya yaratildi');
      }
      // refresh categories
      const res = await getAllCategories();
      const list = Array.isArray(res) ? res : (res?.data || res?.categories || []);
      const normalized: Category[] = list.map((c: any) => ({ id: c.id, name: c.name || c.title, slug: c.slug }));
      setCategories(normalized);
      setShowCategoryModal(false);
      setCategoryForm({ name: '', slug: '', description: '', image_url: '', parent_id: '', is_active: true, sort_order: '' });
      setEditingCategoryId(null);
    } catch (err) {
      // toast already shown in endpoint
    }
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      description: '',
      image_url: '',
      parent_id: '',
      is_active: true,
      sort_order: ''
    });
    setShowCategoryModal(true);
  };

  const confirmDeleteCategory = async (id: number) => {
    if (!window.confirm('Kategoriyani o\'chirishni xohlaysizmi?')) return;
    try {
      await deleteCategory(id);
      toast.success('Kategoriya o\'chirildi');
      const res = await getAllCategories();
      const list = Array.isArray(res) ? res : (res?.data || res?.categories || []);
      const normalized: Category[] = list.map((c: any) => ({ id: c.id, name: c.name || c.title, slug: c.slug }));
      setCategories(normalized);
    } catch (e) {}
  };

  // Handle edit product
  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setFormData({
      title: product.title || '',
      description: product.description || '',
      price: product.price || 0,
      originalPrice: product.originalPrice || 0,
      category: product.category?.id?.toString?.() || '',
      brand_id: (product.brand?.id?.toString?.() || ''),
      currency_id: (product.currency?.id?.toString?.() || ''),
      phone_number: product.phone_number || '',
      negotiable: !!product.negotiable,
      condition: !!product.condition,
      stock: product.stock || 0
    });
    setImages([]);
    setPrimaryImageIndex(0);
    // Prefill selected colors if available
    try {
      const pColors = (product as any)?.product_colors || [];
      const ids = pColors.map((pc: any) => pc.color_id || pc.color?.id).filter(Boolean).map((n: number) => String(n));
      setSelectedColorIds(ids);
    } catch {}
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

    if (!formData.price || formData.price <= 0) {
      toast.error('To\'g\'ri narx kiriting');
      return;
    }

    if (!formData.category) {
      toast.error('Kategoriya tanlang');
      return;
    }
    if (!formData.brand_id) {
      toast.error('Brand tanlang');
      return;
    }
    if (!formData.currency_id) {
      toast.error('Valyuta tanlang');
      return;
    }
    if (!formData.phone_number.trim()) {
      toast.error('Telefon raqam kiriting');
      return;
    }

    try {
      dispatch(setLoading(true));

      if (editingProduct) {
        // Update existing product
        const updatedProduct = {
          ...editingProduct,
          title: formData.title,
          description: formData.description,
          price: formData.price,
          originalPrice: formData.originalPrice || formData.price,
          category: formData.category,
          stock: formData.stock,
          updatedAt: new Date().toISOString()
        };

        dispatch(updateProduct(updatedProduct));
        toast.success('Mahsulot muvaffaqiyatli yangilandi!');
      } else {
        // Create new product via API
        const selectedCategory = categories.find(cat => cat.id?.toString() === formData.category);

        // Prepare data for API with correct types mapped to backend DTO
        const productData = {
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          currency_id: Number(formData.currency_id),
          category_id: selectedCategory?.id ? Number(selectedCategory.id) : undefined,
          brand_id: Number(formData.brand_id),
          user_id: 1,
          negotiable: !!formData.negotiable,
          condition: !!formData.condition,
          phone_number: formData.phone_number,
          // Optional rich attributes
          age_range: formData.age_range || undefined,
          material: formData.material || undefined,
          color: formData.color || undefined,
          size: formData.size || undefined,
          manufacturer: formData.manufacturer || undefined,
          safety_info: formData.safety_info || undefined,
          features: (formData.featuresText || '')
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
          weight: typeof formData.weight === 'number' ? formData.weight : undefined,
          dimensions: formData.dimensions || undefined,
          product_color_ids: selectedColorIds.map((id) => Number(id)),
        } as any;

        console.log('Sending product data to API:', productData);
        console.log('Images:', images);

        // Call API to create product (temporarily without images for testing)
        console.log('Calling API with data:', productData);
        const apiResponse = await createAdminProduct(productData, images);

        // Check for successful response
        if (apiResponse && (apiResponse.success || apiResponse.product || apiResponse.id)) {
          console.log('Product created successfully:', apiResponse);

          // Don't add to Redux store manually, just reload from API
          toast.success('Mahsulot muvaffaqiyatli yaratildi!');

          // Try to auto-approve so it appears in public listings
          try {
            const newId = apiResponse.product?.id || apiResponse.id;
            if (newId) {
              await approveProductApi(Number(newId));
              toast.success('Mahsulot tasdiqlandi');
            }
          } catch (err) {
            console.warn('Approve failed or not required', err);
          }

          // Reload products from API to get fresh data
          await loadProducts();
        } else {
          console.log('API Response:', apiResponse);
          throw new Error('API response is empty or invalid');
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
      originalPrice: 0,
      category: '',
      brand_id: '',
      currency_id: '',
      phone_number: '',
      negotiable: false,
      condition: true,
      stock: 0,
      age_range: '',
      material: '',
      color: '',
      size: '',
      manufacturer: '',
      safety_info: '',
      featuresText: '',
      weight: undefined,
      dimensions: ''
    });
    setImages([]);
    setPrimaryImageIndex(0);
    setSelectedColorIds([]);
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
                  category_id: 2, // O'yinchiqlar
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

                const apiResponse = await createAdminProduct(testProductData, []);

                if (apiResponse) {
                  const newProduct = {
                    ...apiResponse.product,
                    originalPrice: testProductData.price + 10000,
                    category: "O'yinchiqlar",
                    brand: "Test Brand",
                    stock: Math.floor(Math.random() * 50) + 1
                  };

                  dispatch(addProduct(newProduct));
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
            onClick={() => setShowCategoryModal(true)}
          >
            + Kategoriya yaratish
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

      {/* Create Category Modal */}
      {showCategoryModal && (
        <div className={styles.formOverlay}>
          <div className={styles.formContainer}>
            <div className={styles.formHeader}>
              <h3>Yangi kategoriya yaratish</h3>
              <button className={styles.closeButton} onClick={() => setShowCategoryModal(false)}>✕</button>
            </div>
            <form onSubmit={submitCategory} className={styles.productForm}>
              <div className={styles.formSection}>
                <div className={styles.formGroup}>
                  <label htmlFor="cat_name">Nom *</label>
                  <input id="cat_name" name="name" value={categoryForm.name} onChange={handleCategoryInput} required />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="cat_slug">Slug *</label>
                  <input id="cat_slug" name="slug" value={categoryForm.slug} onChange={handleCategoryInput} required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="cat_desc">Tavsif</label>
                  <textarea id="cat_desc" name="description" value={categoryForm.description} onChange={handleCategoryInput} />
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="cat_image">Rasm URL</label>
                    <input id="cat_image" name="image_url" value={categoryForm.image_url} onChange={handleCategoryInput} />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="cat_parent">Ota kategoriya</label>
                    <select id="cat_parent" name="parent_id" value={categoryForm.parent_id} onChange={handleCategoryInput}>
                      <option value="">—</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>
                      <input type="checkbox" name="is_active" checked={categoryForm.is_active} onChange={handleCategoryCheckbox} />
                      Faol (is_active)
                    </label>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="sort_order">Tartib (sort_order)</label>
                    <input id="sort_order" name="sort_order" type="number" value={categoryForm.sort_order} onChange={handleCategoryInput} />
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelButton} onClick={() => setShowCategoryModal(false)}>Bekor qilish</button>
                <button type="submit" className={styles.submitButton}>Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Management */}
      <div className={styles.realProductsSection}>
        <h3 className={styles.sectionTitle}>Kategoriyalar ({categories.length})</h3>
        <div className={styles.realProductsGrid}>
          {categories.map((cat) => (
            <div key={cat.id} className={styles.realProductCard}>
              <div className={styles.productInfo}>
                <h4 className={styles.productTitle}>{cat.name}</h4>
                <p className={styles.productCategory}>Slug: {cat.slug}</p>
              </div>
              <div className={styles.productActions}>
                <button className={styles.editButton} onClick={() => startEditCategory(cat)} title="Tahrirlash">✏️</button>
                <button className={styles.deleteButton} onClick={() => confirmDeleteCategory(cat.id)} title="O'chirish">🗑️</button>
              </div>
            </div>
          ))}
        </div>
      </div>

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
                      src={
                        product.product_image[0].url.startsWith('http')
                          ? product.product_image[0].url
                          : `${process.env.NEXT_PUBLIC_API_URL}${product.product_image[0].url}`
                      }
                      alt={product.title}
                      className={styles.productImage}
                    />
                  ) : (product as any)?.images?.[0] ? (
                    <img
                      src={
                        ((product as any).images[0] as string).startsWith('http')
                          ? (product as any).images[0]
                          : `${process.env.NEXT_PUBLIC_API_URL}${(product as any).images[0].startsWith('/') ? (product as any).images[0] : `/${(product as any).images[0]}`}`
                      }
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
                </div>
                <div className={styles.productActions}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEditProduct(product)}
                    title="Tahrirlash"
                  >
                    ✏️
                  </button>
                  {/* Approve button only when product is in PENDING status */}
                  {(((product as any)?.is_checked === 'PENDING') || ((product as any)?.status === 'PENDING')) && (
                    <button
                      className={styles.editButton}
                      onClick={async () => {
                        try {
                          await approveProductApi(Number((product as any).id));
                          toast.success('Mahsulot tasdiqlandi');
                          await loadProducts();
                        } catch (e) {
                          toast.error('Tasdiqlashda xatolik');
                        }
                      }}
                      title="Tasdiqlash"
                    >
                      ✅
                    </button>
                  )}
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteProduct(product?.id)}
                    title="O'chirish"
                  >
                    🗑️
                  </button>
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
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="description">Tavsif</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Mahsulot tavsifini kiriting"
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
                      min="0"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="originalPrice">Asl narx (so'm)</label>
                    <input
                      type="number"
                      id="originalPrice"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="category">Kategoriya</label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option value="">Kategoriya tanlang</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="brand_id">Brand</label>
                    <select
                      id="brand_id"
                      name="brand_id"
                      value={formData.brand_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Brand tanlang</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>{brand.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label htmlFor="currency_id">Valyuta</label>
                    <select
                      id="currency_id"
                      name="currency_id"
                      value={formData.currency_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Valyuta tanlang</option>
                      {currencies.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="phone_number">Telefon raqam</label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      placeholder="+998 90 123 45 67"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>
                      <input
                        type="checkbox"
                        name="negotiable"
                        checked={formData.negotiable}
                        onChange={handleCheckboxChange}
                      /> Narx kelishiladi (negotiable)
                    </label>
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      <input
                        type="checkbox"
                        name="condition"
                        checked={formData.condition}
                        onChange={handleCheckboxChange}
                      /> Holati: yangi (true)
                    </label>
                  </div>
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
                      <div key={index} className={styles.imagePreview}>
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                        />
                        <div className={styles.imageActionsRow}>
                          <button
                            type="button"
                            className={styles.setPrimaryButton}
                            onClick={() => setAsPrimaryImage(index)}
                            title="Asosiy rasm qilib tanlash"
                          >
                            {index === 0 ? '⭐ Asosiy' : 'Asosiy qil'}
                          </button>
                          <button
                            type="button"
                            className={styles.removeImageButton}
                            onClick={() => removeImage(index)}
                          >
                            ✕
                          </button>
                        </div>
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

              <div className={styles.formSection}>
                <h4>Ranglar</h4>
                <div className={styles.formGroup}>
                  <label>Mahsulot ranglari (bir nechta tanlash mumkin)</label>
                  <div className={styles.tagsContainer}>
                    {colors.map((c) => (
                      <label key={c.id} className={styles.tagItem} title={c.name}>
                        <input
                          type="checkbox"
                          value={String(c.id)}
                          checked={selectedColorIds.includes(String(c.id))}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedColorIds((prev) => (
                              e.target.checked ? Array.from(new Set([...prev, val])) : prev.filter((x) => x !== val)
                            ));
                          }}
                        />
                        <span className={styles.colorSwatch} style={{ backgroundColor: c.hex || '#ccc' }} />
                        <span>{c.name}</span>
                      </label>
                    ))}
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
