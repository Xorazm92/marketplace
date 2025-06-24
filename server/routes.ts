import type { Express } from "express";
import { createServer, type Server } from "http";
import { type Storage } from "./storage";
import passport from "passport";
import { z } from "zod";
import {
  registerUserSchema,
  insertProductSchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertWishlistSchema,
  insertReviewSchema,
  insertMessageSchema,
  User,
} from "@shared/schema";

export function registerRoutes(app: Express, storage: Storage): Server {
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // Auth routes
  app.post('/api/register', async (req, res, next) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      req.login(user, (err) => {
        if (err) { return next(err); }
        return res.status(201).json(user);
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      if (error instanceof Error && error.message.includes("already exists")) {
        return res.status(409).json({ message: error.message });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post('/api/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: User | false, info: any) => {
      if (err) { return next(err); }
      if (!user) { return res.status(401).json({ message: info.message }); }
      req.logIn(user, (err) => {
        if (err) { return next(err); }
        return res.json(user);
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res, next) => {
    req.logout((err: any) => {
      if (err) { return next(err); }
      req.session.destroy((err: any) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to destroy session' });
        }
        res.clearCookie('connect.sid'); // Default session cookie name
        res.status(200).json({ message: 'Logged out successfully' });
      });
    });
  });


  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    // The user object is attached to the request by Passport, send it back
    res.json(req.user || null);
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:slug', async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Product routes
  app.get('/api/products', async (req, res) => {
    try {
      const filters = {
        categoryId: req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined,
        search: req.query.search as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
        isActive: true,
      };
      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/trending', async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 4;
      const products = await storage.getTrendingProducts(limit);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trending products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      // Add to recently viewed if user is authenticated
      const userId = (req.user as User)?.id;
      if (userId) {
        await storage.addRecentlyViewed(userId, productId);
      }

      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post('/api/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'seller' || !user.isApproved) {
        return res.status(403).json({ message: "Access denied" });
      }

      const productData = insertProductSchema.parse({
        ...req.body,
        sellerId: userId,
      });

      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product || product.sellerId !== userId) {
        return res.status(404).json({ message: "Product not found" });
      }

      const updated = await storage.updateProduct(productId, req.body);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete('/api/products/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product || product.sellerId !== userId) {
        return res.status(404).json({ message: "Product not found" });
      }

      await storage.deleteProduct(productId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cart = await storage.getOrCreateCart(userId);
      const items = await storage.getCartItems(cart.id);
      res.json({ cart, items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cart = await storage.getOrCreateCart(userId);
      
      const cartItemData = insertCartItemSchema.parse({
        ...req.body,
        cartId: cart.id,
      });

      const cartItem = await storage.addToCart(cartItemData);
      res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put('/api/cart/items/:id', isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      const cartItem = await storage.updateCartItem(itemId, quantity);
      res.json(cartItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/items/:id', isAuthenticated, async (req, res) => {
    try {
      const itemId = parseInt(req.params.id);
      await storage.removeFromCart(itemId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { items, shippingAddress, totalAmount } = req.body;
      
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const orderData = insertOrderSchema.parse({
        userId,
        orderNumber,
        totalAmount,
        shippingAddress,
      });

      const orderItems = items.map((item: any) => 
        insertOrderItemSchema.parse(item)
      );

      const order = await storage.createOrder(orderData, orderItems);
      
      // Clear cart after successful order
      const cart = await storage.getOrCreateCart(userId);
      await storage.clearCart(cart.id);
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orders = await storage.getOrders(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Wishlist routes
  app.get('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlist = await storage.getWishlist(userId);
      res.json(wishlist);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post('/api/wishlist', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wishlistData = insertWishlistSchema.parse({
        ...req.body,
        userId,
      });

      const wishlist = await storage.addToWishlist(wishlistData);
      res.status(201).json(wishlist);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete('/api/wishlist/:productId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.productId);
      
      await storage.removeFromWishlist(userId, productId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Review routes
  app.get('/api/products/:id/reviews', async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const reviews = await storage.getProductReviews(productId);
      res.json(reviews);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        userId,
      });

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Seller routes
  app.get('/api/seller/products', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'seller') {
        return res.status(403).json({ message: "Access denied" });
      }

      const products = await storage.getProductsBySeller(userId);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller products" });
    }
  });

  app.get('/api/seller/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'seller') {
        return res.status(403).json({ message: "Access denied" });
      }

      const orders = await storage.getOrdersByseller(userId);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch seller orders" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  app.get('/api/admin/pending-sellers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const pendingSellers = await storage.getPendingSellers();
      res.json(pendingSellers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending sellers" });
    }
  });

  app.post('/api/admin/approve-seller/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const sellerId = req.params.id;
      const approvedSeller = await storage.approveSeller(sellerId);
      res.json(approvedSeller);
    } catch (error) {
      res.status(500).json({ message: "Failed to approve seller" });
    }
  });

  // Recently viewed routes
  app.get('/api/recently-viewed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const recentlyViewed = await storage.getRecentlyViewed(userId, limit);
      res.json(recentlyViewed);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recently viewed products" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Message routes
  app.get('/api/messages/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const otherUserId = req.params.userId;
      const messages = await storage.getMessages(currentUserId, otherUserId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        senderId,
      });

      const message = await storage.sendMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
