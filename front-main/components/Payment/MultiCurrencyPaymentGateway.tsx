import React, { useState, useEffect } from 'react';
import { 
  MdCreditCard, 
  MdSecurity, 
  MdVerifiedUser, 
  MdAttachMoney, 
  MdLock,
  MdMobileFriendly,
  MdContactless
} from 'react-icons/md';
import { FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import { TrustBadge } from '../common/TrustBadges';
import styles from './MultiCurrencyPaymentGateway.module.scss';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'uzcard' | 'humo' | 'visa' | 'mastercard' | 'click' | 'payme' | 'uzum' | 'paypal';
  icon: string;
  description: string;
  fees?: number;
  processingTime: string;
  supported: boolean;
  currencies: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isDefault: boolean;
}

interface MultiCurrencyPaymentGatewayProps {
  totalAmount: number;
  orderId: string;
  onPaymentSelect: (method: PaymentMethod, currency: Currency, finalAmount: number) => void;
  onProcessPayment: (paymentData: any) => Promise<void>;
  className?: string;
}

const MultiCurrencyPaymentGateway: React.FC<MultiCurrencyPaymentGatewayProps> = ({
  totalAmount,
  orderId,
  onPaymentSelect,
  onProcessPayment,
  className = ''
}) => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    cardHolderName: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);

  // Mock currencies with real-time rates
  const [currencies] = useState<Currency[]>([
    { code: 'UZS', name: 'O\'zbek so\'mi', symbol: 'so\'m', rate: 1, isDefault: true },
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 0.000086, isDefault: false },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.000079, isDefault: false },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate: 0.0086, isDefault: false }
  ]);

  // Payment methods with UZ cards integration
  const [paymentMethods] = useState<PaymentMethod[]>([
    {
      id: 'uzcard',
      name: 'UzCard',
      type: 'uzcard',
      icon: '/icons/uzcard.png',
      description: 'O\'zbekiston milliy to\'lov tizimi',
      fees: 0,
      processingTime: 'Bir zumda',
      supported: true,
      currencies: ['UZS'],
      minAmount: 1000,
      maxAmount: 50000000
    },
    {
      id: 'humo',
      name: 'Humo',
      type: 'humo',
      icon: '/icons/humo.png',
      description: 'Humo to\'lov tizimi',
      fees: 0,
      processingTime: 'Bir zumda',
      supported: true,
      currencies: ['UZS'],
      minAmount: 1000,
      maxAmount: 50000000
    },
    {
      id: 'click',
      name: 'Click',
      type: 'click',
      icon: '/icons/click.png',
      description: 'Click mobil to\'lovlar',
      fees: 0.5,
      processingTime: '1-3 daqiqa',
      supported: true,
      currencies: ['UZS'],
      minAmount: 1000,
      maxAmount: 10000000
    },
    {
      id: 'payme',
      name: 'Payme',
      type: 'payme',
      icon: '/icons/payme.png',
      description: 'Payme mobil to\'lovlar',
      fees: 0.5,
      processingTime: '1-3 daqiqa',
      supported: true,
      currencies: ['UZS'],
      minAmount: 1000,
      maxAmount: 10000000
    },
    {
      id: 'uzum',
      name: 'Uzum Bank',
      type: 'uzum',
      icon: '/icons/uzum.png',
      description: 'Uzum Bank kartalar',
      fees: 0,
      processingTime: 'Bir zumda',
      supported: true,
      currencies: ['UZS'],
      minAmount: 1000,
      maxAmount: 30000000
    },
    {
      id: 'visa',
      name: 'Visa',
      type: 'visa',
      icon: '/icons/visa.png',
      description: 'Xalqaro Visa kartalar',
      fees: 2.9,
      processingTime: '2-5 daqiqa',
      supported: true,
      currencies: ['USD', 'EUR', 'UZS'],
      minAmount: 100,
      maxAmount: 100000000
    },
    {
      id: 'mastercard',
      name: 'Mastercard',
      type: 'mastercard',
      icon: '/icons/mastercard.png',
      description: 'Xalqaro Mastercard kartalar',
      fees: 2.9,
      processingTime: '2-5 daqiqa',
      supported: true,
      currencies: ['USD', 'EUR', 'UZS'],
      minAmount: 100,
      maxAmount: 100000000
    },
    {
      id: 'paypal',
      name: 'PayPal',
      type: 'paypal',
      icon: '/icons/paypal.png',
      description: 'PayPal xalqaro to\'lovlar',
      fees: 3.4,
      processingTime: '5-10 daqiqa',
      supported: true,
      currencies: ['USD', 'EUR'],
      minAmount: 50,
      maxAmount: 200000000
    }
  ]);

  // Set default currency
  useEffect(() => {
    const defaultCurrency = currencies.find(c => c.isDefault);
    if (defaultCurrency) {
      setSelectedCurrency(defaultCurrency);
    }
  }, [currencies]);

  const calculateAmount = (amount: number, currency: Currency) => {
    return amount * currency.rate;
  };

  const formatAmount = (amount: number, currency: Currency) => {
    return new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: currency.code === 'UZS' ? 0 : 2,
      maximumFractionDigits: currency.code === 'UZS' ? 0 : 2,
    }).format(amount) + ' ' + currency.symbol;
  };

  const getFilteredPaymentMethods = () => {
    if (!selectedCurrency) return paymentMethods;
    
    return paymentMethods.filter(method => 
      method.supported && method.currencies.includes(selectedCurrency.code)
    );
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setShowCardForm(['uzcard', 'humo', 'visa', 'mastercard', 'uzum'].includes(method.type));
    
    if (selectedCurrency) {
      const finalAmount = calculateAmount(totalAmount, selectedCurrency);
      onPaymentSelect(method, selectedCurrency, finalAmount);
    }
  };

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    setSelectedPaymentMethod(null);
    setShowCardForm(false);
  };

  const validateCardNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '');
    return /^\d{16}$/.test(cleaned);
  };

  const validateCVV = (cvv: string) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleCardInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    }
    
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProcessPayment = async () => {
    if (!selectedPaymentMethod || !selectedCurrency) return;

    setIsProcessing(true);
    
    try {
      const paymentData = {
        orderId,
        paymentMethod: selectedPaymentMethod,
        currency: selectedCurrency,
        amount: calculateAmount(totalAmount, selectedCurrency),
        cardDetails: showCardForm ? cardDetails : null
      };

      await onProcessPayment(paymentData);
    } catch (error) {
      console.error('Payment processing error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid = () => {
    if (!selectedPaymentMethod || !selectedCurrency) return false;
    
    if (showCardForm) {
      return (
        validateCardNumber(cardDetails.cardNumber) &&
        cardDetails.expiryMonth &&
        cardDetails.expiryYear &&
        validateCVV(cardDetails.cvv) &&
        cardDetails.cardHolderName.trim().length > 0
      );
    }
    
    return true;
  };

  return (
    <div className={`${styles.paymentGateway} ${className}`}>
      {/* Security Header */}
      <div className={styles.securityHeader}>
        <div className={styles.securityInfo}>
          <MdSecurity className={styles.securityIcon} />
          <div>
            <h3>Xavfsiz to'lov</h3>
            <p>256-bit SSL shifrlash bilan himoyalangan</p>
          </div>
        </div>
        <div className={styles.trustBadges}>
          <TrustBadge type="ssl-secure" size="sm" showText={false} />
          <TrustBadge type="safe-payment" size="sm" showText={false} />
        </div>
      </div>

      {/* Currency Selection */}
      <div className={styles.currencySection}>
        <h4>Valyutani tanlang</h4>
        <div className={styles.currencyGrid}>
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => handleCurrencyChange(currency)}
              className={`${styles.currencyOption} ${
                selectedCurrency?.code === currency.code ? styles.currencySelected : ''
              }`}
            >
              <div className={styles.currencyInfo}>
                <span className={styles.currencyCode}>{currency.code}</span>
                <span className={styles.currencyName}>{currency.name}</span>
              </div>
              {selectedCurrency && (
                <div className={styles.currencyAmount}>
                  {formatAmount(calculateAmount(totalAmount, currency), currency)}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      {selectedCurrency && (
        <div className={styles.paymentMethodsSection}>
          <h4>To'lov usulini tanlang</h4>
          <div className={styles.paymentMethodsGrid}>
            {getFilteredPaymentMethods().map((method) => (
              <button
                key={method.id}
                onClick={() => handlePaymentMethodSelect(method)}
                className={`${styles.paymentMethod} ${
                  selectedPaymentMethod?.id === method.id ? styles.paymentMethodSelected : ''
                }`}
              >
                <div className={styles.methodIcon}>
                  <img src={method.icon} alt={method.name} />
                </div>
                <div className={styles.methodInfo}>
                  <h5>{method.name}</h5>
                  <p>{method.description}</p>
                  <div className={styles.methodDetails}>
                    <span>Komissiya: {method.fees}%</span>
                    <span>Vaqt: {method.processingTime}</span>
                  </div>
                </div>
                {method.type === 'uzcard' && (
                  <div className={styles.localBadge}>
                    <span>Mahalliy</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card Form */}
      {showCardForm && selectedPaymentMethod && (
        <div className={styles.cardForm}>
          <h4>Karta ma'lumotlari</h4>
          
          <div className={styles.formGroup}>
            <label>Karta raqami</label>
            <div className={styles.cardNumberInput}>
              <input
                type="text"
                placeholder="0000 0000 0000 0000"
                value={cardDetails.cardNumber}
                onChange={(e) => handleCardInputChange('cardNumber', e.target.value)}
                maxLength={19}
              />
              <div className={styles.cardIcons}>
                {selectedPaymentMethod.type === 'visa' && <FaCcVisa />}
                {selectedPaymentMethod.type === 'mastercard' && <FaCcMastercard />}
                {selectedPaymentMethod.type === 'uzcard' && <MdCreditCard />}
                {selectedPaymentMethod.type === 'humo' && <MdCreditCard />}
              </div>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Amal qilish muddati</label>
              <div className={styles.expiryInputs}>
                <select
                  value={cardDetails.expiryMonth}
                  onChange={(e) => handleCardInputChange('expiryMonth', e.target.value)}
                >
                  <option value="">Oy</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                      {String(i + 1).padStart(2, '0')}
                    </option>
                  ))}
                </select>
                <select
                  value={cardDetails.expiryYear}
                  onChange={(e) => handleCardInputChange('expiryYear', e.target.value)}
                >
                  <option value="">Yil</option>
                  {[...Array(10)].map((_, i) => {
                    const year = new Date().getFullYear() + i;
                    return (
                      <option key={year} value={String(year).slice(-2)}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>CVV kod</label>
              <input
                type="text"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                maxLength={4}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Karta egasining ismi</label>
            <input
              type="text"
              placeholder="FIRSTNAME LASTNAME"
              value={cardDetails.cardHolderName}
              onChange={(e) => handleCardInputChange('cardHolderName', e.target.value.toUpperCase())}
            />
          </div>
        </div>
      )}

      {/* Payment Summary */}
      {selectedPaymentMethod && selectedCurrency && (
        <div className={styles.paymentSummary}>
          <h4>To'lov xulosasi</h4>
          <div className={styles.summaryDetails}>
            <div className={styles.summaryRow}>
              <span>Mahsulotlar:</span>
              <span>{formatAmount(calculateAmount(totalAmount, selectedCurrency), selectedCurrency)}</span>
            </div>
            {selectedPaymentMethod.fees > 0 && (
              <div className={styles.summaryRow}>
                <span>Komissiya ({selectedPaymentMethod.fees}%):</span>
                <span>{formatAmount(calculateAmount(totalAmount * selectedPaymentMethod.fees / 100, selectedCurrency), selectedCurrency)}</span>
              </div>
            )}
            <div className={styles.summaryRow}>
              <span>Yetkazib berish:</span>
              <span>Bepul</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Jami:</span>
              <span>{formatAmount(calculateAmount(totalAmount * (1 + selectedPaymentMethod.fees / 100), selectedCurrency), selectedCurrency)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button */}
      {selectedPaymentMethod && (
        <button
          onClick={handleProcessPayment}
          disabled={!isFormValid() || isProcessing}
          className={styles.paymentButton}
        >
          {isProcessing ? (
            <div className={styles.processingSpinner}>
              Qayta ishlanmoqda...
            </div>
          ) : (
            <>
              <MdLock />
              <span>
                Xavfsiz to'lov - {selectedCurrency && formatAmount(
                  calculateAmount(totalAmount * (1 + selectedPaymentMethod.fees / 100), selectedCurrency), 
                  selectedCurrency
                )}
              </span>
            </>
          )}
        </button>
      )}

      {/* Security Footer */}
      <div className={styles.securityFooter}>
        <div className={styles.securityFeatures}>
          <div className={styles.securityFeature}>
            <MdSecurity />
            <span>PCI DSS sertifikatlangan</span>
          </div>
          <div className={styles.securityFeature}>
            <MdVerifiedUser />
            <span>3D Secure himoya</span>
          </div>
          <div className={styles.securityFeature}>
            <MdMobileFriendly />
            <span>Mobil optimallashtirilgan</span>
          </div>
        </div>
        <p className={styles.securityNote}>
          Sizning to'lov ma'lumotlaringiz 256-bit SSL shifrlash bilan himoyalangan va bizning serverlarimizda saqlanmaydi.
        </p>
      </div>
    </div>
  );
};

export default MultiCurrencyPaymentGateway;