import { io, Socket } from 'socket.io-client';
import { getAuthToken } from './auth';

export class RealtimeService {
  private socket: Socket | null = null;
  private chatSocket: Socket | null = null;
  private productSocket: Socket | null = null;
  private orderSocket: Socket | null = null;

  constructor() {
    this.connect();
  }

  private connect() {
    const token = getAuthToken();
    const socketOptions = {
      auth: { token },
      transports: ['websocket', 'polling'],
    };

    // Main real-time connection
    this.socket = io('http://localhost:4000', socketOptions);
    this.chatSocket = io('http://localhost:4000/chat', socketOptions);
    this.productSocket = io('http://localhost:4000/products', socketOptions);
    this.orderSocket = io('http://localhost:4000/orders', socketOptions);

    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Connection events
    this.socket?.on('connect', () => {
      console.log('Connected to real-time server');
    });

    this.socket?.on('disconnect', () => {
      console.log('Disconnected from real-time server');
    });

    this.socket?.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Chat methods
  sendMessage(receiverId: string, message: string, conversationId?: string) {
    this.chatSocket?.emit('sendMessage', { receiverId, message, conversationId });
  }

  joinConversation(conversationId: string) {
    this.chatSocket?.emit('joinConversation', { conversationId });
  }

  onNewMessage(callback: (message: any) => void) {
    this.chatSocket?.on('newMessage', callback);
  }

  onUserTyping(callback: (data: { userId: string; isTyping: boolean }) => void) {
    this.chatSocket?.on('userTyping', callback);
  }

  // Product methods
  subscribeToProduct(productId: string) {
    this.productSocket?.emit('subscribeToProduct', { productId });
  }

  subscribeToCategory(categoryId: string) {
    this.productSocket?.emit('subscribeToCategory', { categoryId });
  }

  onProductUpdate(callback: (product: any) => void) {
    this.productSocket?.on('productUpdate', callback);
  }

  onStockUpdate(callback: (data: { productId: string; stock: number }) => void) {
    this.productSocket?.on('stockUpdate', callback);
  }

  // Order methods
  trackOrder(orderId: string) {
    this.orderSocket?.emit('trackOrder', { orderId });
  }

  subscribeToUserOrders() {
    this.orderSocket?.emit('subscribeToUserOrders');
  }

  onOrderStatusUpdate(callback: (order: any) => void) {
    this.orderSocket?.on('orderStatusUpdate', callback);
  }

  // Notification methods
  onNotification(callback: (notification: any) => void) {
    this.socket?.on('notification', callback);
  }

  // Connection management
  disconnect() {
    this.socket?.disconnect();
    this.chatSocket?.disconnect();
    this.productSocket?.disconnect();
    this.orderSocket?.disconnect();
  }

  reconnect() {
    this.disconnect();
    this.connect();
  }
}

// Usage example
export const realtimeService = new RealtimeService();
