import React, { useState, useEffect, useRef } from 'react';
import {
  FiShoppingCart,
  FiTruck,
  FiCreditCard,
  FiCheckCircle,
  FiArrowLeft,
  FiArrowRight,
  FiLock,
  FiShield,
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiEdit3,
  FiTrash2,
  FiSmartphone,
  FiWifi
} from 'react-icons/fi';
import {
  MdSecurity,
  MdLocalShipping,
  MdPayment,
  MdVerifiedUser,
  MdChildCare,
  MdHttps,
  MdTouchApp,
  MdFingerprint
} from 'react-icons/md';
import { FaPaypal, FaCreditCard, FaApplePay, FaGooglePay } from 'react-icons/fa';
import { TrustBadge } from '../common/TrustBadges';
import styles from './EnhancedCheckoutFlow.module.scss';

interface CartItem {
  id: number;
  title: string;
  image: string;
  price: number;
  quantity: number;
  seller: string;
  shipping: number;
  ageRange: string;
  safetyRating: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  isDefault: boolean;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'paypal' | 'apple' | 'google' | 'bank';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  email?: string;
  isDefault: boolean;
}

interface EnhancedCheckoutFlowProps {
  cartItems: CartItem[];
  savedAddresses: ShippingAddress[];
  savedPaymentMethods: PaymentMethod[];
  onUpdateCart?: (items: CartItem[]) => void;
  onCompleteOrder?: (orderData: any) => void;
}

const EnhancedCheckoutFlow: React.FC<EnhancedCheckoutFlowProps> = ({
  cartItems,
  savedAddresses,
  savedPaymentMethods,
  onUpdateCart,
  onCompleteOrder
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [cart, setCart] = useState<CartItem[]>(cartItems);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [parentalApproval, setParentalApproval] = useState<'pending' | 'approved' | 'not_required'>('not_required');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [sslVerified, setSslVerified] = useState(true);
  const [touchEnabled, setTouchEnabled] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Detect mobile and touch capabilities
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      setTouchEnabled('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Verify SSL connection
    setSslVerified(window.location.protocol === 'https:');
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const steps = [
    { id: 1, title: 'Savat', icon: <FiShoppingCart />, completed: false },
    { id: 2, title: 'Yetkazib berish', icon: <FiTruck />, completed: false },
    { id: 3, title: 'To\\'lov', icon: <FiCreditCard />, completed: false },
    { id: 4, title: 'Tasdiqlash', icon: <FiCheckCircle />, completed: false }
  ];

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingTotal = cart.reduce((sum, item) => sum + item.shipping, 0);
  const discount = subtotal * (promoDiscount / 100);
  const total = subtotal + shippingTotal - discount;

  // Check if order needs parental approval
  useEffect(() => {
    const needsApproval = total > 100000; // 100,000 so'm threshold
    if (needsApproval && parentalApproval === 'not_required') {
      setParentalApproval('pending');
    }
  }, [total, parentalApproval]);

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    
    const updatedCart = cart.map(item => 
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    onUpdateCart?.(updatedCart);
  };

  const removeItem = (itemId: number) => {
    const updatedCart = cart.filter(item => item.id !== itemId);
    setCart(updatedCart);
    onUpdateCart?.(updatedCart);
  };

  const applyPromoCode = () => {
    // Mock promo code validation
    const validPromoCodes: Record<string, number> = {
      'INBOLA10': 10,
      'PARENT15': 15,
      'SAFE20': 20
    };
    
    if (validPromoCodes[promoCode.toUpperCase()]) {
      setPromoDiscount(validPromoCodes[promoCode.toUpperCase()]);
      setErrors({ ...errors, promo: '' });
    } else {
      setErrors({ ...errors, promo: 'Noto\\'g\\'ri promo kod' });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (cart.length === 0) {
          newErrors.cart = 'Savat bo\\'sh';
          return false;
        }
        break;
      case 2:
        if (!shippingAddress) {
          newErrors.shipping = 'Yetkazib berish manzilini tanlang';
          return false;
        }
        break;
      case 3:
        if (!paymentMethod) {
          newErrors.payment = 'To\\'lov usulini tanlang';
          return false;
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const completeOrder = async () => {
    if (!validateStep(3)) return;
    
    setIsProcessing(true);
    
    // Simulate order processing
    setTimeout(() => {
      const orderData = {
        items: cart,
        shippingAddress,
        paymentMethod,
        totals: { subtotal, shipping: shippingTotal, discount, total },
        parentalApproval: parentalApproval === 'approved' || parentalApproval === 'not_required'
      };
      
      onCompleteOrder?.(orderData);
      setIsProcessing(false);
      setCurrentStep(5); // Success step
    }, 3000);
  };

  return (
    <div className={`${styles.checkoutFlow} ${isMobile ? styles.mobile : ''}`}>
      {/* Enhanced Security Banner */}
      <div className={styles.enhancedSecurityBanner}>
        <div className={styles.securityHeader}>
          <div className={styles.securityInfo}>
            <div className={styles.sslIndicator}>
              {sslVerified ? (
                <>
                  <MdHttps className={styles.sslIcon} />
                  <span className={styles.sslText}>SSL Himoyalangan</span>
                </>
              ) : (
                <>
                  <FiShield className={styles.sslIcon} />
                  <span className={styles.sslText}>Xavfsiz ulanish</span>
                </>
              )}
            </div>
            
            {isMobile && (
              <div className={styles.mobileIndicators}>
                {touchEnabled && (
                  <div className={styles.touchIndicator}>
                    <MdTouchApp />
                    <span>Touch optimized</span>
                  </div>
                )}
                <div className={styles.mobileSecure}>
                  <MdFingerprint />
                  <span>Mobil xavfsiz</span>
                </div>
              </div>
            )}
          </div>
          
          <div className={styles.trustBadgesContainer}>
            <TrustBadge type="ssl-secure" size="sm" variant="compact" showText={false} />
            <TrustBadge type="safe-payment" size="sm" variant="compact" showText={false} />
            <TrustBadge type="parent-approved" size="sm" variant="compact" showText={false} />
          </div>
        </div>
        
        <div className={styles.securityFeatures}>
          <div className={styles.securityFeature}>
            <FiLock />
            <span>256-bit shifrlash</span>
          </div>
          <div className={styles.securityFeature}>
            <MdVerifiedUser />
            <span>PCI DSS sertifikatlangan</span>
          </div>
          <div className={styles.securityFeature}>
            <MdSecurity />
            <span>Fraud himoya</span>
          </div>
          {isMobile && (
            <div className={styles.securityFeature}>
              <FiSmartphone />
              <span>Mobil optimallashtirilgan</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className={styles.progressSteps}>
        {steps.map((step, index) => (
          <div 
            key={step.id}
            className={`${styles.step} ${
              currentStep === step.id ? styles.active : 
              currentStep > step.id ? styles.completed : ''
            }`}
          >
            <div className={styles.stepIcon}>
              {currentStep > step.id ? <FiCheckCircle /> : step.icon}
            </div>
            <span className={styles.stepTitle}>{step.title}</span>
            {index < steps.length - 1 && (
              <div className={`${styles.stepConnector} ${
                currentStep > step.id ? styles.completed : ''
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className={styles.checkoutContent}>
        <div className={styles.checkoutMain}>
          {/* Step 1: Cart */}
          {currentStep === 1 && (
            <div className={styles.cartStep}>
              <h2>Sizning savatchangiz</h2>
              
              {cart.length === 0 ? (
                <div className={styles.emptyCart}>
                  <FiShoppingCart className={styles.emptyCartIcon} />
                  <h3>Savat bo\\'sh</h3>
                  <p>Xarid qilish uchun mahsulotlar qo\\'shing</p>
                </div>
              ) : (
                <div className={styles.cartItems}>
                  {cart.map(item => (
                    <div key={item.id} className={styles.cartItem}>
                      <img src={item.image} alt={item.title} className={styles.itemImage} />
                      
                      <div className={styles.itemDetails}>
                        <h4 className={styles.itemTitle}>{item.title}</h4>
                        <p className={styles.itemSeller}>Sotuvchi: {item.seller}</p>
                        <div className={styles.itemMeta}>
                          <span className={styles.ageRange}>
                            <MdChildCare />
                            {item.ageRange}
                          </span>
                          <span className={styles.safetyRating}>
                            Xavfsizlik: {'★'.repeat(item.safetyRating)}
                          </span>
                        </div>
                      </div>
                      
                      <div className={styles.itemActions}>
                        <div className={styles.quantityControl}>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className={styles.quantityBtn}
                          >
                            -
                          </button>
                          <span className={styles.quantity}>{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className={styles.quantityBtn}
                          >
                            +
                          </button>
                        </div>
                        
                        <div className={styles.itemPrice}>
                          {(item.price * item.quantity).toLocaleString()} so\\'m
                        </div>
                        
                        <button 
                          onClick={() => removeItem(item.id)}
                          className={styles.removeBtn}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {/* Promo Code */}
                  <div className={styles.promoCode}>
                    <input
                      type=\"text\"
                      placeholder=\"Promo kod kiriting\"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className={styles.promoInput}
                    />
                    <button 
                      onClick={applyPromoCode}
                      className={styles.promoBtn}
                    >
                      Qo\\'llash
                    </button>
                  </div>
                  {errors.promo && (
                    <div className={styles.error}>{errors.promo}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Shipping */}
          {currentStep === 2 && (
            <div className={styles.shippingStep}>
              <h2>Yetkazib berish manzili</h2>
              
              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className={styles.savedAddresses}>
                  <h3>Saqlangan manzillar</h3>
                  {savedAddresses.map((address, index) => (
                    <div 
                      key={index}
                      className={`${styles.addressCard} ${
                        shippingAddress === address ? styles.selected : ''
                      }`}
                      onClick={() => setShippingAddress(address)}
                    >
                      <div className={styles.addressInfo}>
                        <strong>{address.firstName} {address.lastName}</strong>
                        <p>{address.address1}</p>
                        <p>{address.city}, {address.state} {address.zipCode}</p>
                        <p>{address.phone}</p>
                      </div>
                      {address.isDefault && (
                        <span className={styles.defaultBadge}>Asosiy</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {/* New Address Form */}
              <div className={styles.newAddress}>
                <h3>Yangi manzil qo\\'shish</h3>
                {/* Address form would go here */}
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className={styles.paymentStep}>
              <h2>To\\'lov usuli</h2>
              
              {/* Payment Methods */}
              <div className={styles.paymentMethods}>
                {/* Credit Card */}
                <div className={styles.paymentOption}>
                  <input 
                    type=\"radio\" 
                    id=\"card\" 
                    name=\"payment\" 
                    className={styles.paymentRadio}
                  />
                  <label htmlFor=\"card\" className={styles.paymentLabel}>
                    <FaCreditCard className={styles.paymentIcon} />
                    <span>Bank kartasi</span>
                  </label>
                </div>
                
                {/* PayPal */}
                <div className={styles.paymentOption}>
                  <input 
                    type=\"radio\" 
                    id=\"paypal\" 
                    name=\"payment\" 
                    className={styles.paymentRadio}
                  />
                  <label htmlFor=\"paypal\" className={styles.paymentLabel}>
                    <FaPaypal className={styles.paymentIcon} />
                    <span>PayPal</span>
                  </label>
                </div>
                
                {/* Local Payment Methods */}
                <div className={styles.localPayments}>
                  <h4>Mahalliy to\\'lov usullari</h4>
                  <div className={styles.localPaymentGrid}>
                    <button className={styles.localPaymentBtn}>Click</button>
                    <button className={styles.localPaymentBtn}>Payme</button>
                    <button className={styles.localPaymentBtn}>Uzcard</button>
                  </div>
                </div>
              </div>
              
              {/* Parental Approval */}
              {parentalApproval === 'pending' && (
                <div className={styles.parentalApproval}>
                  <MdChildCare className={styles.parentalIcon} />
                  <div>
                    <h4>Ota-ona roziligi talab qilinadi</h4>
                    <p>Buyurtma miqdori katta bo\\'lgani uchun ota-ona tasdig\\'i kerak.</p>
                    <button 
                      className={styles.approvalBtn}
                      onClick={() => setParentalApproval('approved')}
                    >
                      Tasdiqlash
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className={styles.reviewStep}>
              <h2>Buyurtmani ko\\'rib chiqish</h2>
              
              {/* Order Summary */}
              <div className={styles.orderSummary}>
                <div className={styles.summarySection}>
                  <h3>Mahsulotlar</h3>
                  {cart.map(item => (
                    <div key={item.id} className={styles.summaryItem}>
                      <span>{item.title} × {item.quantity}</span>
                      <span>{(item.price * item.quantity).toLocaleString()} so\\'m</span>
                    </div>
                  ))}
                </div>
                
                <div className={styles.summarySection}>
                  <h3>Yetkazib berish manzili</h3>
                  {shippingAddress && (
                    <div className={styles.summaryAddress}>
                      <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
                      <p>{shippingAddress.address1}</p>
                      <p>{shippingAddress.city}, {shippingAddress.state}</p>
                    </div>
                  )}
                </div>
                
                <div className={styles.summarySection}>
                  <h3>To\\'lov usuli</h3>
                  {paymentMethod && (
                    <div className={styles.summaryPayment}>
                      <p>{paymentMethod.type} ending in {paymentMethod.last4}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Final Confirmation */}
              <div className={styles.finalConfirmation}>
                <div className={styles.termsAcceptance}>
                  <input type=\"checkbox\" id=\"terms\" />
                  <label htmlFor=\"terms\">
                    Men <a href=\"/terms\">foydalanish shartlari</a> va <a href=\"/privacy\">maxfiylik siyosati</a>ga roziman
                  </label>
                </div>
                
                <button 
                  onClick={completeOrder}
                  disabled={isProcessing}
                  className={`${styles.completeOrderBtn} ${isProcessing ? styles.processing : ''}`}
                >
                  {isProcessing ? (
                    <>
                      <div className={styles.spinner}></div>
                      <span>Buyurtma berilmoqda...</span>
                    </>
                  ) : (
                    <>
                      <FiLock />
                      <span>Buyurtmani tasdiqlash</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className={styles.orderSummary}>
          <h3>Buyurtma xulosasi</h3>
          
          <div className={styles.summaryDetails}>
            <div className={styles.summaryRow}>
              <span>Mahsulotlar:</span>
              <span>{subtotal.toLocaleString()} so\\'m</span>
            </div>
            
            <div className={styles.summaryRow}>
              <span>Yetkazib berish:</span>
              <span>{shippingTotal.toLocaleString()} so\\'m</span>
            </div>
            
            {discount > 0 && (
              <div className={`${styles.summaryRow} ${styles.discount}`}>
                <span>Chegirma:</span>
                <span>-{discount.toLocaleString()} so\\'m</span>
              </div>
            )}
            
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Jami:</span>
              <span>{total.toLocaleString()} so\\'m</span>
            </div>
          </div>
          
          {/* Trust Indicators */}
          <div className={styles.trustIndicators}>
            <div className={styles.trustItem}>
              <FiShield />
              <span>Xavfsiz to\\'lov</span>
            </div>
            <div className={styles.trustItem}>
              <MdLocalShipping />
              <span>Tez yetkazib berish</span>
            </div>
            <div className={styles.trustItem}>
              <MdVerifiedUser />
              <span>Kafolatlangan sifat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className={styles.navigationButtons}>
          {currentStep > 1 && (
            <button onClick={prevStep} className={styles.prevBtn}>
              <FiArrowLeft />
              <span>Orqaga</span>
            </button>
          )}
          
          <button 
            onClick={nextStep} 
            className={styles.nextBtn}
            disabled={cart.length === 0 && currentStep === 1}
          >
            <span>Davom etish</span>
            <FiArrowRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedCheckoutFlow;"