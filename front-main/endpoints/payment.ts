import apiClient from '../lib/api-client';
import { toast } from 'react-toastify';
import type {
  CreatePaymentData,
  PaymentInitiationResponse,
  PaymentConfirmationData,
  PaymentHistory,
  PaymentStats,
  Payment,
  RefundData,
  RefundResponse,
} from '../types/payment.types';

// Main payment operations
export const initiatePayment = async (paymentData: CreatePaymentData): Promise<PaymentInitiationResponse> => {
  try {
    const response = await apiClient.post<PaymentInitiationResponse>('/payment/initiate', paymentData);
    toast.success('Payment initiated successfully!');
    return response;
  } catch (error: any) {
    console.error('Error initiating payment:', error);
    toast.error(error.message || 'Failed to initiate payment');
    throw error;
  }
};

export const confirmPayment = async (paymentId: number, confirmationData: PaymentConfirmationData): Promise<Payment> => {
  try {
    const response = await apiClient.post<Payment>(`/payment/${paymentId}/confirm`, confirmationData);
    toast.success('Payment confirmed successfully!');
    return response;
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    toast.error(error.message || 'Failed to confirm payment');
    throw error;
  }
};

export const getPaymentHistory = async (page: number = 1, limit: number = 10): Promise<PaymentHistory> => {
  try {
    const response = await apiClient.get<PaymentHistory>(`/payment/history?page=${page}&limit=${limit}`);
    return response;
  } catch (error: any) {
    console.error('Error loading payment history:', error);
    toast.error(error.message || 'Failed to load payment history');
    throw error;
  }
};

export const getPayment = async (paymentId: number): Promise<Payment> => {
  try {
    const response = await apiClient.get<Payment>(`/payment/${paymentId}`);
    return response;
  } catch (error: any) {
    console.error('Error loading payment:', error);
    toast.error(error.message || 'Failed to load payment details');
    throw error;
  }
};

// Admin operations
export const getAllPayments = async (page: number = 1, limit: number = 20): Promise<PaymentHistory> => {
  try {
    const response = await apiClient.get<PaymentHistory>(`/payment/admin/all?page=${page}&limit=${limit}`);
    return response;
  } catch (error: any) {
    console.error('Error loading all payments:', error);
    toast.error(error.message || 'Failed to load payments');
    throw error;
  }
};

export const getPaymentStats = async (): Promise<PaymentStats> => {
  try {
    const response = await apiClient.get<PaymentStats>('/payment/admin/stats');
    return response;
  } catch (error: any) {
    console.error('Error loading payment stats:', error);
    toast.error(error.message || 'Failed to load payment statistics');
    throw error;
  }
};

export const refundPayment = async (paymentId: number, refundData: RefundData): Promise<RefundResponse> => {
  try {
    const response = await apiClient.post<RefundResponse>(`/payment/${paymentId}/refund`, refundData);
    toast.success('Payment refunded successfully!');
    return response;
  } catch (error: any) {
    console.error('Error refunding payment:', error);
    toast.error(error.message || 'Failed to refund payment');
    throw error;
  }
};

// Payment method helpers
export const getPaymentMethodIcon = (method: string): string => {
  const icons: Record<string, string> = {
    PAYPAL: '💳',
    STRIPE: '💳',
    CLICK: '🔵',
    PAYME: '🟢',
    UZCARD: '🟡',
  };
  return icons[method] || '💳';
};

export const getPaymentStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PENDING: 'text-yellow-600',
    PROCESSING: 'text-blue-600',
    COMPLETED: 'text-green-600',
    FAILED: 'text-red-600',
    CANCELLED: 'text-gray-600',
    REFUNDED: 'text-purple-600',
    PARTIALLY_REFUNDED: 'text-orange-600',
  };
  return colors[status] || 'text-gray-600';
};

export const formatPaymentAmount = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Payment flow helpers
export const handlePaymentRedirect = (paymentResponse: PaymentInitiationResponse): void => {
  // Handle PayPal redirect
  if (paymentResponse.links) {
    const approvalLink = paymentResponse.links.find(link => link.rel === 'approve');
    if (approvalLink) {
      window.location.href = approvalLink.href;
      return;
    }
  }

  // Handle local payment methods
  if (paymentResponse.payment_url) {
    window.location.href = paymentResponse.payment_url;
    return;
  }

  // For Stripe, we'll handle this in the component with Stripe Elements
  console.log('Payment initiated:', paymentResponse);
};

// Legacy local payment methods (for backward compatibility)
export const createClickPayment = async (paymentData: CreatePaymentData): Promise<PaymentInitiationResponse> => {
  return initiatePayment({ ...paymentData, payment_method: 'CLICK' });
};

export const createPaymePayment = async (paymentData: CreatePaymentData): Promise<PaymentInitiationResponse> => {
  return initiatePayment({ ...paymentData, payment_method: 'PAYME' });
};

export const createUzCardPayment = async (paymentData: CreatePaymentData): Promise<PaymentInitiationResponse> => {
  return initiatePayment({ ...paymentData, payment_method: 'UZCARD' });
};

// Main payment processing function
export const processPayment = async (paymentData: CreatePaymentData): Promise<PaymentInitiationResponse> => {
  try {
    const paymentResponse = await initiatePayment(paymentData);
    
    // Handle redirect for non-Stripe payments
    if (paymentData.payment_method !== 'STRIPE') {
      handlePaymentRedirect(paymentResponse);
    }

    return paymentResponse;
  } catch (error: any) {
    console.error('Error processing payment:', error);
    throw error;
  }
};

export default {
  // Main operations
  initiatePayment,
  confirmPayment,
  getPaymentHistory,
  getPayment,
  processPayment,
  
  // Admin operations
  getAllPayments,
  getPaymentStats,
  refundPayment,
  
  // Legacy methods
  createClickPayment,
  createPaymePayment,
  createUzCardPayment,
  
  // Helpers
  getPaymentMethodIcon,
  getPaymentStatusColor,
  formatPaymentAmount,
  handlePaymentRedirect,
};
