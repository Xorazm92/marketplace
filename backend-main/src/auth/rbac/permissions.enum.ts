export enum Permission {
  // Dashboard permissions
  VIEW_DASHBOARD = 'view_dashboard',
  VIEW_ANALYTICS = 'view_analytics',

  // User management permissions
  VIEW_USERS = 'view_users',
  CREATE_USER = 'create_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  BLOCK_USER = 'block_user',
  UNBLOCK_USER = 'unblock_user',

  // Product management permissions
  VIEW_PRODUCTS = 'view_products',
  CREATE_PRODUCT = 'create_product',
  UPDATE_PRODUCT = 'update_product',
  DELETE_PRODUCT = 'delete_product',
  APPROVE_PRODUCT = 'approve_product',
  REJECT_PRODUCT = 'reject_product',
  FEATURE_PRODUCT = 'feature_product',

  // Order management permissions
  VIEW_ORDERS = 'view_orders',
  UPDATE_ORDER_STATUS = 'update_order_status',
  CANCEL_ORDER = 'cancel_order',
  REFUND_ORDER = 'refund_order',

  // Category management permissions
  VIEW_CATEGORIES = 'view_categories',
  CREATE_CATEGORY = 'create_category',
  UPDATE_CATEGORY = 'update_category',
  DELETE_CATEGORY = 'delete_category',

  // Brand management permissions
  VIEW_BRANDS = 'view_brands',
  CREATE_BRAND = 'create_brand',
  UPDATE_BRAND = 'update_brand',
  DELETE_BRAND = 'delete_brand',

  // Review management permissions
  VIEW_REVIEWS = 'view_reviews',
  MODERATE_REVIEWS = 'moderate_reviews',
  DELETE_REVIEW = 'delete_review',

  // Admin management permissions (only for super admin)
  VIEW_ADMINS = 'view_admins',
  CREATE_ADMIN = 'create_admin',
  UPDATE_ADMIN = 'update_admin',
  DELETE_ADMIN = 'delete_admin',
  ASSIGN_ROLES = 'assign_roles',

  // System settings permissions
  VIEW_SETTINGS = 'view_settings',
  UPDATE_SETTINGS = 'update_settings',
  MANAGE_NOTIFICATIONS = 'manage_notifications',

  // Report permissions
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data',

  // Chat moderation permissions
  VIEW_CHATS = 'view_chats',
  MODERATE_CHATS = 'moderate_chats',
  DELETE_CHAT_MESSAGE = 'delete_chat_message',

  // Payment management permissions
  VIEW_PAYMENTS = 'view_payments',
  PROCESS_REFUNDS = 'process_refunds',
  VIEW_FINANCIAL_REPORTS = 'view_financial_reports',
}

// Role-based permission mapping
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: [
    // Dashboard
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,

    // Users
    Permission.VIEW_USERS,
    Permission.CREATE_USER,
    Permission.UPDATE_USER,
    Permission.DELETE_USER,
    Permission.BLOCK_USER,
    Permission.UNBLOCK_USER,

    // Products
    Permission.VIEW_PRODUCTS,
    Permission.CREATE_PRODUCT,
    Permission.UPDATE_PRODUCT,
    Permission.DELETE_PRODUCT,
    Permission.APPROVE_PRODUCT,
    Permission.REJECT_PRODUCT,
    Permission.FEATURE_PRODUCT,

    // Orders
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.CANCEL_ORDER,
    Permission.REFUND_ORDER,

    // Categories
    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORY,
    Permission.UPDATE_CATEGORY,
    Permission.DELETE_CATEGORY,

    // Brands
    Permission.VIEW_BRANDS,
    Permission.CREATE_BRAND,
    Permission.UPDATE_BRAND,
    Permission.DELETE_BRAND,

    // Reviews
    Permission.VIEW_REVIEWS,
    Permission.MODERATE_REVIEWS,
    Permission.DELETE_REVIEW,

    // Admins
    Permission.VIEW_ADMINS,
    Permission.CREATE_ADMIN,
    Permission.UPDATE_ADMIN,
    Permission.DELETE_ADMIN,
    Permission.ASSIGN_ROLES,

    // Settings
    Permission.VIEW_SETTINGS,
    Permission.UPDATE_SETTINGS,
    Permission.MANAGE_NOTIFICATIONS,

    // Reports
    Permission.VIEW_REPORTS,
    Permission.EXPORT_DATA,

    // Chat
    Permission.VIEW_CHATS,
    Permission.MODERATE_CHATS,
    Permission.DELETE_CHAT_MESSAGE,

    // Payments
    Permission.VIEW_PAYMENTS,
    Permission.PROCESS_REFUNDS,
    Permission.VIEW_FINANCIAL_REPORTS,
  ],

  ADMIN: [
    // Dashboard
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_ANALYTICS,

    // Users
    Permission.VIEW_USERS,
    Permission.UPDATE_USER,
    Permission.BLOCK_USER,
    Permission.UNBLOCK_USER,

    // Products
    Permission.VIEW_PRODUCTS,
    Permission.UPDATE_PRODUCT,
    Permission.APPROVE_PRODUCT,
    Permission.REJECT_PRODUCT,
    Permission.FEATURE_PRODUCT,

    // Orders
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDER_STATUS,
    Permission.CANCEL_ORDER,
    Permission.REFUND_ORDER,

    // Categories
    Permission.VIEW_CATEGORIES,
    Permission.CREATE_CATEGORY,
    Permission.UPDATE_CATEGORY,

    // Brands
    Permission.VIEW_BRANDS,
    Permission.CREATE_BRAND,
    Permission.UPDATE_BRAND,

    // Reviews
    Permission.VIEW_REVIEWS,
    Permission.MODERATE_REVIEWS,
    Permission.DELETE_REVIEW,

    // Settings
    Permission.VIEW_SETTINGS,

    // Reports
    Permission.VIEW_REPORTS,

    // Chat
    Permission.VIEW_CHATS,
    Permission.MODERATE_CHATS,
    Permission.DELETE_CHAT_MESSAGE,

    // Payments
    Permission.VIEW_PAYMENTS,
    Permission.PROCESS_REFUNDS,
  ],

  MODERATOR: [
    // Dashboard
    Permission.VIEW_DASHBOARD,

    // Users
    Permission.VIEW_USERS,

    // Products
    Permission.VIEW_PRODUCTS,
    Permission.APPROVE_PRODUCT,
    Permission.REJECT_PRODUCT,

    // Orders
    Permission.VIEW_ORDERS,
    Permission.UPDATE_ORDER_STATUS,

    // Categories
    Permission.VIEW_CATEGORIES,

    // Brands
    Permission.VIEW_BRANDS,

    // Reviews
    Permission.VIEW_REVIEWS,
    Permission.MODERATE_REVIEWS,
    Permission.DELETE_REVIEW,

    // Chat
    Permission.VIEW_CHATS,
    Permission.MODERATE_CHATS,
    Permission.DELETE_CHAT_MESSAGE,
  ],
};
