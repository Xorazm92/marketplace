import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Package, DollarSign, Star, TrendingUp, Plus, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLanguage } from "@/context/LanguageContext";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

const productFormSchema = insertProductSchema.extend({
  price: z.string().min(1, "Price is required"),
  originalPrice: z.string().optional(),
  stock: z.string().min(1, "Stock is required"),
  categoryId: z.string().min(1, "Category is required"),
});

export default function SellerDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { formatPrice, t } = useLanguage();
  const queryClient = useQueryClient();
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'seller')) {
      toast({
        title: "Access Denied",
        description: "You need to be a seller to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: products = [], isError: productsError, error: productsErrorDetails } = useQuery({
    queryKey: ['/api/seller/products'],
    enabled: isAuthenticated && user?.role === 'seller',
  });

  const { data: orders = [], isError: ordersError, error: ordersErrorDetails } = useQuery({
    queryKey: ['/api/seller/orders'],
    enabled: isAuthenticated && user?.role === 'seller',
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (productsError && isUnauthorizedError(productsErrorDetails as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [productsError, productsErrorDetails, toast]);

  const form = useForm({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      stock: "",
      categoryId: "",
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/products', {
        ...data,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : undefined,
        stock: parseInt(data.stock),
        categoryId: parseInt(data.categoryId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/products'] });
      setIsAddProductOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Product created successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create product.",
        variant: "destructive",
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest('DELETE', `/api/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/products'] });
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createProductMutation.mutate(data);
  };

  const handleDeleteProduct = (productId: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'seller') {
    return null;
  }

  // Calculate stats
  const totalProducts = products.length;
  const totalOrders = orders.reduce((sum: number, order: any) => sum + order.items.length, 0);
  const monthlyRevenue = orders.reduce((sum: number, order: any) => {
    const orderMonth = new Date(order.createdAt).getMonth();
    const currentMonth = new Date().getMonth();
    if (orderMonth === currentMonth) {
      return sum + order.items.reduce((itemSum: number, item: any) => 
        itemSum + (parseFloat(item.price.toString()) * item.quantity), 0);
    }
    return sum;
  }, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-accent text-white';
      case 'shipping':
        return 'bg-yellow-500 text-white';
      case 'confirmed':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('seller.title')}
          </h1>
          <p className="text-gray-600">
            {t('seller.subtitle')}
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('seller.totalProducts')}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('seller.totalOrders')}</p>
                  <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('seller.monthlyRevenue')}</p>
                  <p className="text-2xl font-bold text-gray-900">{formatPrice(monthlyRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{t('seller.rating')}</p>
                  <p className="text-2xl font-bold text-gray-900">4.8</p>
                </div>
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('seller.recentProducts')}</CardTitle>
                  <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {t('seller.addProduct')}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{t('seller.addProduct')}</DialogTitle>
                      </DialogHeader>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="price"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Price</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="originalPrice"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Original Price (Optional)</FormLabel>
                                  <FormControl>
                                    <Input type="number" step="0.01" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="stock"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Stock</FormLabel>
                                  <FormControl>
                                    <Input type="number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={form.control}
                              name="categoryId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category</FormLabel>
                                  <FormControl>
                                    <select {...field} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                      <option value="">Select a category</option>
                                      {categories.map((category: any) => (
                                        <option key={category.id} value={category.id.toString()}>
                                          {category.name}
                                        </option>
                                      ))}
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsAddProductOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={createProductMutation.isPending}>
                              {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">{t('seller.noProducts')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product: any) => (
                      <div key={product.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={product.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop"}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{product.name}</h3>
                          <p className="text-sm text-gray-600">{formatPrice(parseFloat(product.price.toString()))}</p>
                          <p className="text-sm text-gray-500">{t('seller.stock')}: {product.stock || 0}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('seller.recentOrders')}</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">{t('seller.noOrders')}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div key={order.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="font-semibold text-gray-900">
                              Order #{order.orderNumber}
                            </span>
                            <span className="ml-3 text-sm text-gray-600">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {order.items.map((item: any) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>{item.productName} (x{item.quantity})</span>
                              <span>{formatPrice(parseFloat(item.price.toString()) * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
