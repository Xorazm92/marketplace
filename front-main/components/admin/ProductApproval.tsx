'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FaCheck, FaTimes, FaEye, FaClock, FaFilter } from 'react-icons/fa';
import styles from './ProductApproval.module.scss';
import SafeImage from '../common/SafeImage';

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  brand_id: number;
  category_id: number;
  subcategory_id?: number;
  user_id?: number;
  phone_number: string;
  is_checked: 'PENDING' | 'APPROVED' | 'REJECTED';
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
  images?: Array<{
    id: number;
    url: string;
    is_main: boolean;
  }>;
  brand?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

type FilterStatus = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED';

const ProductApproval: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('PENDING');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Load products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filter !== 'all') {
        queryParams.append('is_checked', filter);
      }

      const response = await fetch(`http://localhost:4000/api/v1/product?${queryParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } else {
        toast.error('Mahsulotlarni yuklashda xatolik');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Mahsulotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [filter]);

  // Approve product
  const approveProduct = async (productId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/product/${productId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_checked: 'APPROVED', is_active: true })
      });

      if (response.ok) {
        toast.success('Mahsulot tasdiqlandi!');
        loadProducts();
        setShowModal(false);
      } else {
        toast.error('Mahsulotni tasdiqlashda xatolik');
      }
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error('Mahsulotni tasdiqlashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Reject product
  const rejectProduct = async (productId: number, reason?: string) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/v1/product/${productId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          is_checked: 'REJECTED', 
          is_active: false,
          rejection_reason: reason 
        })
      });

      if (response.ok) {
        toast.success('Mahsulot rad etildi!');
        loadProducts();
        setShowModal(false);
      } else {
        toast.error('Mahsulotni rad etishda xatolik');
      }
    } catch (error) {
      console.error('Error rejecting product:', error);
      toast.error('Mahsulotni rad etishda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // View product details
  const viewProduct = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'Kutilmoqda', class: 'pending', icon: <FaClock /> },
      APPROVED: { label: 'Tasdiqlangan', class: 'approved', icon: <FaCheck /> },
      REJECTED: { label: 'Rad etilgan', class: 'rejected', icon: <FaTimes /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`${styles.statusBadge} ${styles[config.class]}`}>
        {config.icon} {config.label}
      </span>
    );
  };

  const pendingCount = products.filter(p => p.is_checked === 'PENDING').length;
  const approvedCount = products.filter(p => p.is_checked === 'APPROVED').length;
  const rejectedCount = products.filter(p => p.is_checked === 'REJECTED').length;

  return (
    <div className={styles.productApproval}>
      <div className={styles.header}>
        <div>
          <h2>Mahsulot tasdiqlash</h2>
          <p className={styles.subtitle}>
            Jami {products.length} ta mahsulot
          </p>
        </div>

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <FaClock className={styles.pending} />
            <span>{pendingCount} kutilmoqda</span>
          </div>
          <div className={styles.statItem}>
            <FaCheck className={styles.approved} />
            <span>{approvedCount} tasdiqlangan</span>
          </div>
          <div className={styles.statItem}>
            <FaTimes className={styles.rejected} />
            <span>{rejectedCount} rad etilgan</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <FaFilter />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterStatus)}
          >
            <option value="all">Barcha mahsulotlar</option>
            <option value="PENDING">Kutilayotgan</option>
            <option value="APPROVED">Tasdiqlangan</option>
            <option value="REJECTED">Rad etilgan</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className={styles.productsGrid}>
        {loading ? (
          <div className={styles.loading}>Yuklanmoqda...</div>
        ) : products.length === 0 ? (
          <div className={styles.empty}>
            <FaClock size={48} />
            <h3>Mahsulotlar topilmadi</h3>
            <p>Hozircha {filter === 'all' ? 'hech qanday' : filter.toLowerCase()} mahsulotlar yo'q</p>
          </div>
        ) : (
          products.map(product => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>
                {product.images && product.images.length > 0 ? (
                  <SafeImage
                    src={product.images.find(img => img.is_main)?.url || product.images[0].url}
                    alt={product.title}
                    width={200}
                    height={200}
                  />
                ) : (
                  <div className={styles.noImage}>
                    <span>Rasm yo'q</span>
                  </div>
                )}
                {getStatusBadge(product.is_checked)}
              </div>

              <div className={styles.productInfo}>
                <h3 className={styles.productTitle}>{product.title}</h3>
                <p className={styles.productPrice}>{formatPrice(Number(product.price))}</p>
                
                <div className={styles.productMeta}>
                  {product.brand && (
                    <span className={styles.brand}>{product.brand.name}</span>
                  )}
                  {product.category && (
                    <span className={styles.category}>{product.category.name}</span>
                  )}
                </div>

                <div className={styles.productDetails}>
                  <div className={styles.seller}>
                    Sotuvchi: {product.user ? `${product.user.first_name} ${product.user.last_name}` : 'Noma\'lum'}
                  </div>
                  <div className={styles.date}>
                    {formatDate(product.createdAt)}
                  </div>
                </div>
              </div>

              <div className={styles.productActions}>
                <button
                  onClick={() => viewProduct(product)}
                  className={styles.viewButton}
                  title="Ko'rish"
                >
                  <FaEye />
                </button>
                
                {product.is_checked === 'PENDING' && (
                  <>
                    <button
                      onClick={() => approveProduct(product.id)}
                      className={styles.approveButton}
                      title="Tasdiqlash"
                      disabled={loading}
                    >
                      <FaCheck />
                    </button>
                    <button
                      onClick={() => rejectProduct(product.id)}
                      className={styles.rejectButton}
                      title="Rad etish"
                      disabled={loading}
                    >
                      <FaTimes />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Product Details Modal */}
      {showModal && selectedProduct && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Mahsulot tafsilotlari</h3>
              <button onClick={() => setShowModal(false)} className={styles.closeButton}>×</button>
            </div>
            
            <div className={styles.modalContent}>
              <div className={styles.productDetails}>
                <div className={styles.imageSection}>
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <SafeImage
                      src={selectedProduct.images.find(img => img.is_main)?.url || selectedProduct.images[0].url}
                      alt={selectedProduct.title}
                      width={300}
                      height={300}
                    />
                  ) : (
                    <div className={styles.noImageLarge}>Rasm yo'q</div>
                  )}
                </div>

                <div className={styles.infoSection}>
                  <h4>{selectedProduct.title}</h4>
                  <p className={styles.price}>{formatPrice(Number(selectedProduct.price))}</p>
                  
                  <div className={styles.description}>
                    <strong>Tavsif:</strong>
                    <p>{selectedProduct.description}</p>
                  </div>

                  <div className={styles.metadata}>
                    <div><strong>Brend:</strong> {selectedProduct.brand?.name || 'Noma\'lum'}</div>
                    <div><strong>Kategoriya:</strong> {selectedProduct.category?.name || 'Noma\'lum'}</div>
                    <div><strong>Telefon:</strong> {selectedProduct.phone_number}</div>
                    <div><strong>Holat:</strong> {getStatusBadge(selectedProduct.is_checked)}</div>
                    <div><strong>Yaratilgan:</strong> {formatDate(selectedProduct.createdAt)}</div>
                  </div>
                </div>
              </div>

              {selectedProduct.is_checked === 'PENDING' && (
                <div className={styles.modalActions}>
                  <button
                    onClick={() => rejectProduct(selectedProduct.id)}
                    className={styles.rejectButtonLarge}
                    disabled={loading}
                  >
                    <FaTimes /> Rad etish
                  </button>
                  <button
                    onClick={() => approveProduct(selectedProduct.id)}
                    className={styles.approveButtonLarge}
                    disabled={loading}
                  >
                    <FaCheck /> Tasdiqlash
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductApproval;
