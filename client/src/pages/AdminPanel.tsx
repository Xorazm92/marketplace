import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Users, Package, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
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
import { apiRequest } from "@/lib/queryClient";

export default function AdminPanel() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { formatPrice, t } = useLanguage();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "Access Denied",
        description: "You need to be an admin to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: stats, isError: statsError, error: statsErrorDetails } = useQuery({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  const { data: pendingSellers = [], isError: sellersError, error: sellersErrorDetails } = useQuery({
    queryKey: ['/api/admin/pending-sellers'],
    enabled: isAuthenticated && user?.role === 'admin',
  });

  // Handle unauthorized errors
  useEffect(() => {
    if (statsError && isUnauthorizedError(statsErrorDetails as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [statsError, statsErrorDetails, toast]);

  const approveSellerMutation = useMutation({
    mutationFn: async (sellerId: string) => {
      await apiRequest('POST', `/api/admin/approve-seller/${sellerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-sellers'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Success",
        description: "Seller approved successfully.",
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
        description: "Failed to approve seller.",
        variant: "destructive",
      });
    },
  });

  const handleApproveSeller = (sellerId: string) => {
    approveSellerMutation.mutate(sellerId);
  };

  const handleRejectSeller = (sellerId: string) => {
    // In a real app, you'd have a reject endpoint
    toast({
      title: "Feature Not Implemented",
      description: "Seller rejection feature is not implemented yet.",
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      type: 'user',
      description: 'New user registration: john@example.com',
      time: '2 hours ago',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      id: 2,
      type: 'seller',
      description: 'Seller approved: Tech Electronics Store',
      time: '4 hours ago',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      id: 3,
      type: 'product',
      description: 'Product reported: Wireless Headphones',
      time: '6 hours ago',
      icon: Package,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('admin.title')}
          </h1>
          <p className="text-gray-600">
            {t('admin.subtitle')}
          </p>
        </div>

        {/* Admin Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
              <p className="text-sm text-gray-600">{t('admin.totalUsers')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-gray-900">{stats?.totalSellers || 0}</p>
              <p className="text-sm text-gray-600">{t('admin.totalSellers')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Package className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
              <p className="text-sm text-gray-600">{t('admin.totalProducts')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingApprovals || 0}</p>
              <p className="text-sm text-gray-600">{t('admin.pendingApprovals')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-gray-900">
                {stats ? formatPrice(stats.monthlyRevenue) : formatPrice(0)}
              </p>
              <p className="text-sm text-gray-600">{t('admin.monthlyRevenue')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="sellers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="sellers">Pending Sellers</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="sellers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.pendingSellers')}</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingSellers.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No pending seller approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingSellers.map((seller: any) => (
                      <div key={seller.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {seller.firstName} {seller.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{seller.email}</p>
                            <p className="text-sm text-gray-500">
                              {t('admin.submitted')}: {new Date(seller.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="bg-accent hover:bg-green-600 text-white"
                              onClick={() => handleApproveSeller(seller.id)}
                              disabled={approveSellerMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {t('admin.approve')}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 hover:text-red-700 border-red-200"
                              onClick={() => handleRejectSeller(seller.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {t('admin.reject')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.recentActivity')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`w-8 h-8 ${activity.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <activity.icon className={`h-4 w-4 ${activity.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}
