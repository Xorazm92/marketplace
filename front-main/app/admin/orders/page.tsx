'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { adminApi } from '@/endpoints/admin';
import { format } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'>('all');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const { data: ordersData, isLoading, isError } = useQuery({
    queryKey: ['admin-orders', { searchTerm, statusFilter, page, pageSize }],
    queryFn: () => adminApi.getOrders({
      search: searchTerm,
      status: statusFilter === 'all' ? undefined : statusFilter,
      page,
      limit: pageSize,
    }),
    keepPreviousData: true,
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'outline';
      case 'PROCESSING':
        return 'secondary';
      case 'SHIPPED':
        return 'default';
      case 'DELIVERED':
        return 'success';
      case 'CANCELLED':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    // TODO: Implement status update
    console.log(`Update order ${orderId} status to ${newStatus}`);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Icons.alertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium">Something went wrong</h3>
        <p className="text-sm text-muted-foreground">
          Failed to load orders. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground">
          Manage all orders in the marketplace
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('PENDING')}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === 'PROCESSING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('PROCESSING')}
              >
                Processing
              </Button>
              <Button
                variant={statusFilter === 'SHIPPED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('SHIPPED')}
              >
                Shipped
              </Button>
              <Button
                variant={statusFilter === 'DELIVERED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('DELIVERED')}
              >
                Delivered
              </Button>
              <Button
                variant={statusFilter === 'CANCELLED' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('CANCELLED')}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : ordersData?.items?.length ? (
                  ordersData.items.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>#{order.orderNumber}</span>
                          <span className="text-xs text-muted-foreground">
                            {order.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {order.customer?.firstName} {order.customer?.lastName}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {order.customer?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.createdAt
                          ? format(new Date(order.createdAt), 'MMM d, yyyy')
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {order.items?.slice(0, 3).map((item, index) => (
                            <div
                              key={index}
                              className="h-8 w-8 rounded-full border-2 border-background bg-gray-100 flex items-center justify-center text-xs font-medium"
                            >
                              {item.quantity}
                            </div>
                          ))}
                          {order.items && order.items.length > 3 && (
                            <div className="h-8 w-8 rounded-full border-2 border-background bg-gray-100 flex items-center justify-center text-xs font-medium">
                              +{order.items.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(order.totalAmount || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {}}
                            className="h-8 w-8"
                          >
                            <Icons.eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {}}
                            className="h-8 w-8"
                          >
                            <Icons.printer className="h-4 w-4" />
                            <span className="sr-only">Print</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {ordersData && ordersData.totalPages > 1 && (
          <CardFooter className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{(page - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">
                {Math.min(page * pageSize, ordersData.totalItems)}
              </span>{' '}
              of <span className="font-medium">{ordersData.totalItems}</span> orders
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={page === 1}
              >
                <Icons.chevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, ordersData.totalPages) }, (_, i) => {
                  let pageNum;
                  if (ordersData.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= ordersData.totalPages - 2) {
                    pageNum = ordersData.totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => Math.min(old + 1, ordersData.totalPages))}
                disabled={page === ordersData.totalPages}
              >
                <span>Next</span>
                <Icons.chevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
