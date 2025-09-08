import React, { useState } from 'react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { toast } from 'react-toastify';
import { confirmPayment } from '../../endpoints/payment';
import type { CreatePaymentData, PaymentInitiationResponse } from '../../types/payment.types';

interface PayPalCheckoutProps {
  paymentData: CreatePaymentData;
  paymentResponse: PaymentInitiationResponse;
  onSuccess: (paymentId: number) => void;
  onError: (error: string) => void;
  onCancel?: () => void;
}

const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({
  paymentData,
  paymentResponse,
  onSuccess,
  onError,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: paymentData.currency || 'USD',
    intent: 'capture',
  };

  const createOrder = (data: any, actions: any) => {
    // Use the order ID from our backend payment initiation
    return paymentResponse.id || '';
  };

  const onApprove = async (data: any, actions: any) => {
    setIsProcessing(true);
    
    try {
      // Confirm the payment with our backend
      const confirmedPayment = await confirmPayment(paymentResponse.payment_id, {
        orderId: data.orderID
      });

      toast.success('Payment completed successfully!');
      onSuccess(confirmedPayment.id);
    } catch (error: any) {
      console.error('PayPal payment confirmation error:', error);
      toast.error(error.message || 'Payment confirmation failed');
      onError(error.message || 'Payment confirmation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const onErrorHandler = (error: any) => {
    console.error('PayPal payment error:', error);
    toast.error('PayPal payment failed');
    onError('PayPal payment failed');
  };

  const onCancelHandler = () => {
    toast.info('Payment cancelled');
    onCancel?.();
  };

  if (!paypalOptions.clientId) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">PayPal configuration error. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className="paypal-checkout-container">
      <PayPalScriptProvider options={paypalOptions}>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Complete Payment with PayPal</h3>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              Amount: <span className="font-semibold">${paymentData.amount}</span>
            </p>
            <p className="text-sm text-gray-600">
              Order ID: <span className="font-semibold">#{paymentData.order_id}</span>
            </p>
          </div>
        </div>

        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onErrorHandler}
          onCancel={onCancelHandler}
          disabled={isProcessing}
          style={{
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
          }}
        />

        {isProcessing && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              <span className="text-sm text-gray-600">Processing payment...</span>
            </div>
          </div>
        )}
      </PayPalScriptProvider>
    </div>
  );
};

export default PayPalCheckout;
