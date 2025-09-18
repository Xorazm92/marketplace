import React, { useState } from 'react';
import Link from 'next/link';
import styles from './WishlistPage.module.scss';

interface WishlistItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  discount?: number;
  inStock: boolean;
  slug: string;
  addedDate: string;
}

interface WishlistPageProps {
  userId: number;
}

// Mock data - real loyihada API dan keladi
const mockWishlistItems: WishlistItem[] = [
  {
    id: 1,
    productId: 1,
    title: 'Bolalar uchun rangli qalam to\'plami',
    price: 45000,
    originalPrice: 60000,
    image: '/img/products/colored-pencils.jpg',
    rating: 4.8,
    reviews: 124,
    discount: 25,
    inStock: true,
    slug: 'colored-pencils-set',
    addedDate: '2024-01-15'
  },
  {
    id: 2,
    productId: 2,
    title: 'Yumshoq ayiq o\'yinchoq',
    price: 120000,
    originalPrice: 150000,
    image: '/img/products/teddy-bear.jpg',
    rating: 4.9,
    reviews: 89,
    discount: 20,
    inStock: true,
    slug: 'soft-teddy-bear',
    addedDate: '2024-01-12'
  },
  {
    id: 3,
    productId: 3,
    title: 'Bolalar sport kiyimi',
    price: 85000,
    image: '/img/products/kids-sportswear.jpg',
    rating: 4.7,
    reviews: 156,
    inStock: false,
    slug: 'kids-sportswear',
    addedDate: '2024-01-10'
  }
];

const WishlistPage: React.FC<WishlistPageProps> = ({ userId }) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>(mockWishlistItems);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.star}>★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.halfStar}>★</span>);
    }

    return stars;
  };

  const handleRemoveItem = (itemId: number) => {
    if (window.confirm('Bu mahsulotni sevimlilar ro\'yxatidan o\'chirishni xohlaysizmi?')) {
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  const handleSelectItem = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(wishlistItems.map(item => item.id));
    }
  };

  const handleRemoveSelected = () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`${selectedItems.length} ta mahsulotni sevimlilar ro'yxatidan o'chirishni xohlaysizmi?`)) {
      setWishlistItems(prev => prev.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
    }
  };

  const handleAddToCart = (item: WishlistItem) => {
    // Cart ga qo'shish logikasi
    if (process.env.NODE_ENV === "development") console.log('Adding to cart:', item);
    alert(`"${item.title}" savatchaga qo'shildi!`);
  };

  const handleAddAllToCart = () => {
    const inStockItems = wishlistItems.filter(item => item.inStock);
    if (inStockItems.length === 0) {
      alert('Mavjud mahsulotlar yo\'q!');
      return;
    }
    
    // Barcha mavjud mahsulotlarni cart ga qo'shish
    if (process.env.NODE_ENV === "development") console.log('Adding all to cart:', inStockItems);
    alert(`${inStockItems.length} ta mahsulot savatchaga qo'shildi!`);
  };

  return (
    <div className={styles.wishlistPage}>
      <div className={styles.header}>
        <h2>Sevimlilar ro'yxati</h2>
        {wishlistItems.length > 0 && (
          <div className={styles.headerActions}>
            <button 
              className={styles.addAllToCartButton}
              onClick={handleAddAllToCart}
            >
              🛒 Barchasini savatchaga
            </button>
          </div>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>❤️</div>
          <h3>Sevimlilar ro'yxati bo'sh</h3>
          <p>Yoqgan mahsulotlaringizni sevimlilar ro'yxatiga qo'shing.</p>
          <Link href="/search" className={styles.shopButton}>
            Xarid qilishni boshlash
          </Link>
        </div>
      ) : (
        <>
          <div className={styles.listActions}>
            <div className={styles.selectActions}>
              <label className={styles.selectAllLabel}>
                <input
                  type="checkbox"
                  checked={selectedItems.length === wishlistItems.length}
                  onChange={handleSelectAll}
                />
                <span>Barchasini tanlash ({wishlistItems.length})</span>
              </label>
              {selectedItems.length > 0 && (
                <button 
                  className={styles.removeSelectedButton}
                  onClick={handleRemoveSelected}
                >
                  Tanlanganlarni o'chirish ({selectedItems.length})
                </button>
              )}
            </div>
          </div>

          <div className={styles.wishlistGrid}>
            {wishlistItems.map((item) => (
              <div key={item.id} className={styles.wishlistCard}>
                <div className={styles.cardHeader}>
                  <label className={styles.selectCheckbox}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                    />
                  </label>
                  <button 
                    className={styles.removeButton}
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    ❌
                  </button>
                </div>

                <Link href={`/product/${item.slug}`} className={styles.productLink}>
                  <div className={styles.imageContainer}>
                    <div className={styles.imagePlaceholder}>
                      <span className={styles.productIcon}>📦</span>
                    </div>
                    {item.discount && (
                      <span className={styles.discount}>-{item.discount}%</span>
                    )}
                    {!item.inStock && (
                      <div className={styles.outOfStock}>Mavjud emas</div>
                    )}
                  </div>

                  <div className={styles.productInfo}>
                    <h3 className={styles.productTitle}>{item.title}</h3>
                    
                    <div className={styles.rating}>
                      <div className={styles.stars}>
                        {renderStars(item.rating)}
                      </div>
                      <span className={styles.reviewCount}>({item.reviews})</span>
                    </div>
                    
                    <div className={styles.priceContainer}>
                      <span className={styles.currentPrice}>{formatPrice(item.price)}</span>
                      {item.originalPrice && (
                        <span className={styles.originalPrice}>{formatPrice(item.originalPrice)}</span>
                      )}
                    </div>

                    <p className={styles.addedDate}>
                      Qo'shilgan: {formatDate(item.addedDate)}
                    </p>
                  </div>
                </Link>

                <div className={styles.cardActions}>
                  {item.inStock ? (
                    <button 
                      className={styles.addToCartButton}
                      onClick={() => handleAddToCart(item)}
                    >
                      🛒 Savatchaga
                    </button>
                  ) : (
                    <button className={styles.notifyButton}>
                      🔔 Mavjud bo'lganda xabar berish
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WishlistPage;
