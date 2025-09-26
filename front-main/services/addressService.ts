export interface Region {
  id: number;
  name: string;
  nameUz: string;
  districts: District[];
}

export interface District {
  id: number;
  name: string;
  nameUz: string;
  regionId: number;
}

export interface Address {
  id?: number;
  regionId: number;
  districtId: number;
  street: string;
  house: string;
  apartment?: string;
  landmark?: string;
  phone: string;
  recipientName: string;
  isDefault: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

class AddressService {
  private readonly STORAGE_KEY = 'inbola_addresses';

  // O'zbekiston viloyatlari va shaharlari
  private readonly regions: Region[] = [
    {
      id: 1,
      name: 'Toshkent shahri',
      nameUz: 'Toshkent shahri',
      districts: [
        { id: 1, name: 'Bektemir tumani', nameUz: 'Bektemir tumani', regionId: 1 },
        { id: 2, name: 'Mirzo Ulug\'bek tumani', nameUz: 'Mirzo Ulug\'bek tumani', regionId: 1 },
        { id: 3, name: 'Mirobod tumani', nameUz: 'Mirobod tumani', regionId: 1 },
        { id: 4, name: 'Olmazor tumani', nameUz: 'Olmazor tumani', regionId: 1 },
        { id: 5, name: 'Sergeli tumani', nameUz: 'Sergeli tumani', regionId: 1 },
        { id: 6, name: 'Shayxontohur tumani', nameUz: 'Shayxontohur tumani', regionId: 1 },
        { id: 7, name: 'Chilonzor tumani', nameUz: 'Chilonzor tumani', regionId: 1 },
        { id: 8, name: 'Yakkasaroy tumani', nameUz: 'Yakkasaroy tumani', regionId: 1 },
        { id: 9, name: 'Yunusobod tumani', nameUz: 'Yunusobod tumani', regionId: 1 },
        { id: 10, name: 'Yashnobod tumani', nameUz: 'Yashnobod tumani', regionId: 1 },
        { id: 11, name: 'Uchtepa tumani', nameUz: 'Uchtepa tumani', regionId: 1 }
      ]
    },
    {
      id: 2,
      name: 'Toshkent viloyati',
      nameUz: 'Toshkent viloyati',
      districts: [
        { id: 12, name: 'Angren shahri', nameUz: 'Angren shahri', regionId: 2 },
        { id: 13, name: 'Bekobod shahri', nameUz: 'Bekobod shahri', regionId: 2 },
        { id: 14, name: 'Chirchiq shahri', nameUz: 'Chirchiq shahri', regionId: 2 },
        { id: 15, name: 'Olmaliq shahri', nameUz: 'Olmaliq shahri', regionId: 2 },
        { id: 16, name: 'Ohangaron shahri', nameUz: 'Ohangaron shahri', regionId: 2 },
        { id: 17, name: 'Yangiyo\'l shahri', nameUz: 'Yangiyo\'l shahri', regionId: 2 }
      ]
    },
    {
      id: 3,
      name: 'Samarqand viloyati',
      nameUz: 'Samarqand viloyati',
      districts: [
        { id: 18, name: 'Samarqand shahri', nameUz: 'Samarqand shahri', regionId: 3 },
        { id: 19, name: 'Bulung\'ur tumani', nameUz: 'Bulung\'ur tumani', regionId: 3 },
        { id: 20, name: 'Ishtixon tumani', nameUz: 'Ishtixon tumani', regionId: 3 },
        { id: 21, name: 'Kattaqo\'rg\'on shahri', nameUz: 'Kattaqo\'rg\'on shahri', regionId: 3 }
      ]
    },
    {
      id: 4,
      name: 'Farg\'ona viloyati',
      nameUz: 'Farg\'ona viloyati',
      districts: [
        { id: 22, name: 'Farg\'ona shahri', nameUz: 'Farg\'ona shahri', regionId: 4 },
        { id: 23, name: 'Marg\'ilon shahri', nameUz: 'Marg\'ilon shahri', regionId: 4 },
        { id: 24, name: 'Qo\'qon shahri', nameUz: 'Qo\'qon shahri', regionId: 4 },
        { id: 25, name: 'Oltiariq tumani', nameUz: 'Oltiariq tumani', regionId: 4 }
      ]
    },
    {
      id: 5,
      name: 'Andijon viloyati',
      nameUz: 'Andijon viloyati',
      districts: [
        { id: 26, name: 'Andijon shahri', nameUz: 'Andijon shahri', regionId: 5 },
        { id: 27, name: 'Xonobod shahri', nameUz: 'Xonobod shahri', regionId: 5 },
        { id: 28, name: 'Asaka tumani', nameUz: 'Asaka tumani', regionId: 5 }
      ]
    }
  ];

  getRegions(): Region[] {
    return this.regions;
  }

  getDistrictsByRegion(regionId: number): District[] {
    const region = this.regions.find(r => r.id === regionId);
    return region ? region.districts : [];
  }

  getRegionById(regionId: number): Region | undefined {
    return this.regions.find(r => r.id === regionId);
  }

  getDistrictById(districtId: number): District | undefined {
    for (const region of this.regions) {
      const district = region.districts.find(d => d.id === districtId);
      if (district) return district;
    }
    return undefined;
  }

  // Address Management
  getStoredAddresses(): Address[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  saveAddress(address: Omit<Address, 'id'>): Address {
    const addresses = this.getStoredAddresses();
    const newAddress: Address = {
      ...address,
      id: Date.now()
    };

    // If this is set as default, remove default from others
    if (newAddress.isDefault) {
      addresses.forEach(addr => addr.isDefault = false);
    }

    addresses.push(newAddress);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(addresses));
    return newAddress;
  }

  updateAddress(id: number, updates: Partial<Address>): boolean {
    const addresses = this.getStoredAddresses();
    const index = addresses.findIndex(addr => addr.id === id);
    
    if (index === -1) return false;

    // If setting as default, remove default from others
    if (updates.isDefault) {
      addresses.forEach(addr => addr.isDefault = false);
    }

    addresses[index] = { ...addresses[index], ...updates };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(addresses));
    return true;
  }

  deleteAddress(id: number): boolean {
    const addresses = this.getStoredAddresses();
    const filteredAddresses = addresses.filter(addr => addr.id !== id);
    
    if (filteredAddresses.length < addresses.length) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredAddresses));
      return true;
    }
    return false;
  }

  getDefaultAddress(): Address | undefined {
    const addresses = this.getStoredAddresses();
    return addresses.find(addr => addr.isDefault);
  }

  setDefaultAddress(id: number): boolean {
    const addresses = this.getStoredAddresses();
    
    // Remove default from all addresses
    addresses.forEach(addr => addr.isDefault = false);
    
    // Set new default
    const targetAddress = addresses.find(addr => addr.id === id);
    if (targetAddress) {
      targetAddress.isDefault = true;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(addresses));
      return true;
    }
    return false;
  }

  formatAddress(address: Address): string {
    const region = this.getRegionById(address.regionId);
    const district = this.getDistrictById(address.districtId);
    
    let formatted = '';
    if (region) formatted += region.nameUz;
    if (district) formatted += `, ${district.nameUz}`;
    if (address.street) formatted += `, ${address.street}`;
    if (address.house) formatted += `, ${address.house}`;
    if (address.apartment) formatted += `, ${address.apartment}`;
    
    return formatted;
  }

  validateAddress(address: Partial<Address>): string[] {
    const errors: string[] = [];
    
    if (!address.regionId) errors.push('Viloyatni tanlang');
    if (!address.districtId) errors.push('Tumanni tanlang');
    if (!address.street?.trim()) errors.push('Ko\'cha nomini kiriting');
    if (!address.house?.trim()) errors.push('Uy raqamini kiriting');
    if (!address.phone?.trim()) errors.push('Telefon raqamini kiriting');
    if (!address.recipientName?.trim()) errors.push('Qabul qiluvchi ismini kiriting');
    
    // Phone validation
    if (address.phone && !/^\+998\d{9}$/.test(address.phone)) {
      errors.push('Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak');
    }
    
    return errors;
  }

  // GPS Location
  async getCurrentLocation(): Promise<{ lat: number; lng: number } | null> {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => resolve(null),
        { timeout: 10000 }
      );
    });
  }

  // Delivery Zone Check
  isInDeliveryZone(regionId: number, districtId: number): boolean {
    // Toshkent shahri va Toshkent viloyati - bepul yetkazib berish
    if (regionId === 1 || regionId === 2) return true;
    
    // Boshqa viloyatlar - pullik yetkazib berish
    return regionId <= 5; // Faqat 5 ta viloyatga yetkazib berish
  }

  getDeliveryPrice(regionId: number, districtId: number): number {
    if (regionId === 1) return 0; // Toshkent shahri - bepul
    if (regionId === 2) return 15000; // Toshkent viloyati - 15,000 so'm
    if (regionId >= 3 && regionId <= 5) return 25000; // Boshqa viloyatlar - 25,000 so'm
    return -1; // Yetkazib berish yo'q
  }
}

export const addressService = new AddressService();
export default addressService;
