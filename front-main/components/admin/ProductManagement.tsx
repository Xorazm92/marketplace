import React, { useState, useRef, useEffect } from 'react';
import styles from './ProductManagement.module.scss';
import { MdOutlineCameraAlt } from 'react-icons/md';
import { createAdminProduct, getAllProducts } from '../../endpoints/product';
import { toast } from 'react-toastify';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  brand: string;
  ageRange: string;
  stock: number;
  images: string[];
  features: string[];
  specifications: Record<string, string>;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

interface ProductFormData {
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  brand: string;
  ageRange: string;
  stock: number;
  features: string[];
  specifications: Record<string, string>;
  status: 'active' | 'inactive' | 'draft';
}

// Mock data - real loyihada API dan keladi
const mockProducts: Product[] = [
  {
    id: 1,
    title: 'Bolalar uchun rangli qalam to\'plami',
    description: 'Yuqori sifatli rangli qalamlar to\'plami. 24 ta turli rang.',
    price: 45000,
    originalPrice: 60000,
    category: 'school',
    brand: 'Faber-Castell',
    ageRange: '6-12',
    stock: 45,
    images: ['/img/products/colored-pencils.jpg'],
    features: ['24 ta rang', 'Yuqori sifat', 'Xavfsiz materiallar'],
    specifications: {
      'Material': 'Yog\'och va grafit',
      'Ranglar soni': '24',
      'Yosh oralig\'i': '6-12 yosh',
      'Ishlab chiqaruvchi': 'Faber-Castell'
    },
    status: 'active',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: 2,
    title: 'Yumshoq ayiq o\'yinchoq',
    description: 'Yumshoq va xavfsiz ayiq o\'yinchoq. Kichik bolalar uchun ideal.',
    price: 120000,
    originalPrice: 150000,
    category: 'toys',
    brand: 'Disney',
    ageRange: '0-5',
    stock: 23,
    images: ['/img/products/teddy-bear.jpg'],
    features: ['Yumshoq material', 'Xavfsiz', 'Yuvilib turadigan'],
    specifications: {
      'Material': 'Paxta va sintetik to\'ldiruvchi',
      'O\'lcham': '30cm',
      'Yosh oralig\'i': '0-5 yosh',
      'Rang': 'Jigarrang'
    },
    status: 'active',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  }
];

const categories = [
  { value: 'clothing', label: 'Kiyim-kechak' },
  { value: 'toys', label: "O'yinchoqlar" },
  { value: 'books', label: 'Kitoblar' },
  { value: 'sports', label: 'Sport anjomlar' },
  { value: 'school', label: 'Maktab buyumlari' },
  { value: 'baby', label: 'Chaqaloq buyumlari' },
  { value: 'electronics', label: 'Elektronika' },
  { value: 'health', label: "Sog'liq" }
];

const brands = [
  'Faber-Castell', 'LEGO', 'Fisher-Price', 'Nike Kids', 'Adidas Kids',
  'Disney', 'Barbie', 'Hot Wheels', 'Chicco', 'Johnson\'s Baby'
];

const ageRanges = [
  { value: '0-2', label: '0-2 yosh' },
  { value: '3-5', label: '3-5 yosh' },
  { value: '6-8', label: '6-8 yosh' },
  { value: '9-12', label: '9-12 yosh' },
  { value: '13+', label: '13+ yosh' }
];

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [realProducts, setRealProducts] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [loading, setLoading] = useState(false);

  // Load real products from API
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await getAllProducts();
        if (response && response.length > 0) {
          setRealProducts(response);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Mahsulotlarni yuklashda xatolik');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    originalPrice: 0,
    category: '',
    brand: '',
    ageRange: '',
    stock: 0,
    features: [''],
    specifications: {},
    status: 'draft'
  });

  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'originalPrice' || name === 'stock' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addSpecification = () => {
    if (newSpecKey && newSpecValue) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpecKey]: newSpecValue
        }
      }));
      setNewSpecKey('');
      setNewSpecValue('');
    }
  };

  const removeSpecification = (key: string) => {
    const newSpecs = { ...formData.specifications };
    delete newSpecs[key];
    setFormData(prev => ({ ...prev, specifications: newSpecs }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages((prevImages) => [...prevImages, ...filesArray].slice(0, 10)); // Limit to 10 images
    }
  };

  const removeImage = (index: number) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Mahsulot nomini kiriting');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Mahsulot tavsifini kiriting');
      return;
    }
    if (!formData.category) {
      toast.error('Kategoriyani tanlang');
      return;
    }
    if (formData.price <= 0) {
      toast.error('To\'g\'ri narx kiriting');
      return;
    }
    if (images.length === 0) {
      toast.error('Kamida bitta rasm qo\'shing');
      return;
    }

    try {
      // Prepare data for backend API
      const productData = {
        title: formData.title,
        description: formData.description,
        price: formData.price.toString(),
        storage: "128", // Default values - you can make these configurable
        ram: "8",
        brand_id: "2", // Default brand - you should map this from formData.brand
        color_id: "2", // Default color
        currency_id: "2", // Default currency
        year: "2024",
        negotiable: "true",
        condition: "true",
        has_document: "true",
        phone_number: "+998901234567", // Default phone
        user_id: "1" // Admin user ID
      };

      const response = await createAdminProduct(productData, images);

      if (response) {
        toast.success('Mahsulot muvaffaqiyatli yaratildi!');
        resetForm();
        setImages([]);
        setShowAddForm(false);

        // Refresh products list
        try {
          const updatedProducts = await getAllProducts();
          if (updatedProducts) {
            setRealProducts(updatedProducts);
          }
        } catch (error) {
          console.error('Error refreshing products:', error);
        }
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Mahsulot yaratishda xatolik yuz berdi');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: 0,
      originalPrice: 0,
      category: '',
      brand: '',
      ageRange: '',
      stock: 0,
      features: [''],
      specifications: {},
      status: 'draft'
    });
    setImages([]);
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      category: product.category,
      brand: product.brand,
      ageRange: product.ageRange,
      stock: product.stock,
      features: product.features,
      specifications: product.specifications,
      status: product.status
    });
    setShowAddForm(true);
  };

  const handleDelete = (productId: number) => {
    if (window.confirm('Bu mahsulotni o\'chirishni xohlaysizmi?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleStatusChange = (productId: number, newStatus: 'active' | 'inactive' | 'draft') => {
    setProducts(prev => prev.map(p => 
      p.id === productId 
        ? { ...p, status: newStatus, updatedAt: new Date().toISOString() }
        : p
    ));
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesStatus = !filterStatus || product.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#27ae60';
      case 'inactive':
        return '#e74c3c';
      case 'draft':
        return '#f39c12';
      default:
        return '#7f8c8d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Faol';
      case 'inactive':
        return 'Nofaol';
      case 'draft':
        return 'Qoralama';
      default:
        return status;
    }
  };

  return (
    <div className={styles.productManagement}>
      <div className={styles.header}>
        <h2>Mahsulot boshqaruvi</h2>
        <button 
          className={styles.addButton}
          onClick={() => setShowAddForm(true)}
        >
          + Yangi mahsulot qo'shish
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Mahsulot qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Barcha kategoriyalar</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={styles.filterSelect}
        >
          <option value="">Barcha holatlar</option>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
          <option value="draft">Qoralama</option>
        </select>
      </div>

      {/* Real Products from Database */}
      {realProducts.length > 0 && (
        <div className={styles.realProductsSection}>
          <h3 className={styles.sectionTitle}>Database dan mahsulotlar ({realProducts.length})</h3>
          <div className={styles.realProductsGrid}>
            {realProducts.map((product) => (
              <div key={product.id} className={styles.realProductCard}>
                <div className={styles.productImageContainer}>
                  {product.product_image?.[0]?.url ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_BASE_URL}/${product.product_image[0].url}`}
                      alt={product.title}
                      className={styles.productImage}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>📦</div>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <h4 className={styles.productTitle}>{product.title}</h4>
                  <p className={styles.productPrice}>{product.price ? `${product.price.toLocaleString()} so'm` : 'Narx ko\'rsatilmagan'}</p>
                  <p className={styles.productId}>ID: {product.id}</p>
                  <p className={styles.productDate}>
                    Yaratilgan: {new Date(product.created_at).toLocaleDateString('uz-UZ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mock Products Table */}
      <div className={styles.productsTable}>
        <div className={styles.tableHeader}>
          <span>Mahsulot</span>
          <span>Kategoriya</span>
          <span>Narx</span>
          <span>Zaxira</span>
          <span>Holat</span>
          <span>Amallar</span>
        </div>

        {filteredProducts.map((product) => (
          <div key={product.id} className={styles.tableRow}>
            <div className={styles.productInfo}>
              <div className={styles.productImage}>
                <div className={styles.imagePlaceholder}>📦</div>
              </div>
              <div className={styles.productDetails}>
                <h4 className={styles.productTitle}>{product.title}</h4>
                <p className={styles.productBrand}>{product.brand}</p>
              </div>
            </div>

            <span className={styles.productCategory}>
              {categories.find(c => c.value === product.category)?.label}
            </span>

            <div className={styles.productPrice}>
              <span className={styles.currentPrice}>{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className={styles.originalPrice}>{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <span className={`${styles.productStock} ${product.stock < 10 ? styles.lowStock : ''}`}>
              {product.stock}
            </span>

            <div className={styles.productStatus}>
              <select
                value={product.status}
                onChange={(e) => handleStatusChange(product.id, e.target.value as any)}
                className={styles.statusSelect}
                style={{ color: getStatusColor(product.status) }}
              >
                <option value="active">Faol</option>
                <option value="inactive">Nofaol</option>
                <option value="draft">Qoralama</option>
              </select>
            </div>

            <div className={styles.productActions}>
              <button 
                className={styles.editButton}
                onClick={() => handleEdit(product)}
              >
                ✏️
              </button>
              <button 
                className={styles.deleteButton}
                onClick={() => handleDelete(product.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📦</div>
          <h3>Mahsulotlar topilmadi</h3>
          <p>Qidiruv shartlariga mos mahsulotlar yo'q.</p>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className={styles.productModal}>
          <div className={styles.modalOverlay} onClick={resetForm}></div>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>{editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}</h3>
              <button className={styles.closeButton} onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.productForm}>
              <div className={styles.formSection}>
                <h4>Asosiy ma'lumotlar</h4>
                
                <div className={styles.formGroup}>
                  <label>Mahsulot nomi *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Mahsulot nomini kiriting"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tavsif *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    placeholder="Mahsulot haqida batafsil ma'lumot"
                    rows={4}
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Kategoriya *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Kategoriyani tanlang</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Brend</label>
                    <select
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                    >
                      <option value="">Brendni tanlang</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Yosh oralig'i</label>
                    <select
                      name="ageRange"
                      value={formData.ageRange}
                      onChange={handleInputChange}
                    >
                      <option value="">Yosh oralig'ini tanlang</option>
                      {ageRanges.map(age => (
                        <option key={age.value} value={age.value}>{age.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Holat</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="draft">Qoralama</option>
                      <option value="active">Faol</option>
                      <option value="inactive">Nofaol</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.formSection}>
                <h4>Narx va zaxira</h4>
                
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Joriy narx *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Eski narx</label>
                    <input
                      type="number"
                      name="originalPrice"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>Zaxira miqdori *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Image Upload Section */}
              <div className={styles.formSection}>
                <h4>📸 Mahsulot rasmlari</h4>

                <div className={styles.imageUploadSection}>
                  <div className={styles.photoUploadContainer}>
                    {images.length < 10 && (
                      <div
                        className={`${styles.uploadPlaceholder} ${styles.photoUploadBox}`}
                        onClick={triggerFileInput}
                      >
                        <MdOutlineCameraAlt size={24} />
                        <span>Rasm qo'shish</span>
                        <input
                          type="file"
                          ref={fileInputRef}
                          style={{ display: "none" }}
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                        />
                      </div>
                    )}
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className={`${styles.imagePreview} ${styles.photoBox}`}
                      >
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                        />
                        <button
                          type="button"
                          className={styles.removeImageBtn}
                          onClick={() => removeImage(index)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className={styles.imageHint}>
                    Maksimal 10 ta rasm qo'shishingiz mumkin. Tavsiya etilgan o'lcham: 800x800px
                  </p>
                </div>
              </div>

              <div className={styles.formSection}>
                <h4>Xususiyatlar</h4>
                
                <div className={styles.featuresSection}>
                  <label>Asosiy xususiyatlar</label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className={styles.featureRow}>
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        placeholder="Xususiyatni kiriting"
                      />
                      {formData.features.length > 1 && (
                        <button 
                          type="button"
                          onClick={() => removeFeature(index)}
                          className={styles.removeButton}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={addFeature}
                    className={styles.addFeatureButton}
                  >
                    + Xususiyat qo'shish
                  </button>
                </div>

                <div className={styles.specificationsSection}>
                  <label>Texnik xususiyatlar</label>
                  
                  <div className={styles.addSpecRow}>
                    <input
                      type="text"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                      placeholder="Xususiyat nomi"
                    />
                    <input
                      type="text"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="Qiymati"
                    />
                    <button 
                      type="button"
                      onClick={addSpecification}
                      className={styles.addSpecButton}
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.specsList}>
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div key={key} className={styles.specRow}>
                        <span className={styles.specKey}>{key}:</span>
                        <span className={styles.specValue}>{value}</span>
                        <button 
                          type="button"
                          onClick={() => removeSpecification(key)}
                          className={styles.removeSpecButton}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={resetForm} className={styles.cancelButton}>
                  Bekor qilish
                </button>
                <button type="submit" className={styles.saveButton}>
                  {editingProduct ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;
