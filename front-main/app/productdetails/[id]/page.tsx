'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart, ShoppingCart, Star, Shield, Award, Share2, Eye, Minus, Plus } from 'lucide-react';
import OptimizedImage from '../../../components/common/OptimizedImage';
import { Product } from '../../../types/product';
import toast from 'react-hot-toast';

const ProductDetailsPage = () => {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:4000/api/v1/product/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          toast.error('Mahsulot topilmadi');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Xatolik yuz berdi');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      setLoading(true);
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    toast.success('Mahsulot savatga qo\'shildi');
  };

  const handleAddToFavorites = () => {
    toast.success('Mahsulot sevimlilar ro\'yxatiga qo\'shildi');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price);
  };

  const getDiscountedPrice = () => {
    if (!product) return 0;
    const discountedPrice = (product?.discount_percentage ?? 0) > 0
    ? Number(product.price) * (1 - (product?.discount_percentage ?? 0) / 100)
    : Number(product.price);
    return discountedPrice;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-300 h-96 rounded-lg"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Mahsulot topilmadi
          </h1>
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Bosh sahifaga qaytish
          </a>
        </div>
      </div>
    );
  }

  const hasDiscount = (product?.discount_percentage ?? 0) > 0;
  const finalPrice = getDiscountedPrice();
  const productImages = product?.product_image || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative">
            <OptimizedImage
              src={productImages[selectedImageIndex]?.url || '/img/placeholder-product.jpg'}
              alt={product.title}
              width={500}
              height={500}
              className="w-full h-96 object-cover rounded-lg"
            />
            
            {hasDiscount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                -{product?.discount_percentage ?? 0}% chegirma
              </div>
            )}
          </div>
          
          {productImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <OptimizedImage
                    src={image.url}
                    alt={`${product.title} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            {product.category && (
              <span className="text-blue-600 text-sm font-medium">
                {product.category.name}
              </span>
            )}
            <h1 className="text-3xl font-bold text-gray-800 mt-2">
              {product.title}
            </h1>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-4">
                <span className="text-2xl font-bold text-green-600">
                  {finalPrice.toLocaleString()} so'm
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-500 line-through ml-2">
                    {Number(product.price).toLocaleString()} so'm
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm ml-2">
                    -{product?.discount_percentage ?? 0}% chegirma
                  </span>
                )} 
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={i < Math.floor(4.5) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
              />
            ))}
            <span className="ml-2 text-gray-600">
              4.5 ({product?.view_count || 0} ko'rishlar)
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Tavsif</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Age Group */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Yosh guruhi:</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  3+ yosh
                </span>
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Xavfsizlik sertifikatlari:</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <Shield size={14} className="mr-1" />
                  CE Belgisi
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center">
                  <Shield size={14} className="mr-1" />
                  Xavfsiz Material
                </span>
              </div>
            </div>

          {/* Quantity and Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-gray-700 font-medium">Miqdor:</span>
              <div className="flex items-center border rounded-lg">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 py-2 border-x">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ShoppingCart size={20} />
                Savatga qo'shish
              </button>
              
              <button 
                onClick={handleAddToFavorites}
                className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Heart size={20} />
                Sevimlilar
              </button>
            </div>
          </div>

          {/* Seller Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Sotuvchi ma'lumotlari:</h3>
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {product?.user?.first_name?.[0] || 'T'}{product?.user?.last_name?.[0] || 'U'}
              </div>
              <div>
                <p className="font-medium">
                  {product?.user?.first_name || 'Test'} {product?.user?.last_name || 'User'}
                </p>
                <p className="text-sm text-gray-600">
                  Telefon: {product?.phone_number || 'Ko\'rsatilmagan'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
