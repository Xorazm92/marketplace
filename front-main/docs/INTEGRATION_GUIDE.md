# O'ZBEKISTON E-COMMERCE INTEGRATION GUIDE

## Barcha komponentlarni qanday ishlatish

### 1. EcommerceProvider ni qo'shish

`pages/_app.tsx` faylida:

```tsx
import { EcommerceProvider } from '../components/ecommerce/EcommerceProvider';

function MyApp({ Component, pageProps }) {
  return (
    <EcommerceProvider>
      <Component {...pageProps} />
    </EcommerceProvider>
  );
}
```

### 2. Wishlist ishlatish

```tsx
import wishlistService from '../services/wishlistService';
import { useEcommerce } from '../components/ecommerce/EcommerceProvider';

const ProductCard = ({ product }) => {
  const { isAuthenticated, refreshCounts } = useEcommerce();

  const handleWishlistToggle = async () => {
    await wishlistService.toggleWishlist({
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      slug: product.slug
    }, isAuthenticated);
    
    refreshCounts();
  };

  return (
    <button onClick={handleWishlistToggle}>
      ❤️ Sevimlilar
    </button>
  );
};
```

### 3. To'lov tizimi ishlatish

```tsx
import paymentService, { PaymentMethod } from '../services/paymentService';

const CheckoutPage = () => {
  const handlePayment = async (method: PaymentMethod) => {
    const orderData = {
      orderId: `ORDER_${Date.now()}`,
      amount: 45000 * 100, // tiyin da
      description: 'INBOLA buyurtma',
      returnUrl: `${window.location.origin}/checkout/success`,
      customerPhone: '+998901234567'
    };

    const result = await paymentService.initiatePayment(method, orderData);
    
    if (result.success && result.redirectUrl) {
      window.location.href = result.redirectUrl;
    }
  };

  return (
    <div>
      <button onClick={() => handlePayment(PaymentMethod.CLICK)}>
        Click orqali to'lash
      </button>
      <button onClick={() => handlePayment(PaymentMethod.PAYME)}>
        Payme orqali to'lash
      </button>
    </div>
  );
};
```

### 4. Manzil tizimi ishlatish

```tsx
import addressService from '../services/addressService';

const AddressForm = () => {
  const [regions] = useState(addressService.getRegions());
  const [selectedRegion, setSelectedRegion] = useState(0);
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    if (selectedRegion > 0) {
      const regionDistricts = addressService.getDistrictsByRegion(selectedRegion);
      setDistricts(regionDistricts);
    }
  }, [selectedRegion]);

  const handleSave = () => {
    const address = {
      regionId: selectedRegion,
      districtId: selectedDistrict,
      street: 'Amir Temur ko\'chasi',
      house: '15A',
      phone: '+998901234567',
      recipientName: 'Akmal Karimov',
      isDefault: true
    };

    const savedAddress = addressService.saveAddress(address);
    console.log('Manzil saqlandi:', savedAddress);
  };

  return (
    <form>
      <select onChange={(e) => setSelectedRegion(Number(e.target.value))}>
        <option value={0}>Viloyatni tanlang</option>
        {regions.map(region => (
          <option key={region.id} value={region.id}>
            {region.nameUz}
          </option>
        ))}
      </select>
      
      <select disabled={districts.length === 0}>
        <option value={0}>Tumanni tanlang</option>
        {districts.map(district => (
          <option key={district.id} value={district.id}>
            {district.nameUz}
          </option>
        ))}
      </select>
    </form>
  );
};
```

### 5. Order tracking ishlatish

```tsx
import orderService, { OrderStatus } from '../services/orderService';

const OrderTrackingPage = ({ orderId }) => {
  const [order, setOrder] = useState(null);
  const [tracking, setTracking] = useState([]);

  useEffect(() => {
    loadOrderData();
  }, [orderId]);

  const loadOrderData = async () => {
    const [orderData, trackingData] = await Promise.all([
      orderService.getOrderById(orderId),
      orderService.trackOrder(orderId)
    ]);

    setOrder(orderData);
    setTracking(trackingData);
  };

  const handleCancel = async () => {
    const success = await orderService.cancelOrder(orderId);
    if (success) {
      setOrder(prev => ({ ...prev, status: OrderStatus.CANCELLED }));
    }
  };

  return (
    <div>
      <h1>Buyurtma #{orderId}</h1>
      <p>Holat: {orderService.getStatusText(order?.status)}</p>
      
      {order?.status === OrderStatus.PENDING && (
        <button onClick={handleCancel}>
          Buyurtmani bekor qilish
        </button>
      )}
    </div>
  );
};
```

### 6. Notification ishlatish

```tsx
import notificationService, { NotificationType } from '../services/notificationService';

const OrderConfirmation = ({ orderId, phone }) => {
  useEffect(() => {
    // Buyurtma tasdiqlanganda notification yuborish
    notificationService.notifyOrderConfirmed(orderId, phone);
  }, [orderId]);

  return <div>Buyurtma tasdiqlandi!</div>;
};

// Push notification permission so'rash
const App = () => {
  useEffect(() => {
    notificationService.requestPermission();
  }, []);
};
```

### 7. Environment Variables

`.env.local` faylida:

```env
# Payment Gateways
NEXT_PUBLIC_CLICK_MERCHANT_ID=your_click_merchant_id
NEXT_PUBLIC_PAYME_MERCHANT_ID=your_payme_merchant_id
NEXT_PUBLIC_UZUM_API_KEY=your_uzum_api_key

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SMS Gateway
NEXT_PUBLIC_SMS_API_KEY=your_sms_api_key
```

### 8. CSS Styling

Barcha komponentlar uchun SCSS modullar yaratilgan:

```scss
// Checkout page styling
@import '../styles/Checkout.module.scss';

// Wishlist styling
@import '../components/profile/WishlistPage.module.scss';

// Order tracking styling
.order-tracking {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
```

### 9. TypeScript Types

Barcha service'lar uchun type'lar export qilingan:

```tsx
import { 
  WishlistItem,
  PaymentMethod, 
  PaymentRequest,
  Address,
  Order,
  OrderStatus,
  NotificationType 
} from '../services/';
```

### 10. Testing

Har bir service uchun test funksiyalari:

```tsx
// Wishlist test
const testWishlist = async () => {
  const item = await wishlistService.addToLocalWishlist({
    productId: 123,
    title: 'Test mahsulot',
    price: 45000,
    image: '/test.jpg',
    slug: 'test-product'
  });
  console.log('Wishlist item:', item);
};

// Payment test
const testPayment = async () => {
  const result = await paymentService.initiatePayment(PaymentMethod.CLICK, {
    orderId: 'TEST_123',
    amount: 100000,
    description: 'Test to\'lov',
    returnUrl: 'http://localhost:3000/success'
  });
  console.log('Payment result:', result);
};
```

Bu integration guide orqali barcha e-commerce funksiyalarni osongina ishlatishingiz mumkin!
