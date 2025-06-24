import { Link } from "wouter";
import { Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Product } from "@shared/schema";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { formatPrice } = useLanguage();
  const { toast } = useToast();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart(product.id, 1);
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

  const discountPercentage = product.originalPrice ? 
    Math.round(((parseFloat(product.originalPrice.toString()) - parseFloat(product.price.toString())) / parseFloat(product.originalPrice.toString())) * 100) : 0;

  return (
    <Card className="group cursor-pointer hover:shadow-md transition-shadow border">
      <Link href={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(parseFloat(product.price.toString()))}
              </span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(parseFloat(product.originalPrice.toString()))}
                  </span>
                  {discountPercentage > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {discountPercentage}% OFF
                    </Badge>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600">
                {product.rating ? parseFloat(product.rating.toString()).toFixed(1) : '0.0'}
              </span>
              <span className="text-xs text-gray-500">
                ({product.reviewCount || 0})
              </span>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </CardContent>
      </Link>
    </Card>
  );
}
