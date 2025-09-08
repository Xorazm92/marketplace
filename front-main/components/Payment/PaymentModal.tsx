import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { initiatePayment } from '../../endpoints/payment';
import PayPalCheckout from './PayPalCheckout';
import StripeCheckout from './StripeCheckout';
import LocalPaymentMethods from './LocalPaymentMethods';
import type { CreatePaymentData, PaymentMethod, PaymentInitiationResponse } from '../../types/payment.types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    id: number;
    total_amount: number;
    currency?: string;
  };
  onPaymentSuccess: (paymentId: number) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onPaymentSuccess
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [paymentResponse, setPaymentResponse] = useState<PaymentInitiationResponse | null>(null);
  const [isInitiating, setIsInitiating] = useState(false);

  const paymentMethods = [
    {
      id: 'PAYPAL' as PaymentMethod,
      name: 'PayPal',
      icon: '💳',
      description: 'Pay with PayPal account or card',
      available: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID
    },
    {
      id: 'STRIPE' as PaymentMethod,
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Pay with credit or debit card',
      available: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    },
    {
      id: 'LOCAL' as PaymentMethod,
      name: 'Local Methods',
      icon: '🏦',
      description: 'Click, Payme, UzCard',
      available: true
    }
  ];

  const handleMethodSelect = async (method: PaymentMethod) => {
    if (method === 'LOCAL') {
      setSelectedMethod(method);
      return;
    }

    setIsInitiating(true);
    
    try {
      const paymentData: CreatePaymentData = {
        order_id: orderData.id,
        amount: orderData.total_amount,
        payment_method: method,
        currency: orderData.currency || 'USD',
        return_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/payment/cancel`
      };

      const response = await initiatePayment(paymentData);
      setPaymentResponse(response);
      setSelectedMethod(method);
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      toast.error(error.message || 'Failed to initiate payment');
    } finally {
      setIsInitiating(false);
    }
  };

  const handlePaymentSuccess = (paymentId: number) => {
    onPaymentSuccess(paymentId);
    onClose();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    // Reset to method selection
    setSelectedMethod(null);
    setPaymentResponse(null);
  };

  const handleBack = () => {
    setSelectedMethod(null);
    setPaymentResponse(null);
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedMethod(null);
      setPaymentResponse(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {selectedMethod ? 'Complete Payment' : 'Choose Payment Method'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedMethod ? (
            // Method Selection
            <div>
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Order #{orderData.id}</span>
                  <span className="font-semibold text-lg">
                    ${orderData.total_amount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {paymentMethods.filter(method => method.available).map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method.id)}
                    disabled={isInitiating}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
                      isInitiating
                        ? 'border-gray-300 bg-gray-100 cursor-not-allowed'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{method.icon}</div>
                      <div className="text-left">
                        <h4 className="font-semibold text-gray-900">{method.name}</h4>
                        <p className="text-sm text-gray-600">{method.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {isInitiating && (
                <div className="mt-4 text-center">
                  <div className="inline-flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-gray-600">Initializing payment...</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Payment Processing
            <div>
              <div className="mb-4">
                <button
                  onClick={handleBack}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to payment methods
                </button>
              </div>

              {selectedMethod === 'PAYPAL' && paymentResponse && (
                <PayPalCheckout
                  paymentData={{
                    order_id: orderData.id,
                    amount: orderData.total_amount,
                    payment_method: 'PAYPAL',
                    currency: orderData.currency || 'USD'
                  }}
                  paymentResponse={paymentResponse}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onCancel={handleBack}
                />
              )}

              {selectedMethod === 'STRIPE' && paymentResponse && (
                <StripeCheckout
                  paymentData={{
                    order_id: orderData.id,
                    amount: orderData.total_amount,
                    payment_method: 'STRIPE',
                    currency: orderData.currency || 'USD'
                  }}
                  paymentResponse={paymentResponse}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}

              {selectedMethod === 'LOCAL' && (
                <LocalPaymentMethods
                  paymentData={{
                    order_id: orderData.id,
                    amount: orderData.total_amount,
                    payment_method: 'CLICK', // Will be overridden in component
                    currency: orderData.currency || 'USD'
                  }}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
