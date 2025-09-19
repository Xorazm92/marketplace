import { Product, ProductValidation, ProductApiRequest } from '../types/product';

/**
 * ✅ Mahsulot ma'lumotlarini tekshiruvchi utility
 * Barcha kerakli maydonlar mavjudligini va to'g'riligini tekshiradi
 */

// ✅ Mahsulot obyektini tekshirish
export const validateProduct = (product: any): ProductValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ✅ Asosiy maydonlarni tekshirish
  if (!product) {
    errors.push('Mahsulot ma\'lumotlari topilmadi');
    return { isValid: false, errors, warnings };
  }

  // ✅ ID tekshiruvi
  if (!product.id || typeof product.id !== 'number') {
    errors.push('Mahsulot ID si noto\'g\'ri yoki mavjud emas');
  }

  // ✅ Nomi tekshiruvi
  const productName = product.title || product.name;
  if (!productName || typeof productName !== 'string' || productName.trim().length === 0) {
    errors.push('Mahsulot nomi topilmadi yoki bo\'sh');
  } else if (productName.trim().length < 3) {
    warnings.push('Mahsulot nomi juda qisqa (3 ta belgidan kam)');
  }

  // ✅ Narx tekshiruvi
  if (!product.price || typeof product.price !== 'number' || product.price <= 0) {
    errors.push('Mahsulot narxi noto\'g\'ri yoki mavjud emas');
  }

  // ✅ Slug tekshiruvi
  if (!product.slug || typeof product.slug !== 'string') {
    warnings.push('Mahsulot slug mavjud emas');
  }

  // ✅ Rasm tekshiruvi
  const hasImages = checkProductImages(product);
  if (!hasImages) {
    warnings.push('Mahsulot rasmlari topilmadi');
  }

  // ✅ Brand tekshiruvi
  if (!product.brand?.name && !product.brand_id) {
    warnings.push('Brand ma\'lumotlari topilmadi');
  }

  // ✅ Category tekshiruvi
  if (!product.category?.name && !product.category_id) {
    warnings.push('Kategoriya ma\'lumotlari topilmadi');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ✅ Mahsulot rasmlarini tekshirish
export const checkProductImages = (product: any): boolean => {
  // Backend format: images array
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    return product.images.some((img: any) => img && typeof img === 'string' && img.trim() !== '');
  }
  
  // Frontend format: product_image array
  if (product.product_image && Array.isArray(product.product_image) && product.product_image.length > 0) {
    return product.product_image.some((img: any) => img?.url && typeof img.url === 'string' && img.url.trim() !== '');
  }
  
  return false;
};

// ✅ Mahsulot rasmini olish (xavfsiz)
export const getProductImage = (product: any, index: number = 0): string => {
  const defaultImage = '/img/placeholder-product.jpg';
  
  if (!product) return defaultImage;
  
  // Backend format: images array
  if (product.images && Array.isArray(product.images) && product.images[index]) {
    const imageUrl = product.images[index];
    if (typeof imageUrl === 'string' && imageUrl.trim() !== '') {
      // Agar URL to'liq bo'lsa, o'zini qaytarish
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      // Agar nisbiy URL bo'lsa, server URL qo'shish
      return `http://localhost:4000${imageUrl.replace('/uploads//uploads/', '/uploads/')}`;
    }
  }
  
  // Frontend format: product_image array
  if (product.product_image && Array.isArray(product.product_image) && product.product_image[index]) {
    const imageObj = product.product_image[index];
    if (imageObj?.url && typeof imageObj.url === 'string' && imageObj.url.trim() !== '') {
      if (imageObj.url.startsWith('http')) {
        return imageObj.url;
      }
      return `http://localhost:4000${imageObj.url.replace('/uploads//uploads/', '/uploads/')}`;
    }
  }
  
  return defaultImage;
};

// ✅ Mahsulot nomini olish (xavfsiz)
export const getProductName = (product: any): string => {
  if (!product) return 'Noma\'lum mahsulot';
  
  const name = product.title || product.name;
  if (name && typeof name === 'string' && name.trim() !== '') {
    return name.trim();
  }
  
  return 'Nomsiz mahsulot';
};

// ✅ Brand nomini olish (xavfsiz)
export const getBrandName = (product: any): string => {
  if (!product) return 'Noma\'lum brand';
  
  if (product.brand?.name && typeof product.brand.name === 'string') {
    return product.brand.name.trim();
  }
  
  return 'INBOLA';
};

// ✅ Mahsulot narxini formatlash
export const formatProductPrice = (product: any): string => {
  if (!product || !product.price || typeof product.price !== 'number') {
    return '0';
  }
  
  return product.price.toLocaleString();
};

// ✅ Reytingni hisoblash (xavfsiz)
export const calculateAverageRating = (reviews: any): number => {
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return 0;
  }
  
  const validReviews = reviews.filter(review => 
    review && 
    typeof review.rating === 'number' && 
    review.rating >= 0 && 
    review.rating <= 5
  );
  
  if (validReviews.length === 0) return 0;
  
  const sum = validReviews.reduce((acc, review) => acc + review.rating, 0);
  return Math.round(sum / validReviews.length);
};

// ✅ API request uchun ma'lumotlarni tekshirish
export const validateApiRequest = (data: any): ProductValidation => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // ✅ Majburiy maydonlar
  const requiredFields = [
    { field: 'title', message: 'Mahsulot nomini kiriting' },
    { field: 'description', message: 'Mahsulot tavsifini kiriting' },
    { field: 'price', message: 'Mahsulot narxini kiriting' },
    { field: 'category_id', message: 'Kategoriyani tanlang' },
    { field: 'brand_id', message: 'Brandni tanlang' },
    { field: 'currency_id', message: 'Valyutani tanlang' },
    { field: 'user_id', message: 'Foydalanuvchi ID si kerak' },
    { field: 'phone_number', message: 'Telefon raqamni kiriting' }
  ];

  requiredFields.forEach(({ field, message }) => {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(message);
    }
  });

  // ✅ Raqamli maydonlar tekshiruvi
  const numericFields = ['price', 'category_id', 'brand_id', 'currency_id', 'user_id'];
  numericFields.forEach(field => {
    if (data[field] && (typeof data[field] !== 'number' || data[field] <= 0)) {
      errors.push(`${field} maydoni to'g'ri raqam bo'lishi kerak`);
    }
  });

  // ✅ Telefon raqam formati
  if (data.phone_number && !/^\+998\d{9}$/.test(data.phone_number)) {
    errors.push('Telefon raqam +998XXXXXXXXX formatida bo\'lishi kerak');
  }

  // ✅ Narx tekshiruvi
  if (data.price && data.price < 1000) {
    warnings.push('Narx juda past ko\'rinadi');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// ✅ Xatoliklarni foydalanuvchiga ko'rsatish
export const showValidationErrors = (validation: ProductValidation): void => {
  if (validation.errors.length > 0) {
    console.error('❌ Xatoliklar:', validation.errors);
    // Toast yoki alert ko'rsatish mumkin
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Ogohlantirishlar:', validation.warnings);
  }
};

// ✅ Demo mahsulotlar (fallback uchun)
export const getDemoProducts = (): Product[] => {
  return [
    {
      id: 1,
      title: "Demo O'yinchoq Mashina",
      price: 50000,
      slug: "demo-oyinchoq-mashina",
      brand_id: 1,
      currency_id: 1,
      description: "Bolalar uchun xavfsiz o'yinchoq mashina",
      negotiable: true,
      condition: "new",
      phone_number: "+998901234567",
      category_id: 4,
      subcategory_id: 5,
      age_range: "3-6",
      material: "Plastik",
      color: "Qizil",
      size: "Kichik",
      manufacturer: "Demo Brand",
      safety_info: "Bolalar uchun xavfsiz",
      features: ["Yorug'lik", "Tovush"],
      weight: 0.5,
      images: ["/uploads/demo-car.jpg"],
      brand: { id: 1, name: "Demo Brand" },
      category: { id: 4, name: "O'yinchoqlar", slug: "oyinchoqlar" },
      reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }],
      view_count: 245,
      like_count: 32,
      is_active: true,
      is_checked: true,
      is_deleted: false
    }
  ];
};
