import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Star, Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { id } = useParams();
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { addToCart } = useCart();
  const { formatPrice, t } = useLanguage();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${id}`],
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: [`/api/products/${id}/reviews`],
    enabled: !!id,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['/api/products', { categoryId: product?.categoryId, limit: 4 }],
    enabled: !!product?.categoryId,
  });

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      await addToCart(product.id, quantity);
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-300 rounded-2xl"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-gray-300 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-300 rounded"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
                <div className="h-12 bg-gray-300 rounded"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const discountPercentage = product.originalPrice ? 
    Math.round(((parseFloat(product.originalPrice.toString()) - parseFloat(product.price.toString())) / parseFloat(product.originalPrice.toString())) * 100) : 0;

  const images = product.images || ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=800&fit=crop"];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <div>
            <div className="aspect-square rounded-2xl overflow-hidden mb-4">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-lg overflow-hidden border-2 cursor-pointer ${
                    selectedImageIndex === index ? 'border-primary' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4">
              <span className="text-sm text-gray-500">Category</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= (product.rating ? parseFloat(product.rating.toString()) : 0)
                          ? 'fill-current'
                          : ''
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>
              <Badge variant="secondary" className="bg-accent text-white">
                {product.stock ? 'In Stock' : 'Out of Stock'}
              </Badge>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(parseFloat(product.price.toString()))}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(parseFloat(product.originalPrice.toString()))}
                    </span>
                    {discountPercentage > 0 && (
                      <Badge variant="destructive">
                        {discountPercentage}% OFF
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Quantity</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 border-l border-r border-gray-300">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.stock || 0} available
                </span>
              </div>
            </div>

            <div className="flex space-x-4 mb-8">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.stock}
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            <Separator className="mb-6" />

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Product Details</h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              
              {product.specifications && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Specifications:</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {Object.entries(product.specifications as Record<string, any>).map(([key, value]) => (
                      <li key={key} className="flex">
                        <span className="font-medium w-24">{key}:</span>
                        <span>{value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Customer Reviews</h2>
          
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {review.user.firstName?.[0] || 'U'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium">
                            {review.user.firstName} {review.user.lastName}
                          </span>
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= review.rating ? 'fill-current' : ''
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts
                .filter((p: any) => p.id !== product.id)
                .slice(0, 4)
                .map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
