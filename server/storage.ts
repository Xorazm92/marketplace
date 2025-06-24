import {
  users,
  categories,
  products,
  carts,
  cartItems,
  orders,
  orderItems,
  wishlists,
  reviews,
  notifications,
  messages,
  recentlyViewed,
  promotions,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Cart,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Wishlist,
  type InsertWishlist,
  type Review,
  type InsertReview,
  type Notification,
  type InsertNotification,
  type Message,
  type InsertMessage,
  type RecentlyViewed,
  type Promotion,
} from "@shared/schema";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(filters?: {
    categoryId?: number;
    sellerId?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<Product>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  getTrendingProducts(limit?: number): Promise<Product[]>;
  getProductsBySeller(sellerId: string): Promise<Product[]>;
  
  // Cart operations
  getOrCreateCart(userId: string): Promise<Cart>;
  getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem>;
  removeFromCart(id: number): Promise<void>;
  clearCart(cartId: number): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrders(userId: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getOrdersByseller(sellerId: string): Promise<(Order & { items: OrderItem[] })[]>;
  
  // Wishlist operations
  getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]>;
  addToWishlist(wishlist: InsertWishlist): Promise<Wishlist>;
  removeFromWishlist(userId: string, productId: number): Promise<void>;
  
  // Review operations
  getProductReviews(productId: number): Promise<(Review & { user: User })[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Notification operations
  getUserNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<void>;
  
  // Message operations
  getMessages(userId: string, otherUserId: string): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  
  // Recently viewed
  addRecentlyViewed(userId: string, productId: number): Promise<void>;
  getRecentlyViewed(userId: string, limit?: number): Promise<(RecentlyViewed & { product: Product })[]>;
  
  // Admin operations
  getPendingSellers(): Promise<User[]>;
  approveSeller(userId: string): Promise<User>;
  getStats(): Promise<{
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    pendingApprovals: number;
    monthlyRevenue: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private products: Map<number, Product> = new Map();
  private carts: Map<number, Cart> = new Map();
  private cartItems: Map<number, CartItem> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  private wishlists: Map<number, Wishlist> = new Map();
  private reviews: Map<number, Review> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private messages: Map<number, Message> = new Map();
  private recentlyViewed: Map<number, RecentlyViewed> = new Map();
  private promotions: Map<number, Promotion> = new Map();
  
  private nextCategoryId = 1;
  private nextProductId = 1;
  private nextCartId = 1;
  private nextCartItemId = 1;
  private nextOrderId = 1;
  private nextOrderItemId = 1;
  private nextWishlistId = 1;
  private nextReviewId = 1;
  private nextNotificationId = 1;
  private nextMessageId = 1;
  private nextRecentlyViewedId = 1;
  private nextPromotionId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default categories
    const defaultCategories: InsertCategory[] = [
      { name: "Electronics", slug: "electronics", description: "Electronic devices and gadgets", icon: "fas fa-laptop" },
      { name: "Fashion", slug: "fashion", description: "Clothing and accessories", icon: "fas fa-tshirt" },
      { name: "Home & Garden", slug: "home-garden", description: "Home improvement and garden supplies", icon: "fas fa-home" },
      { name: "Sports", slug: "sports", description: "Sports equipment and accessories", icon: "fas fa-football-ball" },
      { name: "Books", slug: "books", description: "Books and educational materials", icon: "fas fa-book" },
      { name: "Health & Beauty", slug: "health-beauty", description: "Health and beauty products", icon: "fas fa-heart" },
    ];

    defaultCategories.forEach(category => {
      this.createCategory(category);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id);
    const user: User = {
      ...userData,
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.isActive);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.nextCategoryId++;
    const category: Category = {
      id,
      ...categoryData,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async getProducts(filters: {
    categoryId?: number;
    sellerId?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<Product[]> {
    let products = Array.from(this.products.values());

    if (filters.categoryId) {
      products = products.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters.sellerId) {
      products = products.filter(p => p.sellerId === filters.sellerId);
    }
    if (filters.isActive !== undefined) {
      products = products.filter(p => p.isActive === filters.isActive);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      products = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      );
    }

    const offset = filters.offset || 0;
    const limit = filters.limit || products.length;
    
    return products.slice(offset, offset + limit);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.nextProductId++;
    const product: Product = {
      id,
      ...productData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const existing = this.products.get(id);
    if (!existing) throw new Error("Product not found");
    
    const updated: Product = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.products.set(id, updated);
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    this.products.delete(id);
  }

  async getTrendingProducts(limit: number = 4): Promise<Product[]> {
    const products = Array.from(this.products.values())
      .filter(p => p.isActive && p.isApproved)
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    
    return products.slice(0, limit);
  }

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.sellerId === sellerId);
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    const existingCart = Array.from(this.carts.values()).find(c => c.userId === userId);
    if (existingCart) return existingCart;

    const id = this.nextCartId++;
    const cart: Cart = {
      id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.carts.set(id, cart);
    return cart;
  }

  async getCartItems(cartId: number): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(item => item.cartId === cartId);
    return items.map(item => ({
      ...item,
      product: this.products.get(item.productId)!,
    })).filter(item => item.product);
  }

  async addToCart(cartItemData: InsertCartItem): Promise<CartItem> {
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.cartId === cartItemData.cartId && 
              item.productId === cartItemData.productId &&
              item.variantId === cartItemData.variantId
    );

    if (existingItem) {
      return this.updateCartItem(existingItem.id, existingItem.quantity + cartItemData.quantity);
    }

    const id = this.nextCartItemId++;
    const cartItem: CartItem = {
      id,
      ...cartItemData,
      addedAt: new Date(),
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem> {
    const existing = this.cartItems.get(id);
    if (!existing) throw new Error("Cart item not found");
    
    const updated: CartItem = { ...existing, quantity };
    this.cartItems.set(id, updated);
    return updated;
  }

  async removeFromCart(id: number): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(cartId: number): Promise<void> {
    const itemsToDelete = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.cartId === cartId)
      .map(([id, _]) => id);
    
    itemsToDelete.forEach(id => this.cartItems.delete(id));
  }

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.nextOrderId++;
    const order: Order = {
      id,
      ...orderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);

    // Add order items
    items.forEach(itemData => {
      const itemId = this.nextOrderItemId++;
      const orderItem: OrderItem = {
        id: itemId,
        orderId: id,
        ...itemData,
      };
      this.orderItems.set(itemId, orderItem);
    });

    return order;
  }

  async getOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const existing = this.orders.get(id);
    if (!existing) throw new Error("Order not found");
    
    const updated: Order = {
      ...existing,
      status,
      updatedAt: new Date(),
    };
    this.orders.set(id, updated);
    return updated;
  }

  async getOrdersByseller(sellerId: string): Promise<(Order & { items: OrderItem[] })[]> {
    const sellerOrderItems = Array.from(this.orderItems.values())
      .filter(item => item.sellerId === sellerId);
    
    const orderIds = [...new Set(sellerOrderItems.map(item => item.orderId))];
    
    return orderIds.map(orderId => {
      const order = this.orders.get(orderId)!;
      const items = sellerOrderItems.filter(item => item.orderId === orderId);
      return { ...order, items };
    });
  }

  async getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]> {
    const wishlistItems = Array.from(this.wishlists.values()).filter(item => item.userId === userId);
    return wishlistItems.map(item => ({
      ...item,
      product: this.products.get(item.productId)!,
    })).filter(item => item.product);
  }

  async addToWishlist(wishlistData: InsertWishlist): Promise<Wishlist> {
    const id = this.nextWishlistId++;
    const wishlist: Wishlist = {
      id,
      ...wishlistData,
      addedAt: new Date(),
    };
    this.wishlists.set(id, wishlist);
    return wishlist;
  }

  async removeFromWishlist(userId: string, productId: number): Promise<void> {
    const itemToDelete = Array.from(this.wishlists.entries())
      .find(([_, item]) => item.userId === userId && item.productId === productId);
    
    if (itemToDelete) {
      this.wishlists.delete(itemToDelete[0]);
    }
  }

  async getProductReviews(productId: number): Promise<(Review & { user: User })[]> {
    const reviews = Array.from(this.reviews.values())
      .filter(review => review.productId === productId && review.isApproved);
    
    return reviews.map(review => ({
      ...review,
      user: this.users.get(review.userId)!,
    })).filter(review => review.user);
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.nextReviewId++;
    const review: Review = {
      id,
      ...reviewData,
      createdAt: new Date(),
    };
    this.reviews.set(id, review);
    return review;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.nextNotificationId++;
    const notification: Notification = {
      id,
      ...notificationData,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      this.notifications.set(id, { ...notification, isRead: true });
    }
  }

  async getMessages(userId: string, otherUserId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.senderId === userId && message.receiverId === otherUserId) ||
        (message.senderId === otherUserId && message.receiverId === userId)
      )
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async sendMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.nextMessageId++;
    const message: Message = {
      id,
      ...messageData,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async addRecentlyViewed(userId: string, productId: number): Promise<void> {
    // Remove existing entry for same user/product
    const existingEntry = Array.from(this.recentlyViewed.entries())
      .find(([_, item]) => item.userId === userId && item.productId === productId);
    
    if (existingEntry) {
      this.recentlyViewed.delete(existingEntry[0]);
    }

    const id = this.nextRecentlyViewedId++;
    const recentlyViewed: RecentlyViewed = {
      id,
      userId,
      productId,
      viewedAt: new Date(),
    };
    this.recentlyViewed.set(id, recentlyViewed);
  }

  async getRecentlyViewed(userId: string, limit: number = 10): Promise<(RecentlyViewed & { product: Product })[]> {
    const items = Array.from(this.recentlyViewed.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.viewedAt!.getTime() - a.viewedAt!.getTime())
      .slice(0, limit);

    return items.map(item => ({
      ...item,
      product: this.products.get(item.productId)!,
    })).filter(item => item.product);
  }

  async getPendingSellers(): Promise<User[]> {
    return Array.from(this.users.values())
      .filter(user => user.role === 'seller' && !user.isApproved);
  }

  async approveSeller(userId: string): Promise<User> {
    const user = this.users.get(userId);
    if (!user) throw new Error("User not found");
    
    const updated: User = { ...user, isApproved: true, updatedAt: new Date() };
    this.users.set(userId, updated);
    return updated;
  }

  async getStats(): Promise<{
    totalUsers: number;
    totalSellers: number;
    totalProducts: number;
    pendingApprovals: number;
    monthlyRevenue: number;
  }> {
    const users = Array.from(this.users.values());
    const totalUsers = users.length;
    const totalSellers = users.filter(u => u.role === 'seller' && u.isApproved).length;
    const totalProducts = Array.from(this.products.values()).length;
    const pendingApprovals = users.filter(u => u.role === 'seller' && !u.isApproved).length;
    
    // Calculate monthly revenue from recent orders
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthlyOrders = Array.from(this.orders.values())
      .filter(order => order.createdAt! >= monthStart);
    
    const monthlyRevenue = monthlyOrders.reduce((sum, order) => 
      sum + parseFloat(order.totalAmount.toString()), 0
    );

    return {
      totalUsers,
      totalSellers,
      totalProducts,
      pendingApprovals,
      monthlyRevenue,
    };
  }
}

export const storage = new MemStorage();
