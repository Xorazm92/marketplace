import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to format phone numbers
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove all non-digit characters
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Check if the number starts with 998 (Uzbekistan country code)
  if (cleaned.startsWith('998') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  
  // If it's a local Uzbek number (starts with 9 and is 9 digits)
  if (cleaned.match(/^9\d{8}$/)) {
    return `+998${cleaned}`;
  }
  
  // If it's already in international format
  if (cleaned.match(/^\d{12}$/)) {
    return `+${cleaned}`;
  }
  
  // Return as is if we can't determine the format
  return phoneNumber;
}

// Validate Uzbek phone number
export function isValidUzbekPhoneNumber(phoneNumber: string): boolean {
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');
  
  // Check if it's a valid Uzbek mobile number
  // 998 followed by 9 digits (total 12 digits)
  if (/^998[3789]\d{8}$/.test(cleaned)) {
    return true;
  }
  
  // Check if it's a local Uzbek mobile number (9 digits starting with 9)
  if (/^[3789]\d{8}$/.test(cleaned)) {
    return true;
  }
  
  return false;
}

// Generate a random OTP
export function generateOTP(length: number = 6): string {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  
  return otp;
}
