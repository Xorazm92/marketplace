import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Package, Heart, Star, User, Settings, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useLanguage } from "@/context/LanguageContext";

export default function UserDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { formatPrice, t } = useLanguage();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: orders = [], isError: ordersError, error: ordersErrorDetails } = useQuery({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
  });

  const { data: wishlist = [], isError: wishlistError, error: wishlistErrorDetails } = useQuery({
    queryKey: ['/api/wishlist'],
    enabled: isAuthenticated,
  });

  const { data: recentlyViewed = [] } = useQuery({
    queryKey: ['/api/recently-viewed'],
    enabled: isAuthenticated,
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (ordersError && isUnauthorizedError(ordersErrorDetails as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [ordersError, ordersErrorDetails, toast]);

  useEffect(() => {
    if (wishlistError && isUnauthorizedError(wishlistErrorDetails as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [wishlistError, wishlistErrorDetails, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="h-64 bg-gray-300 rounded"></div>
              <div className="lg:col-span-3 h-64 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

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
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-600">
            {t('dashboard.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  {user?.profileImageUrl ? (
                    <img
                      src={user.profileImageUrl}
                      alt="Profile"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{user?.email}</p>
                  </div>
                </div>
                
                <Tabs defaultValue="orders" orientation="vertical" className="w-full">
                  <TabsList className="grid w-full grid-cols-1 h-auto">
                    <TabsTrigger value="orders" className="justify-start">
                      <Package className="h-4 w-4 mr-2" />
                      {t('dashboard.orders')}
                    </TabsTrigger>
                    <TabsTrigger value="wishlist" className="justify-start">
                      <Heart className="h-4 w-4 mr-2" />
                      {t('dashboard.wishlist')}
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="justify-start">
                      <User className="h-4 w-4 mr-2" />
                      {t('dashboard.profile')}
                    </TabsTrigger>
                  </TabsList>
                  
                  {/* Main Content */}
                  <div className="lg:col-span-3 ml-6">
                    <TabsContent value="orders" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>{t('dashboard.recentOrders')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {orders.length === 0 ? (
                            <div className="text-center py-8">
                              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                              <p className="text-gray-500">{t('dashboard.noOrders')}</p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {orders.map((order: any) => (
                                <div key={order.id} className="border rounded-lg p-4">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <span className="font-semibold text-gray-900">
                                        {t('dashboard.orderNumber')}: {order.orderNumber}
                                      </span>
                                      <span className="ml-3 text-sm text-gray-600">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <Badge className={getStatusColor(order.status)}>
                                      {order.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                      {t('dashboard.total')}: {formatPrice(parseFloat(order.totalAmount.toString()))}
                                    </span>
                                    <Button variant="outline" size="sm">
                                      {t('dashboard.viewDetails')}
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="wishlist" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>{t('dashboard.wishlist')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {wishlist.length === 0 ? (
                            <div className="text-center py-8">
                              <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                              <p className="text-gray-500">{t('dashboard.noWishlistItems')}</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {wishlist.map((item: any) => (
                                <Card key={item.id} className="overflow-hidden">
                                  <div className="aspect-square">
                                    <img
                                      src={item.product.images?.[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop"}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <CardContent className="p-4">
                                    <h3 className="font-medium text-gray-900 mb-2">
                                      {item.product.name}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                      <span className="font-bold text-primary">
                                        {formatPrice(parseFloat(item.product.price.toString()))}
                                      </span>
                                      <Button size="sm">
                                        {t('dashboard.addToCart')}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="profile" className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>{t('dashboard.profileSettings')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('dashboard.firstName')}
                              </label>
                              <div className="text-gray-900">{user?.firstName || 'Not provided'}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('dashboard.lastName')}
                              </label>
                              <div className="text-gray-900">{user?.lastName || 'Not provided'}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('dashboard.email')}
                              </label>
                              <div className="text-gray-900">{user?.email}</div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('dashboard.role')}
                              </label>
                              <Badge variant="secondary">{user?.role}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
