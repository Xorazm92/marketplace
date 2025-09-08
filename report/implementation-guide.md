# Frontend Implementation Guide for Missing API Features

## Overview

This guide provides step-by-step implementation instructions for connecting the missing backend endpoints to the frontend application. Based on the API coverage analysis, we've identified critical gaps that need to be addressed.

---

## Priority 1: Order Management System

### Backend Endpoints Available
- `POST /orders` - Create order
- `GET /orders` - Get user orders
- `GET /orders/:id` - Get single order
- `PATCH /orders/:id/cancel` - Cancel order
- `GET /orders/by-number/:orderNumber` - Track order

### Implementation Steps

#### 1. Create Order Service (`/endpoints/order.ts`)

```typescript
import instance from './instance';
import { toast } from 'react-toastify';

export interface CreateOrderDto {
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
  }>;
  shipping_address_id: number;
  payment_method_id: number;
  notes?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  total_amount: number;
  created_at: string;
  items: OrderItem[];
  shipping_address: Address;
}

// Create new order
export const createOrder = async (orderData: CreateOrderDto) => {
  try {
    const res = await instance.post('/orders', orderData);
    toast.success('Order created successfully!');
    return res.data;
  } catch (error: any) {
    console.error('Error creating order:', error);
    toast.error(error?.response?.data?.message || 'Failed to create order');
    throw error;
  }
};

// Get user orders
export const getUserOrders = async (page = 1, limit = 10, status?: string) => {
  try {
    const params = { page, limit, ...(status && { status }) };
    const res = await instance.get('/orders', { params });
    return res.data;
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    toast.error('Failed to load orders');
    throw error;
  }
};

// Get single order
export const getOrderById = async (orderId: number) => {
  try {
    const res = await instance.get(`/orders/${orderId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching order:', error);
    toast.error('Failed to load order details');
    throw error;
  }
};

// Track order by number
export const trackOrder = async (orderNumber: string) => {
  try {
    const res = await instance.get(`/orders/by-number/${orderNumber}`);
    return res.data;
  } catch (error: any) {
    console.error('Error tracking order:', error);
    toast.error('Order not found');
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId: number, reason?: string) => {
  try {
    const res = await instance.patch(`/orders/${orderId}/cancel`, { reason });
    toast.success('Order cancelled successfully');
    return res.data;
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    toast.error('Failed to cancel order');
    throw error;
  }
};
```

#### 2. Create Order Pages

**Order History Page (`/app/orders/page.tsx`)**

```tsx
'use client';

import { useState, useEffect } from 'react';
import { getUserOrders, Order } from '@/endpoints/order';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadOrders();
  }, [page]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getUserOrders(page, 10);
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading orders...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No orders found</p>
          <Button onClick={() => window.location.href = '/products'}>
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold">Order #{order.order_number}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor(order.status)}>
                  {order.status}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="font-medium">${order.total_amount}</p>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = `/orders/${order.id}`}
                  >
                    View Details
                  </Button>
                  {order.status === 'PENDING' && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Priority 2: Review System

### Backend Endpoints Available
- `POST /reviews` - Create review
- `GET /reviews/product/:id` - Get product reviews
- `GET /reviews/product/:id/stats` - Get rating statistics
- `POST /reviews/:id/helpful` - Mark review helpful

### Implementation Steps

#### 1. Create Review Service (`/endpoints/review.ts`)

```typescript
import instance from './instance';
import { toast } from 'react-toastify';

export interface CreateReviewDto {
  product_id: number;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
}

export interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  helpful_count: number;
  is_helpful: boolean;
}

// Create review
export const createReview = async (reviewData: CreateReviewDto) => {
  try {
    const res = await instance.post('/reviews', reviewData);
    toast.success('Review submitted successfully!');
    return res.data;
  } catch (error: any) {
    console.error('Error creating review:', error);
    toast.error(error?.response?.data?.message || 'Failed to submit review');
    throw error;
  }
};

// Get product reviews
export const getProductReviews = async (productId: number, page = 1, limit = 10) => {
  try {
    const res = await instance.get(`/reviews/product/${productId}`, {
      params: { page, limit }
    });
    return res.data;
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Get rating statistics
export const getProductRatingStats = async (productId: number) => {
  try {
    const res = await instance.get(`/reviews/product/${productId}/stats`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching rating stats:', error);
    throw error;
  }
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId: number) => {
  try {
    const res = await instance.post(`/reviews/${reviewId}/helpful`);
    toast.success('Thank you for your feedback!');
    return res.data;
  } catch (error: any) {
    console.error('Error marking review helpful:', error);
    toast.error('Failed to submit feedback');
    throw error;
  }
};
```

#### 2. Create Review Components

**Review Form Component (`/components/ReviewForm.tsx`)**

```tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createReview, CreateReviewDto } from '@/endpoints/review';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Star } from 'lucide-react';

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(5, 'Title must be at least 5 characters'),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
});

interface ReviewFormProps {
  productId: number;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: '',
      comment: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof reviewSchema>) => {
    try {
      setSubmitting(true);
      await createReview({
        product_id: productId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
      });
      form.reset();
      setRating(0);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 cursor-pointer ${
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
              onClick={() => {
                setRating(star);
                form.setValue('rating', star);
              }}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Title</label>
        <Input
          {...form.register('title')}
          placeholder="Summarize your review"
        />
        {form.formState.errors.title && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Review</label>
        <Textarea
          {...form.register('comment')}
          placeholder="Share your experience with this product"
          rows={4}
        />
        {form.formState.errors.comment && (
          <p className="text-red-500 text-sm mt-1">
            {form.formState.errors.comment.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={submitting || rating === 0}>
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
}
```

---

## Priority 3: User Management Enhancement

### Backend Endpoints Available
- `GET /user` - Get all users (admin)
- `GET /user/search` - Search users
- `GET /user/:id` - Get user by ID
- `PUT /user/:id` - Update user
- `DELETE /user/:id` - Delete user
- `PUT /user/:id/block` - Block user

### Implementation Steps

#### 1. Enhance User Service (`/endpoints/user.ts`)

```typescript
import instance from './instance';
import { toast } from 'react-toastify';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  avatar?: string;
  is_active: boolean;
  created_at: string;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
}

// Get user profile
export const getUserProfile = async (userId: number) => {
  try {
    const res = await instance.get(`/user/${userId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    toast.error('Failed to load user profile');
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (userId: number, userData: UpdateUserDto, image?: File) => {
  try {
    const formData = new FormData();
    
    Object.entries(userData).forEach(([key, value]) => {
      if (value !== undefined) {
        formData.append(key, value);
      }
    });
    
    if (image) {
      formData.append('image', image);
    }

    const res = await instance.put(`/user/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    toast.success('Profile updated successfully!');
    return res.data;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    toast.error(error?.response?.data?.message || 'Failed to update profile');
    throw error;
  }
};

// Search users (admin only)
export const searchUsers = async (query: string, page = 1, limit = 10) => {
  try {
    const res = await instance.get('/user/search', {
      params: { query, page, limit }
    });
    return res.data;
  } catch (error: any) {
    console.error('Error searching users:', error);
    toast.error('Failed to search users');
    throw error;
  }
};

// Block user (admin only)
export const blockUser = async (userId: number) => {
  try {
    const res = await instance.put(`/user/${userId}/block`);
    toast.success('User blocked successfully');
    return res.data;
  } catch (error: any) {
    console.error('Error blocking user:', error);
    toast.error('Failed to block user');
    throw error;
  }
};

// Delete user (admin only)
export const deleteUser = async (userId: number) => {
  try {
    const res = await instance.delete(`/user/${userId}`);
    toast.success('User deleted successfully');
    return res.data;
  } catch (error: any) {
    console.error('Error deleting user:', error);
    toast.error('Failed to delete user');
    throw error;
  }
};
```

---

## Implementation Timeline

### Week 1: Order Management
- [ ] Create order service and types
- [ ] Implement order creation flow
- [ ] Add order history page
- [ ] Implement order tracking

### Week 2: Review System
- [ ] Create review service and components
- [ ] Add review form to product pages
- [ ] Implement review display and rating
- [ ] Add review moderation for admins

### Week 3: User Management
- [ ] Enhance user profile functionality
- [ ] Add user search for admins
- [ ] Implement user management actions
- [ ] Add user blocking/deletion features

### Week 4: Integration & Testing
- [ ] End-to-end testing
- [ ] Error handling improvements
- [ ] Performance optimization
- [ ] Documentation updates

---

## Testing Checklist

### Order Management
- [ ] Create order with cart items
- [ ] View order history
- [ ] Track order status
- [ ] Cancel pending orders
- [ ] Admin order management

### Review System
- [ ] Submit product reviews
- [ ] Display reviews on product pages
- [ ] Rate review helpfulness
- [ ] Admin review moderation

### User Management
- [ ] Update user profile
- [ ] Upload profile image
- [ ] Admin user search
- [ ] Block/unblock users
- [ ] Delete user accounts

---

## Security Considerations

1. **Authentication**: Ensure all endpoints require proper authentication
2. **Authorization**: Implement role-based access control
3. **Input Validation**: Validate all user inputs on both frontend and backend
4. **File Upload Security**: Implement proper file type and size validation
5. **Rate Limiting**: Add rate limiting for sensitive operations
6. **Data Privacy**: Ensure user data is properly protected and GDPR compliant

---

## Performance Optimization

1. **Pagination**: Implement proper pagination for all list endpoints
2. **Caching**: Add caching for frequently accessed data
3. **Image Optimization**: Optimize image uploads and display
4. **Lazy Loading**: Implement lazy loading for large lists
5. **Error Boundaries**: Add proper error boundaries for better UX

This implementation guide provides a comprehensive roadmap for connecting the missing backend functionality to your frontend application. Follow the priority order and timeline for the most efficient development process.
