import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import addressService, { Address } from '../../services/addressService';
import paymentService, { PaymentMethod } from '../../services/paymentService';

interface CartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
}

const CheckoutPage: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    const storedCart = localStorage.getItem('inbola_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  const calculateTotal = (): number => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = selectedAddress ? addressService.getDeliveryPrice(selectedAddress.regionId, selectedAddress.districtId) : 0;
    const tax = paymentService.calculateTax(subtotal);
    return subtotal + delivery + tax;
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedPayment) {
      toast.error('Barcha ma\'lumotlarni to\'ldiring');
      return;
    }

    try {
      const orderData = {
        orderId: `ORDER_${Date.now()}`,
        amount: calculateTotal() * 100,
        description: `INBOLA buyurtma - ${cartItems.length} ta mahsulot`,
        returnUrl: `${window.location.origin}/checkout/success`,
        customerPhone: selectedAddress.phone
      };

      const result = await paymentService.initiatePayment(selectedPayment, orderData);
      
      if (result.success && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Buyurtma berish amalga oshmadi');
    }
  };

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Buyurtmani rasmiylashtirish</h1>
        
        {/* Step Indicator */}
        <div className="steps">
          <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1. Manzil</div>
          <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2. To'lov</div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3. Tasdiqlash</div>
        </div>

        {/* Address Step */}
        {currentStep === 1 && (
          <div className="address-step">
            <h3>Yetkazib berish manzili</h3>
            {/* Address form will be here */}
            <button onClick={() => setCurrentStep(2)}>Davom etish</button>
          </div>
        )}

        {/* Payment Step */}
        {currentStep === 2 && (
          <div className="payment-step">
            <h3>To'lov usuli</h3>
            <div className="payment-methods">
              <label>
                <input 
                  type="radio" 
                  name="payment" 
                  value={PaymentMethod.CLICK}
                  onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
                />
                Click
              </label>
              <label>
                <input 
                  type="radio" 
                  name="payment" 
                  value={PaymentMethod.PAYME}
                  onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
                />
                Payme
              </label>
              <label>
                <input 
                  type="radio" 
                  name="payment" 
                  value={PaymentMethod.UZUM}
                  onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
                />
                Uzum
              </label>
            </div>
            <button onClick={() => setCurrentStep(3)}>Davom etish</button>
          </div>
        )}

        {/* Review Step */}
        {currentStep === 3 && (
          <div className="review-step">
            <h3>Buyurtmani tasdiqlash</h3>
            <div className="order-summary">
              <p>Jami: {paymentService.formatAmount(calculateTotal())}</p>
            </div>
            <button onClick={handlePlaceOrder}>Buyurtma berish</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;
