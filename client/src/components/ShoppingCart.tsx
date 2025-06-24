import { X, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/hooks/use-toast";

interface ShoppingCartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShoppingCartSidebar({ isOpen, onClose }: ShoppingCartSidebarProps) {
  const { items, updateQuantity, removeFromCart, getTotalPrice } = useCart();
  const { formatPrice, t } = useLanguage();
  const { toast } = useToast();

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quantity.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item.",
        variant: "destructive",
      });
    }
  };

  const subtotal = getTotalPrice();
  const shipping = 12.99; // Mock shipping cost
  const total = subtotal + shipping;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-96 flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {t('cart.title')}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">{t('cart.empty')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.product.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {item.product.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {formatPrice(parseFloat(item.product.price.toString()))}
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('cart.subtotal')}:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>{t('cart.shipping')}:</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>{t('cart.total')}:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Button className="w-full" size="lg">
              {t('cart.checkout')}
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
