import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './ProductManagement.module.scss';
import { MdOutlineCameraAlt } from 'react-icons/md';
import { toast } from 'react-toastify';
import { RootState } from '../../store/store';
import { setProducts, addProduct, updateProduct, deleteProduct, setLoading } from '../../store/features/productSlice';
import { createAdminProduct, getAllProducts } from '../../endpoints/product';

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  stock: number;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

const ProductManagement: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  
  // Redux state
  const { products: realProducts, loading } = useSelector((state: RootState) => state.products);
  
  // Local state
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
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
    brand: '',
    stock: 0
  });
  const [images, setImages] = useState<File[]>([]);

  // Load products function (useCallback bilan)
  const loadProducts = useCallback(async () => {
    try {
      dispatch(setLoading(true));

      // Load real products from API
      console.log('Loading products from API...');
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
    console.log('=== ADMIN PANEL LOADING ===');
    console.log('Current products in Redux:', realProducts);
    loadProducts();
  }, [loadProducts]);

  // Load categories
  useEffect(() => {
    const mockCategories = [
      { id: 1, name: "O'yinchiqlar", slug: "oyinchiqlar" },
      { id: 2, name: "Kitoblar", slug: "kitoblar" },
      { id: 3, name: "Kiyim-kechak", slug: "kiyim-kechak" },
      { id: 4, name: "Sport anjomlar", slug: "sport-anjomlar" },
      { id: 5, name: "Maktab buyumlari", slug: "maktab-buyumlari" }
    ];
    setCategories(mockCategories);
  }, []);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' || name === 'stock' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
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
      originalPrice: product.originalPrice || 0,
      category: product.category || '',
      brand: product.brand || '',
      stock: product.stock || 0
    });
    setImages([]);
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
          brand: formData.brand || editingProduct.brand,
          stock: formData.stock,
          updatedAt: new Date().toISOString()
        };

        dispatch(updateProduct(updatedProduct));
        toast.success('Mahsulot muvaffaqiyatli yangilandi!');
      } else {
        // Create new product via API
        const selectedCategory = categories.find(cat => cat.id?.toString() === formData.category);

        // Prepare data for API with correct types
        const productData = {
          title: formData.title,
          description: formData.description,
          price: Number(formData.price), // Convert to number
          currency_id: 1, // Number, not string
          category_id: selectedCategory?.id ? Number(selectedCategory.id) : 1, // Convert to number
          brand_id: 1, // Number, not string
          user_id: 1, // Already number
          negotiable: true, // Boolean
          condition: true, // Boolean
          phone_number: "+998901234567", // String
          age_range: "3-12",
          material: "Plastik",
          color: "Ko'p rangli",
          size: "O'rta",
          manufacturer: formData.brand || "INBOLA",
          safety_info: "Bolalar uchun xavfsiz",
          features: [], // Array
          weight: 0.5, // Number, not string
          dimensions: JSON.stringify({length: 20, width: 15, height: 10}) // JSON string
        };

        console.log('Sending product data to API:', productData);
        console.log('Images:', images);

        // Call API to create product (temporarily without images for testing)
        console.log('Calling API with data:', productData);
        const apiResponse = await createAdminProduct(productData, []);

        if (apiResponse && apiResponse.product) {
          console.log('Product created successfully:', apiResponse);

          // Don't add to Redux store manually, just reload from API
          toast.success('Mahsulot database ga muvaffaqiyatli qo\'shildi!');

          // Reload products from API to get fresh data
          await loadProducts();
        } else {
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
      brand: '',
      stock: 0
    });
    setImages([]);
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
                        ? (product.category?.name || product.category?.title || 'Noma\'lum')
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
                    <label htmlFor="brand">Brand</label>
                    <input
                      type="text"
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="Brand nomini kiriting"
                    />
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
