export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  profileImg?: string;
  isActive: boolean;
  isPremium: boolean;
  birthDate?: string;
  balance: number;
  slug?: string;
  lastOnline: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  addresses: Address[];
  phoneNumbers: PhoneNumber[];
  emails: Email[];
}

export interface Address {
  id: number;
  userId: number;
  type: 'home' | 'work' | 'other';
  address: string;
  city: string;
  region: string;
  postalCode: string;
  isDefault: boolean;
}

export interface PhoneNumber {
  id: number;
  userId: number;
  phoneNumber: string;
  isVerified: boolean;
  isDefault: boolean;
}

export interface Email {
  id: number;
  userId: number;
  email: string;
  isVerified: boolean;
  isDefault: boolean;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate?: string;
  profileImg?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  profileImg?: string;
}

export interface UserFilters {
  search?: string;
  isActive?: boolean;
  isPremium?: boolean;
  minBalance?: number;
  maxBalance?: number;
  createdAfter?: string;
  createdBefore?: string;
}

export interface UserSortOptions {
  field: 'firstName' | 'lastName' | 'email' | 'balance' | 'createdAt' | 'lastOnline';
  direction: 'asc' | 'desc';
}
