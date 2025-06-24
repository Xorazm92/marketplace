import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ru' | 'uz';
type Currency = 'USD' | 'EUR' | 'UZS';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  t: (key: string) => string;
  formatPrice: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Header
    'header.searchPlaceholder': 'Search products...',
    'header.dashboard': 'Dashboard',
    'header.sellerDashboard': 'Seller Dashboard',
    'header.adminPanel': 'Admin Panel',
    'header.login': 'Login',
    'header.logout': 'Logout',
    
    // Navigation
    'nav.home': 'Home',
    'nav.dashboard': 'Dashboard',
    'nav.seller': 'Seller',
    'nav.admin': 'Admin',
    
    // Categories
    'categories.electronics': 'Electronics',
    'categories.fashion': 'Fashion',
    'categories.homeGarden': 'Home & Garden',
    'categories.sports': 'Sports',
    'categories.books': 'Books',
    'categories.healthBeauty': 'Health & Beauty',
    
    // Home page
    'home.hero.title': 'Discover Global Products',
    'home.hero.subtitle': 'Connect with sellers worldwide and find unique products from every corner of the globe',
    'home.hero.startShopping': 'Start Shopping',
    'home.hero.becomeSeller': 'Become a Seller',
    'home.categories.title': 'Shop by Category',
    'home.categories.subtitle': 'Explore our diverse range of product categories',
    'home.trending.title': 'Trending Products',
    'home.trending.subtitle': 'Most popular items this week',
    'home.trending.viewAll': 'View All',
    'home.offer.title': 'Weekend Sale',
    'home.offer.subtitle': 'Get up to 50% off on selected items',
    'home.offer.deadline': 'Limited time offer - ends Sunday midnight',
    'home.offer.button': 'Shop Sale Items',
    
    // Landing page
    'landing.getStarted': 'Get Started',
    'landing.hero.title': 'Discover Global Products',
    'landing.hero.subtitle': 'Connect with sellers worldwide and find unique products from every corner of the globe',
    'landing.hero.startShopping': 'Start Shopping',
    'landing.hero.becomeSeller': 'Become a Seller',
    'landing.features.title': 'Why Choose GlobalMarket?',
    'landing.features.subtitle': 'Experience the best of international e-commerce',
    'landing.features.global.title': 'Global Reach',
    'landing.features.global.description': 'Connect with buyers and sellers from around the world',
    'landing.features.community.title': 'Trusted Community',
    'landing.features.community.description': 'Join millions of satisfied customers and verified sellers',
    'landing.features.secure.title': 'Secure Shopping',
    'landing.features.secure.description': 'Safe and secure transactions with buyer protection',
    'landing.categories.title': 'Popular Categories',
    'landing.categories.subtitle': 'Discover what you need across our diverse marketplace',
    'landing.cta.title': 'Ready to Start Shopping?',
    'landing.cta.subtitle': 'Join our global marketplace today and discover amazing products',
    'landing.cta.button': 'Join Now',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.subtotal': 'Subtotal',
    'cart.shipping': 'Shipping',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    
    // Dashboard
    'dashboard.title': 'My Dashboard',
    'dashboard.subtitle': 'Manage your account and view your activity',
    'dashboard.orders': 'Orders',
    'dashboard.wishlist': 'Wishlist',
    'dashboard.profile': 'Profile',
    'dashboard.recentOrders': 'Recent Orders',
    'dashboard.noOrders': 'No orders yet',
    'dashboard.orderNumber': 'Order',
    'dashboard.total': 'Total',
    'dashboard.viewDetails': 'View Details',
    'dashboard.noWishlistItems': 'No items in your wishlist',
    'dashboard.addToCart': 'Add to Cart',
    'dashboard.profileSettings': 'Profile Settings',
    'dashboard.firstName': 'First Name',
    'dashboard.lastName': 'Last Name',
    'dashboard.email': 'Email',
    'dashboard.role': 'Role',
    
    // Seller Dashboard
    'seller.title': 'Seller Dashboard',
    'seller.subtitle': 'Manage your products and track your sales',
    'seller.totalProducts': 'Total Products',
    'seller.totalOrders': 'Total Orders',
    'seller.monthlyRevenue': 'Monthly Revenue',
    'seller.rating': 'Rating',
    'seller.recentProducts': 'Recent Products',
    'seller.addProduct': 'Add Product',
    'seller.recentOrders': 'Recent Orders',
    'seller.noProducts': 'No products yet',
    'seller.noOrders': 'No orders yet',
    'seller.stock': 'Stock',
    'seller.edit': 'Edit',
    'seller.delete': 'Delete',
    
    // Admin Panel
    'admin.title': 'Admin Panel',
    'admin.subtitle': 'Manage users, sellers, and platform content',
    'admin.totalUsers': 'Total Users',
    'admin.totalSellers': 'Active Sellers',
    'admin.totalProducts': 'Total Products',
    'admin.pendingApprovals': 'Pending Approvals',
    'admin.monthlyRevenue': 'Monthly Revenue',
    'admin.pendingSellers': 'Pending Seller Approvals',
    'admin.recentActivity': 'Recent Activity',
    'admin.approve': 'Approve',
    'admin.reject': 'Reject',
    'admin.submitted': 'Submitted',
    
    // Category page
    'category.filters': 'Filters',
    'category.sortBy': 'Sort by',
    'category.priceRange': 'Price Range',
    'category.brands': 'Brands',
    'category.rating': 'Rating',
    'category.clearFilters': 'Clear Filters',
    'category.noProducts': 'No products found',
    'category.loadMore': 'Load More',
    
    // Footer
    'footer.description': 'Connect buyers and sellers from around the world in one trusted marketplace.',
    'footer.shop': 'Shop',
    'footer.support': 'Support',
    'footer.sell': 'Sell',
    'footer.helpCenter': 'Help Center',
    'footer.contactUs': 'Contact Us',
    'footer.shippingInfo': 'Shipping Info',
    'footer.returns': 'Returns',
    'footer.startSelling': 'Start Selling',
    'footer.sellerGuide': 'Seller Guide',
    'footer.sellerDashboard': 'Seller Dashboard',
    'footer.fees': 'Fees',
    'footer.allRightsReserved': 'All rights reserved.',
  },
  ru: {
    // Header
    'header.searchPlaceholder': 'Поиск товаров...',
    'header.dashboard': 'Панель управления',
    'header.sellerDashboard': 'Панель продавца',
    'header.adminPanel': 'Админ панель',
    'header.login': 'Войти',
    'header.logout': 'Выйти',
    
    // Navigation
    'nav.home': 'Главная',
    'nav.dashboard': 'Панель',
    'nav.seller': 'Продавец',
    'nav.admin': 'Админ',
    
    // Categories
    'categories.electronics': 'Электроника',
    'categories.fashion': 'Мода',
    'categories.homeGarden': 'Дом и сад',
    'categories.sports': 'Спорт',
    'categories.books': 'Книги',
    'categories.healthBeauty': 'Здоровье и красота',
    
    // Home page
    'home.hero.title': 'Откройте мировые товары',
    'home.hero.subtitle': 'Свяжитесь с продавцами по всему миру и найдите уникальные товары из каждого уголка планеты',
    'home.hero.startShopping': 'Начать покупки',
    'home.hero.becomeSeller': 'Стать продавцом',
    'home.categories.title': 'Покупки по категориям',
    'home.categories.subtitle': 'Исследуйте наш разнообразный ассортимент категорий товаров',
    'home.trending.title': 'Популярные товары',
    'home.trending.subtitle': 'Самые популярные товары этой недели',
    'home.trending.viewAll': 'Посмотреть все',
    'home.offer.title': 'Распродажа выходного дня',
    'home.offer.subtitle': 'Скидки до 50% на избранные товары',
    'home.offer.deadline': 'Ограниченное предложение - заканчивается в полночь воскресенья',
    'home.offer.button': 'Купить товары по акции',
    
    // Landing page
    'landing.getStarted': 'Начать',
    'landing.hero.title': 'Откройте мировые товары',
    'landing.hero.subtitle': 'Свяжитесь с продавцами по всему миру и найдите уникальные товары из каждого уголка планеты',
    'landing.hero.startShopping': 'Начать покупки',
    'landing.hero.becomeSeller': 'Стать продавцом',
    'landing.features.title': 'Почему выбирают GlobalMarket?',
    'landing.features.subtitle': 'Испытайте лучшее в международной электронной коммерции',
    'landing.features.global.title': 'Глобальный охват',
    'landing.features.global.description': 'Связывайтесь с покупателями и продавцами со всего мира',
    'landing.features.community.title': 'Доверенное сообщество',
    'landing.features.community.description': 'Присоединяйтесь к миллионам довольных клиентов и проверенных продавцов',
    'landing.features.secure.title': 'Безопасные покупки',
    'landing.features.secure.description': 'Безопасные транзакции с защитой покупателя',
    'landing.categories.title': 'Популярные категории',
    'landing.categories.subtitle': 'Откройте то, что вам нужно в нашем разнообразном маркетплейсе',
    'landing.cta.title': 'Готовы начать покупки?',
    'landing.cta.subtitle': 'Присоединяйтесь к нашему глобальному маркетплейсу сегодня и откройте удивительные товары',
    'landing.cta.button': 'Присоединиться',
    
    // Cart
    'cart.title': 'Корзина покупок',
    'cart.empty': 'Ваша корзина пуста',
    'cart.subtotal': 'Промежуточный итог',
    'cart.shipping': 'Доставка',
    'cart.total': 'Итого',
    'cart.checkout': 'Перейти к оформлению',
    
    // Dashboard
    'dashboard.title': 'Моя панель управления',
    'dashboard.subtitle': 'Управляйте своим аккаунтом и просматривайте активность',
    'dashboard.orders': 'Заказы',
    'dashboard.wishlist': 'Список желаний',
    'dashboard.profile': 'Профиль',
    'dashboard.recentOrders': 'Недавние заказы',
    'dashboard.noOrders': 'Заказов пока нет',
    'dashboard.orderNumber': 'Заказ',
    'dashboard.total': 'Итого',
    'dashboard.viewDetails': 'Подробнее',
    'dashboard.noWishlistItems': 'Нет товаров в списке желаний',
    'dashboard.addToCart': 'В корзину',
    'dashboard.profileSettings': 'Настройки профиля',
    'dashboard.firstName': 'Имя',
    'dashboard.lastName': 'Фамилия',
    'dashboard.email': 'Email',
    'dashboard.role': 'Роль',
    
    // Seller Dashboard
    'seller.title': 'Панель продавца',
    'seller.subtitle': 'Управляйте своими товарами и отслеживайте продажи',
    'seller.totalProducts': 'Всего товаров',
    'seller.totalOrders': 'Всего заказов',
    'seller.monthlyRevenue': 'Месячный доход',
    'seller.rating': 'Рейтинг',
    'seller.recentProducts': 'Недавние товары',
    'seller.addProduct': 'Добавить товар',
    'seller.recentOrders': 'Недавние заказы',
    'seller.noProducts': 'Товаров пока нет',
    'seller.noOrders': 'Заказов пока нет',
    'seller.stock': 'Склад',
    'seller.edit': 'Редактировать',
    'seller.delete': 'Удалить',
    
    // Admin Panel
    'admin.title': 'Админ панель',
    'admin.subtitle': 'Управление пользователями, продавцами и контентом платформы',
    'admin.totalUsers': 'Всего пользователей',
    'admin.totalSellers': 'Активные продавцы',
    'admin.totalProducts': 'Всего товаров',
    'admin.pendingApprovals': 'На рассмотрении',
    'admin.monthlyRevenue': 'Месячный доход',
    'admin.pendingSellers': 'Продавцы на рассмотрении',
    'admin.recentActivity': 'Недавняя активность',
    'admin.approve': 'Одобрить',
    'admin.reject': 'Отклонить',
    'admin.submitted': 'Подано',
    
    // Category page
    'category.filters': 'Фильтры',
    'category.sortBy': 'Сортировать по',
    'category.priceRange': 'Диапазон цен',
    'category.brands': 'Бренды',
    'category.rating': 'Рейтинг',
    'category.clearFilters': 'Очистить фильтры',
    'category.noProducts': 'Товары не найдены',
    'category.loadMore': 'Загрузить больше',
    
    // Footer
    'footer.description': 'Соединяем покупателей и продавцов со всего мира на одной доверенной платформе.',
    'footer.shop': 'Покупки',
    'footer.support': 'Поддержка',
    'footer.sell': 'Продавать',
    'footer.helpCenter': 'Центр помощи',
    'footer.contactUs': 'Связаться с нами',
    'footer.shippingInfo': 'Информация о доставке',
    'footer.returns': 'Возврат',
    'footer.startSelling': 'Начать продажи',
    'footer.sellerGuide': 'Руководство продавца',
    'footer.sellerDashboard': 'Панель продавца',
    'footer.fees': 'Комиссии',
    'footer.allRightsReserved': 'Все права защищены.',
  },
  uz: {
    // Header
    'header.searchPlaceholder': 'Mahsulotlarni qidiring...',
    'header.dashboard': 'Boshqaruv paneli',
    'header.sellerDashboard': 'Sotuvchi paneli',
    'header.adminPanel': 'Admin panel',
    'header.login': 'Kirish',
    'header.logout': 'Chiqish',
    
    // Navigation
    'nav.home': 'Bosh sahifa',
    'nav.dashboard': 'Panel',
    'nav.seller': 'Sotuvchi',
    'nav.admin': 'Admin',
    
    // Categories
    'categories.electronics': 'Elektronika',
    'categories.fashion': 'Moda',
    'categories.homeGarden': 'Uy va bog\'',
    'categories.sports': 'Sport',
    'categories.books': 'Kitoblar',
    'categories.healthBeauty': 'Salomatlik va go\'zallik',
    
    // Home page
    'home.hero.title': 'Jahon mahsulotlarini kashf eting',
    'home.hero.subtitle': 'Butun dunyo bo\'ylab sotuvchilar bilan bog\'laning va har bir burchakdan noyob mahsulotlarni toping',
    'home.hero.startShopping': 'Xarid qilishni boshlang',
    'home.hero.becomeSeller': 'Sotuvchi bo\'ling',
    'home.categories.title': 'Kategoriya bo\'yicha xarid qiling',
    'home.categories.subtitle': 'Bizning turli xil mahsulot kategoriyalarimizni o\'rganing',
    'home.trending.title': 'Mashhur mahsulotlar',
    'home.trending.subtitle': 'Shu hafta eng mashhur mahsulotlar',
    'home.trending.viewAll': 'Barchasini ko\'ring',
    'home.offer.title': 'Dam olish kunlari sotuvi',
    'home.offer.subtitle': 'Tanlangan mahsulotlarga 50% gacha chegirma',
    'home.offer.deadline': 'Cheklangan taklif - yakshanba yarim kechasi tugaydi',
    'home.offer.button': 'Chegirmali mahsulotlarni sotib oling',
    
    // Landing page
    'landing.getStarted': 'Boshlash',
    'landing.hero.title': 'Jahon mahsulotlarini kashf eting',
    'landing.hero.subtitle': 'Butun dunyo bo\'ylab sotuvchilar bilan bog\'laning va har bir burchakdan noyob mahsulotlarni toping',
    'landing.hero.startShopping': 'Xarid qilishni boshlang',
    'landing.hero.becomeSeller': 'Sotuvchi bo\'ling',
    'landing.features.title': 'Nega GlobalMarketni tanlaymiz?',
    'landing.features.subtitle': 'Xalqaro elektron tijoratning eng yaxshisini his qiling',
    'landing.features.global.title': 'Global yetkinlik',
    'landing.features.global.description': 'Butun dunyodagi xaridorlar va sotuvchilar bilan bog\'laning',
    'landing.features.community.title': 'Ishonchli jamiyat',
    'landing.features.community.description': 'Millionlab mamnun mijozlar va tasdiqlangan sotuvchilarga qo\'shiling',
    'landing.features.secure.title': 'Xavfsiz xarid',
    'landing.features.secure.description': 'Xaridor himoyasi bilan xavfsiz tranzaksiyalar',
    'landing.categories.title': 'Mashhur kategoriyalar',
    'landing.categories.subtitle': 'Bizning turli xil bozorimizda kerak bo\'lgan narsalarni kashf eting',
    'landing.cta.title': 'Xarid qilishni boshlashga tayyormisiz?',
    'landing.cta.subtitle': 'Bugun bizning global bozorimizga qo\'shiling va ajoyib mahsulotlarni kashf eting',
    'landing.cta.button': 'Hozir qo\'shiling',
    
    // Cart
    'cart.title': 'Xarid savati',
    'cart.empty': 'Savatingiz bo\'sh',
    'cart.subtotal': 'Oraliq jami',
    'cart.shipping': 'Yetkazib berish',
    'cart.total': 'Jami',
    'cart.checkout': 'To\'lovga o\'tish',
    
    // Dashboard
    'dashboard.title': 'Mening panelis',
    'dashboard.subtitle': 'Hisobingizni boshqaring va faoliyatingizni ko\'ring',
    'dashboard.orders': 'Buyurtmalar',
    'dashboard.wishlist': 'Istaklar ro\'yxati',
    'dashboard.profile': 'Profil',
    'dashboard.recentOrders': 'So\'nggi buyurtmalar',
    'dashboard.noOrders': 'Hali buyurtmalar yo\'q',
    'dashboard.orderNumber': 'Buyurtma',
    'dashboard.total': 'Jami',
    'dashboard.viewDetails': 'Batafsil ko\'rish',
    'dashboard.noWishlistItems': 'Istaklar ro\'yxatida mahsulotlar yo\'q',
    'dashboard.addToCart': 'Savatga qo\'shish',
    'dashboard.profileSettings': 'Profil sozlamalari',
    'dashboard.firstName': 'Ism',
    'dashboard.lastName': 'Familiya',
    'dashboard.email': 'Email',
    'dashboard.role': 'Rol',
    
    // Seller Dashboard
    'seller.title': 'Sotuvchi paneli',
    'seller.subtitle': 'Mahsulotlaringizni boshqaring va sotuvlaringizni kuzating',
    'seller.totalProducts': 'Jami mahsulotlar',
    'seller.totalOrders': 'Jami buyurtmalar',
    'seller.monthlyRevenue': 'Oylik daromad',
    'seller.rating': 'Reyting',
    'seller.recentProducts': 'So\'nggi mahsulotlar',
    'seller.addProduct': 'Mahsulot qo\'shish',
    'seller.recentOrders': 'So\'nggi buyurtmalar',
    'seller.noProducts': 'Hali mahsulotlar yo\'q',
    'seller.noOrders': 'Hali buyurtmalar yo\'q',
    'seller.stock': 'Ombor',
    'seller.edit': 'Tahrirlash',
    'seller.delete': 'O\'chirish',
    
    // Admin Panel
    'admin.title': 'Admin panel',
    'admin.subtitle': 'Foydalanuvchilar, sotuvchilar va platforma mazmunini boshqaring',
    'admin.totalUsers': 'Jami foydalanuvchilar',
    'admin.totalSellers': 'Faol sotuvchilar',
    'admin.totalProducts': 'Jami mahsulotlar',
    'admin.pendingApprovals': 'Kutilayotgan tasdiqlar',
    'admin.monthlyRevenue': 'Oylik daromad',
    'admin.pendingSellers': 'Kutilayotgan sotuvchi tasdiqlar',
    'admin.recentActivity': 'So\'nggi faoliyat',
    'admin.approve': 'Tasdiqlash',
    'admin.reject': 'Rad etish',
    'admin.submitted': 'Topshirilgan',
    
    // Category page
    'category.filters': 'Filtrlar',
    'category.sortBy': 'Saralash',
    'category.priceRange': 'Narx diapazoni',
    'category.brands': 'Brendlar',
    'category.rating': 'Reyting',
    'category.clearFilters': 'Filtrlarni tozalash',
    'category.noProducts': 'Mahsulotlar topilmadi',
    'category.loadMore': 'Ko\'proq yuklash',
    
    // Footer
    'footer.description': 'Butun dunyodagi xaridorlar va sotuvchilarni bitta ishonchli bozorda bog\'laymiz.',
    'footer.shop': 'Xarid',
    'footer.support': 'Qo\'llab-quvvatlash',
    'footer.sell': 'Sotish',
    'footer.helpCenter': 'Yordam markazi',
    'footer.contactUs': 'Biz bilan bog\'lanish',
    'footer.shippingInfo': 'Yetkazib berish ma\'lumoti',
    'footer.returns': 'Qaytarish',
    'footer.startSelling': 'Sotishni boshlash',
    'footer.sellerGuide': 'Sotuvchi qo\'llanmasi',
    'footer.sellerDashboard': 'Sotuvchi paneli',
    'footer.fees': 'To\'lovlar',
    'footer.allRightsReserved': 'Barcha huquqlar himoyalangan.',
  }
};

const currencySymbols = {
  USD: '$',
  EUR: '€',
  UZS: 'so\'m'
};

const exchangeRates = {
  USD: 1,
  EUR: 0.85,
  UZS: 12500
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    const savedCurrency = localStorage.getItem('currency') as Currency;
    
    if (savedLanguage && ['en', 'ru', 'uz'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
    
    if (savedCurrency && ['USD', 'EUR', 'UZS'].includes(savedCurrency)) {
      setCurrency(savedCurrency);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleSetCurrency = (curr: Currency) => {
    setCurrency(curr);
    localStorage.setItem('currency', curr);
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const formatPrice = (amount: number): string => {
    const convertedAmount = amount * exchangeRates[currency];
    const symbol = currencySymbols[currency];
    
    if (currency === 'UZS') {
      return `${Math.round(convertedAmount).toLocaleString()} ${symbol}`;
    }
    
    return `${symbol}${convertedAmount.toFixed(2)}`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        currency,
        setCurrency: handleSetCurrency,
        t,
        formatPrice,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
