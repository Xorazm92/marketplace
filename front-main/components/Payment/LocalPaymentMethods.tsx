import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { createClickPayment, createPaymePayment, createUzCardPayment } from '../../endpoints/payment';
import type { CreatePaymentData, PaymentMethod } from '../../types/payment.types';

interface LocalPaymentMethodsProps {
  paymentData: CreatePaymentData;
  onSuccess: (paymentId: number) => void;
  onError: (error: string) => void;
}

const LocalPaymentMethods: React.FC<LocalPaymentMethodsProps> = ({
  paymentData,
  onSuccess,
  onError
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);

  const paymentMethods = [
    {
      id: 'CLICK' as PaymentMethod,
      name: 'Click',
      icon: '🔵',
      description: 'Pay with Click payment system',
      color: 'bg-blue-500'
    },
    {
      id: 'PAYME' as PaymentMethod,
      name: 'Payme',
      icon: '🟢',
      description: 'Pay with Payme payment system',
      color: 'bg-green-500'
    },
    {
      id: 'UZCARD' as PaymentMethod,
      name: 'UzCard',
      icon: '🟡',
      description: 'Pay with UzCard',
      color: 'bg-yellow-500'
    }
  ];

  const handlePayment = async (method: PaymentMethod) => {
    setIsProcessing(true);
    setSelectedMethod(method);

    try {
      let paymentResponse;
      const paymentDataWithMethod = { ...paymentData, payment_method: method };

      switch (method) {
        case 'CLICK':
          paymentResponse = await createClickPayment(paymentDataWithMethod);
          break;
        case 'PAYME':
          paymentResponse = await createPaymePayment(paymentDataWithMethod);
          break;
        case 'UZCARD':
          paymentResponse = await createUzCardPayment(paymentDataWithMethod);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      // Redirect to payment gateway
      if (paymentResponse.payment_url) {
        toast.success(`Redirecting to ${method} payment...`);
        window.location.href = paymentResponse.payment_url;
      } else {
        onSuccess(paymentResponse.payment_id);
      }
    } catch (error: any) {
      console.error(`${method} payment error:`, error);
      toast.error(error.message || `${method} payment failed`);
      onError(error.message || `${method} payment failed`);
    } finally {
      setIsProcessing(false);
      setSelectedMethod(null);
    }
  };

  return (
    <div className="local-payment-methods">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Choose Local Payment Method</h3>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">
            Amount: <span className="font-semibold">${paymentData.amount}</span>
          </p>
          <p className="text-sm text-gray-600">
            Order ID: <span className="font-semibold">#{paymentData.order_id}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {paymentMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => handlePayment(method.id)}
            disabled={isProcessing}
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200 ${
              isProcessing && selectedMethod === method.id
                ? 'border-gray-300 bg-gray-100'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full ${method.color} flex items-center justify-center text-white text-lg`}>
                  {method.icon}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-gray-900">{method.name}</h4>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              </div>
              
              {isProcessing && selectedMethod === method.id ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-2"></div>
                  <span className="text-sm text-gray-600">Processing...</span>
                </div>
              ) : (
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        You will be redirected to the selected payment provider to complete your transaction.
      </div>
    </div>
  );
};

export default LocalPaymentMethods;
