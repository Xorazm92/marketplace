import { toast } from "react-toastify";

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

export interface Order {
  id: string;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  deliveryAddress: string;
  paymentMethod: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  image: string;
}

export interface OrderTracking {
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  location?: string;
  description: string;
}

class OrderService {
  private readonly STORAGE_KEY = 'inbola_orders';
  private readonly API_BASE = 'http://localhost:4000/api/v1';

  // Local Storage Methods
  getStoredOrders(): Order[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  saveOrder(order: Order): void {
    try {
      const orders = this.getStoredOrders();
      const existingIndex = orders.findIndex(o => o.id === order.id);
      
      if (existingIndex >= 0) {
        orders[existingIndex] = order;
      } else {
        orders.push(order);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders));
    } catch (error) {
      console.error('Error saving order:', error);
    }
  }

  // API Methods
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    try {
      const response = await fetch(`${this.API_BASE}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Buyurtma yaratishda xatolik');
      }

      const order = await response.json();
      this.saveOrder(order);
      toast.success('Buyurtma muvaffaqiyatli yaratildi!');
      return order;
    } catch (error: any) {
      console.error('Error creating order:', error);
      
      // Fallback to local storage
      const localOrder: Order = {
        ...orderData,
        id: `LOCAL_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      this.saveOrder(localOrder);
      toast.success('Buyurtma saqlandi (offline)');
      return localOrder;
    }
  }

  async getOrders(userId: number): Promise<Order[]> {
    try {
      const response = await fetch(`${this.API_BASE}/order/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Buyurtmalarni yuklashda xatolik');
      }

      const orders = await response.json();
      return orders;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return this.getStoredOrders();
    }
  }

  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const response = await fetch(`${this.API_BASE}/order/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Buyurtmani topishda xatolik');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      
      // Fallback to local storage
      const orders = this.getStoredOrders();
      return orders.find(order => order.id === orderId) || null;
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/order/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Buyurtma holatini yangilashda xatolik');
      }

      toast.success('Buyurtma holati yangilandi');
      return true;
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message);
      return false;
    }
  }

  async cancelOrder(orderId: string, reason?: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/order/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        throw new Error('Buyurtmani bekor qilishda xatolik');
      }

      toast.success('Buyurtma bekor qilindi');
      return true;
    } catch (error: any) {
      console.error('Error cancelling order:', error);
      toast.error(error.message);
      return false;
    }
  }

  async trackOrder(orderId: string): Promise<OrderTracking[]> {
    try {
      const response = await fetch(`${this.API_BASE}/order/${orderId}/tracking`);
      
      if (!response.ok) {
        throw new Error('Buyurtmani kuzatishda xatolik');
      }

      return await response.json();
    } catch (error) {
      console.error('Error tracking order:', error);
      
      // Return mock tracking data
      return this.getMockTracking(orderId);
    }
  }

  private getMockTracking(orderId: string): OrderTracking[] {
    return [
      {
        orderId,
        status: OrderStatus.PENDING,
        timestamp: new Date().toISOString(),
        description: 'Buyurtma qabul qilindi'
      },
      {
        orderId,
        status: OrderStatus.CONFIRMED,
        timestamp: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        description: 'Buyurtma tasdiqlandi'
      }
    ];
  }

  getStatusText(status: OrderStatus): string {
    const statusMap = {
      [OrderStatus.PENDING]: 'Kutilmoqda',
      [OrderStatus.CONFIRMED]: 'Tasdiqlandi',
      [OrderStatus.PROCESSING]: 'Tayyorlanmoqda',
      [OrderStatus.SHIPPED]: 'Yetkazilmoqda',
      [OrderStatus.DELIVERED]: 'Yetkazildi',
      [OrderStatus.CANCELLED]: 'Bekor qilindi'
    };
    
    return statusMap[status] || 'Noma\'lum';
  }

  getStatusColor(status: OrderStatus): string {
    const colorMap = {
      [OrderStatus.PENDING]: '#ffa500',
      [OrderStatus.CONFIRMED]: '#2196f3',
      [OrderStatus.PROCESSING]: '#ff9800',
      [OrderStatus.SHIPPED]: '#9c27b0',
      [OrderStatus.DELIVERED]: '#4caf50',
      [OrderStatus.CANCELLED]: '#f44336'
    };
    
    return colorMap[status] || '#757575';
  }

  formatOrderDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  }
}

export const orderService = new OrderService();
export default orderService;
