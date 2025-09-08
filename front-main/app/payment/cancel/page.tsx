import React from 'react';
import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';

const PaymentCancelPage: React.FC = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Cancel Header */}
          <div className="bg-yellow-50 px-6 py-8 text-center">
            <XCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p className="text-gray-600">
              Your payment was cancelled. No charges have been made to your account.
            </p>
          </div>

          {/* Information */}
          <div className="px-6 py-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">What happened?</h2>
              <ul className="text-blue-800 space-y-1 text-sm">
                <li>• You cancelled the payment process</li>
                <li>• No money has been charged from your account</li>
                <li>• Your order is still in your cart waiting for payment</li>
                <li>• You can try again with a different payment method</li>
              </ul>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h2>
              <p className="text-gray-600 text-sm mb-3">
                If you're experiencing issues with payment, here are some things you can try:
              </p>
              <ul className="text-gray-600 space-y-1 text-sm">
                <li>• Check your payment method details</li>
                <li>• Try a different payment method</li>
                <li>• Contact your bank if you're having card issues</li>
                <li>• Reach out to our support team for assistance</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-6 bg-gray-50 border-t">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.back()}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Payment Again
              </button>
              <button
                onClick={() => router.push('/cart')}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                View Cart
              </button>
              <button
                onClick={() => router.push('/')}
                className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
