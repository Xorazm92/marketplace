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
    const defaultCategories = [
        { name: "O'yinchoqlar", slug: "oyinchoqlar", description: "Bolalar uchun rivojlantiruvchi va qiziqarli o'yinchoqlar", icon: "fas fa-puzzle-piece" },
        { name: "Kiyim-kechak", slug: "kiyim-kechak", description: "Chaqaloqlar va bolalar uchun kiyimlar", icon: "fas fa-tshirt" },
        { name: "Bolalar kitoblari", slug: "bolalar-kitoblari", description: "Bolalar uchun foydali va qiziqarli kitoblar", icon: "fas fa-book" },
        { name: "Ijodiy to'plamlar", slug: "ijodiy-toplamlar", description: "Bolalarning ijodiy qobiliyatini rivojlantirish uchun to'plamlar", icon: "fas fa-paint-brush" },
    ];

    const categoryIds: { [key: string]: number } = {};
    for (const category of defaultCategories) {
      const created = await this.createCategory(category);
      categoryIds[category.slug] = created.id;
    }

    const sampleProducts = [
        { name: "Rangli qog'oz to'plami", description: "Bolalar ijodi uchun 10 xil rangdagi yorqin qog'ozlar.", price: "25000.00", originalPrice: "30000.00", categoryId: categoryIds['ijodiy-toplamlar'], sellerId: 'system', stock: 50, isActive: true, isApproved: true, images: ['/products/rangli-qogoz.jpg'], viewCount: 0 },
        { name: "Plastilin to'plami", description: "Bolalar uchun turli xil rangdagi plastilinlar to'plami", price: "35000.00", originalPrice: "40000.00", categoryId: categoryIds['oyinchoqlar'], sellerId: 'system', stock: 20, isActive: true, isApproved: true, images: ['/products/plastilin.jpg'], viewCount: 0 },
        { name: "Aqlli konstruktor", description: "Mayda motorikani rivojlantiruvchi aqlli konstruktor.", price: "150000.00", originalPrice: "180000.00", categoryId: categoryIds['oyinchoqlar'], sellerId: 'system', stock: 15, isActive: true, isApproved: true, images: ['/products/konstruktor.jpg'], viewCount: 0 },
        { name: "Sehrli ertaklar kitobi", description: "Bolalar uchun qiziqarli va foydali ertaklar to'plami", price: "60000.00", originalPrice: "70000.00", categoryId: categoryIds['bolalar-kitoblari'], sellerId: 'system', stock: 30, isActive: true, isApproved: true, images: ['/products/ertaklar-kitobi.jpg'], viewCount: 0 },
        { name: "Yog'ochli jumboq", description: "Mantiqiy fikrlashni o'stiruvchi yog'ochli jumboq.", price: "45000.00", originalPrice: "50000.00", categoryId: categoryIds['oyinchoqlar'], sellerId: 'system', stock: 40, isActive: true, isApproved: true, images: ['/products/jumboq.jpg'], viewCount: 0 },
    ];

    for (const product of sampleProducts) {
      await this.createProduct(product as InsertProduct);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(user: RegisterUser): Promise<User> {
    const existingUser = await this.getUserByEmail(user.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const hashedPassword = await bcrypt.hash(user.password, 10);
    
    const newUser: User = {
      ...users.$inferSelect.parse({}), // default values
      id: crypto.randomUUID(),
      email: user.email,
      password: hashedPassword,
      fullName: user.fullName,
      role: user.role || 'buyer',
      createdAt: new Date(),
      updatedAt: new Date(),
      isApproved: user.role !== 'seller', // Auto-approve buyers
    };

    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (!userData.id) {
      throw new Error("User ID is required for upsert");
    }
    let user = this.users.get(userData.id);
    if (user) {
      const updatedUser = { ...user, ...userData, updatedAt: new Date() };
      this.users.set(userData.id, updatedUser);
      return updatedUser;
    } else {
      const newUser: User = {
        ...users.$inferSelect.parse(userData),
        id: userData.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.users.set(newUser.id, newUser);
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
    const category: Category = {
      id,
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description || null,
      parentId: categoryData.parentId || null,
      icon: categoryData.icon || null,
      isActive: categoryData.isActive ?? true,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  // Product operations
  async getProducts(filters: any = {}): Promise<Product[]> {
    let productList = Array.from(this.products.values());

    if (filters.categoryId) {
      productList = productList.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters.sellerId) {
      productList = productList.filter(p => p.sellerId === filters.sellerId);
    }
    if (filters.isActive !== undefined) {
      productList = productList.filter(p => p.isActive === filters.isActive);
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      productList = productList.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      );
    }

    return productList.slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || 10));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const product = this.products.get(id);
    if(product) {
        const updatedProduct = { ...product, viewCount: (product.viewCount || 0) + 1 };
        this.products.set(id, updatedProduct);
        return updatedProduct;
    }
    return product;
  }

  async createProduct(productData: InsertProduct): Promise<Product> {
    const id = this.nextProductId++;
    const product: Product = {
      ...products.$inferSelect.parse(productData),
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const product = this.products.get(id);
    if (!product) throw new Error("Product not found");
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
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

  async createOrder(orderData: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.nextOrderId++;
    const order: Order = {
      id,
      userId: orderData.userId,
      status: orderData.status || 'pending',
      totalAmount: orderData.totalAmount,
      shippingAddress: orderData.shippingAddress,
      paymentStatus: orderData.paymentStatus || null,
      orderNumber: orderData.orderNumber,
      notes: orderData.notes || null,
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
        productId: itemData.productId,
        quantity: itemData.quantity,
        price: itemData.price,
        productName: itemData.productName,
        sellerId: itemData.sellerId,
        variantId: itemData.variantId || null,
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
    
    const orderIds = Array.from(new Set(sellerOrderItems.map(item => item.orderId)));
    
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

