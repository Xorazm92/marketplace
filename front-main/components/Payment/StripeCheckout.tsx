'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { CreditCard, Lock } from 'lucide-react';
import { confirmPayment } from '../../endpoints/payment';
import type { Payment } from '../../types/payment.types';
import { toast } from 'react-hot-toast';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeCheckoutProps {
  payment: Payment;
  onSuccess: (payment: Payment) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutProps> = ({
  payment,
  onSuccess,
  onError,
  onCancel
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Initialize payment intent if needed
    const initializePayment = async () => {
      try {
        if (payment.gateway_response?.client_secret) {
          setClientSecret(payment.gateway_response.client_secret);
        }
      } catch (error: any) {
        console.error('Failed to initialize Stripe payment:', error);
        setError('Failed to initialize payment');
        onError(error);
      }
    };

    initializePayment();
  }, [payment, onError]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      setError('Card element not found');
      setIsProcessing(false);
      return;
    }

    try {
      let result;

      if (clientSecret) {
        // Use existing payment intent
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          }
        });
      } else {
        // Create new payment method and confirm with backend
        const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

        if (paymentMethodError) {
          throw new Error(paymentMethodError.message);
        }

        // Confirm payment with backend
        const confirmedPayment = await confirmPayment(payment.id, {
          paymentIntentId: paymentMethod.id
        });

        // Handle 3D Secure if required
        if (confirmedPayment.gateway_response?.client_secret) {
          result = await stripe.confirmCardPayment(
            confirmedPayment.gateway_response.client_secret
          );
        } else {
          // Payment was successful without 3D Secure
          toast.success('Payment successful!');
          onSuccess(confirmedPayment);
          return;
        }
      }

      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.paymentIntent?.status === 'succeeded') {
        // Confirm with backend that payment was successful
        const finalPayment = await confirmPayment(payment.id, {
          paymentIntentId: result.paymentIntent.id
        });
        
        toast.success('Payment successful!');
        onSuccess(finalPayment);
      } else {
        throw new Error(`Payment status: ${result.paymentIntent?.status}`);
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      setError(err.message || 'Payment failed');
      toast.error(err.message || 'Payment failed');
      onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center space-x-2 mb-4">
          <CreditCard className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Card Details</h3>
          <Lock className="w-4 h-4 text-green-600" />
        </div>

        <div className="border rounded-lg p-4 bg-gray-50">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#374151',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  '::placeholder': {
                    color: '#9CA3AF',
                  },
                },
                invalid: {
                  color: '#EF4444',
                },
                complete: {
                  color: '#10B981',
                },
              },
              hidePostalCode: true,
            }}
          />
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            <span>Secure payment powered by Stripe</span>
          </div>
          <div className="flex items-center space-x-2">
            <img src="/visa.png" alt="Visa" className="h-6" />
            <img src="/mastercard.png" alt="Mastercard" className="h-6" />
            <img src="/amex.png" alt="American Express" className="h-6" />
          </div>
        </div>
      </div>

      {/* Payment Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Amount to pay:</span>
          <span className="text-xl font-bold text-gray-900">${payment.amount}</span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-gray-500">Currency:</span>
          <span className="text-sm text-gray-700">USD</span>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            <>
              <Lock className="w-4 h-4 inline mr-2" />
              Pay ${payment.amount}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const StripeCheckout: React.FC<StripeCheckoutProps> = (props) => {
  if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">Stripe configuration error. Please contact support.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripeCheckoutForm {...props} />
    </Elements>
  );
};

export default StripeCheckout;
