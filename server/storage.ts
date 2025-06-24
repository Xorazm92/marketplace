import crypto from 'crypto';
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
  type RegisterUser,
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

import bcrypt from 'bcrypt';

// The main interface for all storage operations
export interface Storage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: RegisterUser): Promise<User>;
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
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order & { items: (OrderItem & {product: Product})[] }>;
  getOrders(userId: string): Promise<Order[]>;
  getOrder(id: number): Promise<(Order & { items: (OrderItem & {product: Product})[] }) | undefined>;
  updateOrderStatus(id: number, status: string): Promise<Order>;
  getOrdersByseller(sellerId: string): Promise<(Order & { items: (OrderItem & {product: Product})[] })[]>;

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

// In-memory implementation of the Storage interface
export class MemStorage implements Storage {
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

  // ID counters
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

  constructor() {}

  public async initialize() {
    if (this.categories.size > 0 || this.products.size > 0) {
      return; // Already initialized
    }
    await this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    console.log('Initializing default data...');
    console.log(`Current user count: ${this.users.size}`);
    
    // Log all existing users
    console.log('Existing users:', Array.from(this.users.values()).map(u => `${u.email} (${u.role})`));
    
    // Create default categories if they don't exist
    if (this.categories.size === 0) {
      const defaultCategories: InsertCategory[] = [
        {
          name: "Elektronika",
          slug: "electronics",
          description: "Maishiy texnika va gadjetlar",
          icon: "fas fa-laptop-code",
        },
        {
          name: "Kiyim-kechak",
          slug: "fashion",
          description: "Erkaklar, ayollar va bolalar uchun zamonaviy kiyimlar",
          icon: "fas fa-tshirt",
        },
        {
          name: "O'yinchoqlar",
          slug: "toys",
          description: "Bolalar uchun rivojlantiruvchi va qiziqarli o'yinchoqlar",
          icon: "fas fa-puzzle-piece",
        },
      ];
      for (const cat of defaultCategories) {
        await this.createCategory(cat);
      }
    }

    // Create a default admin user if no users exist
    if (this.users.size === 0) {
      const adminData: RegisterUser = {
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
      };
      const admin = await this.createUser(adminData);
      console.log('Created default admin user:', admin);
    }

    // Create a default seller if none exists
    const sellerExists = Array.from(this.users.values()).some(u => u.role === 'seller');
    if (!sellerExists) {
      const sellerData: RegisterUser = {
        email: 'seller@example.com',
        password: 'seller123',
        firstName: 'Default',
        lastName: 'Seller',
        role: 'seller',
      };
      const seller = await this.createUser(sellerData);
      console.log('Created default seller user:', seller);
    }

    // Create a default buyer if none exists
    const buyerExists = Array.from(this.users.values()).some(u => u.role === 'buyer');
    if (!buyerExists) {
      const buyerData: RegisterUser = {
        email: 'buyer@example.com',
        password: 'buyer123',
        firstName: 'Default',
        lastName: 'Buyer',
        role: 'buyer',
      };
      const buyer = await this.createUser(buyerData);
      console.log('Created default buyer user:', buyer);
    }

    // Create default products if they don't exist
    if (this.products.size === 0) {
      const seller = Array.from(this.users.values()).find(u => u.role === 'seller');
      const electronicsCat = Array.from(this.categories.values()).find(c => c.slug === 'elektronika');
      if (seller && electronicsCat) {
        const productData: InsertProduct = {
          name: 'Sample Laptop',
          description: 'A powerful laptop for all your needs.',
          price: '1200.00',
          categoryId: electronicsCat.id,
          sellerId: seller.id,
          stock: 10,
          images: ['/images/laptop1.png', '/images/laptop2.png'],
          isApproved: true,
          isActive: true,
        };
        await this.createProduct(productData);
      }
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(userData: RegisterUser): Promise<User> {
    const id = crypto.randomUUID();
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser: User = {
      id,
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName ?? null,
      lastName: userData.lastName ?? null,
      profileImageUrl: null, // Default to null as it's not in RegisterUser
      role: userData.role ?? 'buyer',
      isApproved: userData.role !== 'seller', // Buyers are auto-approved
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = userData.id ? this.users.get(userData.id) : undefined;

    if (existingUser) {
      // Update existing user
      const updatedUser: User = { ...existingUser, ...userData, updatedAt: new Date() };
      if (userData.password) {
        updatedUser.password = await bcrypt.hash(userData.password, 10);
      }
      this.users.set(existingUser.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user if ID is not provided or user does not exist
      if (!userData.password || !userData.email) {
        throw new Error("Password and email are required to create a new user.");
      }
      const id = userData.id || crypto.randomUUID();
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const newUser: User = {
        id,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName ?? null,
        lastName: userData.lastName ?? null,
        profileImageUrl: userData.profileImageUrl ?? null,
        role: userData.role ?? 'buyer',
        isApproved: userData.role !== 'seller',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(id, newUser);
      return newUser;
    }
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find((c) => c.slug === slug);
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    const id = this.nextCategoryId++;
    const newCategory: Category = {
      id,
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description ?? null,
      parentId: categoryData.parentId ?? null,
      icon: categoryData.icon ?? null,
      isActive: categoryData.isActive ?? true,
      createdAt: new Date(),
    };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  // Product operations
  async getProducts(filters: any = {}): Promise<Product[]> {
    let products = Array.from(this.products.values());
    if (filters.categoryId) {
      products = products.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters.sellerId) {
      products = products.filter((p) => p.sellerId === filters.sellerId);
    }
    if (filters.isActive) {
      products = products.filter((p) => p.isActive === filters.isActive);
    }
    if (filters.search) {
      products = products.filter((p) =>
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    return products.slice(filters.offset ?? 0, (filters.offset ?? 0) + (filters.limit ?? 10));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.nextProductId++;
    const newProduct: Product = {
      ...productData,
      id,
      isApproved: productData.isApproved ?? false,
      isActive: productData.isActive ?? true,
      description: productData.description ?? null,
      originalPrice: productData.originalPrice ?? null,
      stock: productData.stock ?? 0,
      viewCount: productData.viewCount ?? 0,
      rating: productData.rating ?? '0',
      reviewCount: productData.reviewCount ?? 0,
      images: productData.images ?? null,
      variants: productData.variants ?? null,
      specifications: productData.specifications ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
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
      return this.updateCartItem(existingItem.id, existingItem.quantity + (cartItemData.quantity || 1));
    }

    const id = this.nextCartItemId++;
    const cartItem: CartItem = {
      id,
      cartId: cartItemData.cartId,
      productId: cartItemData.productId,
      quantity: cartItemData.quantity || 1,
      variantId: cartItemData.variantId || null,
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

  async createOrder(orderData: InsertOrder, itemsData: InsertOrderItem[]): Promise<Order & { items: (OrderItem & { product: Product })[] }> {
    const orderId = this.nextOrderId++;
    const newOrder: Order = {
      ...orderData,
      id: orderId,
      status: orderData.status ?? 'pending',
      shippingAddress: orderData.shippingAddress ?? null,
      paymentStatus: orderData.paymentStatus ?? null,
      notes: orderData.notes ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(orderId, newOrder);

    const createdItems: (OrderItem & { product: Product })[] = [];
    for (const itemData of itemsData) {
      const itemId = this.nextOrderItemId++;
      const newOrderItem: OrderItem = {
        ...itemData,
        id: itemId,
        orderId: orderId,
        variantId: itemData.variantId ?? null,
      };
      this.orderItems.set(itemId, newOrderItem);
      
      const product = this.products.get(newOrderItem.productId);
      if (!product) {
        // This should ideally be a transaction that rolls back
        throw new Error(`Product with id ${newOrderItem.productId} not found for order item.`);
      }
      createdItems.push({ ...newOrderItem, product });
    }

    return { ...newOrder, items: createdItems };
  }

  async getOrders(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.userId === userId);
  }

  async getOrder(id: number): Promise<(Order & { items: (OrderItem & { product: Product })[] }) | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const items = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(item => {
        const product = this.products.get(item.productId);
        return product ? { ...item, product } : null;
      })
      .filter((item): item is OrderItem & { product: Product } => item !== null);

    return { ...order, items };
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");

    const updatedOrder = { ...order, status, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async getOrdersByseller(sellerId: string): Promise<(Order & { items: (OrderItem & { product: Product })[] })[]> {
    const sellerProducts = Array.from(this.products.values())
      .filter(p => p.sellerId === sellerId)
      .map(p => p.id);

    const relevantOrderItems = Array.from(this.orderItems.values())
      .filter(item => sellerProducts.includes(item.productId));

    const orderIds = Array.from(new Set(relevantOrderItems.map(item => item.orderId)));
    
    const sellerOrders = await Promise.all(orderIds.map(id => this.getOrder(id)));

    return sellerOrders.filter((order): order is Order & { items: (OrderItem & { product: Product })[] } => !!order);
  }

  async getWishlist(userId: string): Promise<(Wishlist & { product: Product })[]> {
    const wishlistItems = Array.from(this.wishlists.values()).filter(item => item.userId === userId);
    return wishlistItems.map(item => {
      const product = this.products.get(item.productId);
      return product ? { ...item, product } : null;
    }).filter((item): item is Wishlist & { product: Product } => item !== null);
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
      userId: reviewData.userId,
      productId: reviewData.productId,
      rating: reviewData.rating,
      comment: reviewData.comment || null,
      orderId: reviewData.orderId || null,
      isApproved: reviewData.isApproved || null,
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
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message || null,
      isRead: notificationData.isRead || null,
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
      senderId: messageData.senderId,
      receiverId: messageData.receiverId,
      content: messageData.content,
      productId: messageData.productId || null,
      isRead: messageData.isRead || null,
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

