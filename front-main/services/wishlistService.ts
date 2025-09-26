import { toast } from "react-toastify";
import * as wishlistAPI from "../endpoints/wishlist";

export interface WishlistItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  image: string;
  slug: string;
  addedDate: string;
}

class WishlistService {
  private readonly STORAGE_KEY = 'inbola_wishlist';

  // Local Storage Methods
  getLocalWishlist(): WishlistItem[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  saveLocalWishlist(items: WishlistItem[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving wishlist:', error);
    }
  }

  addToLocalWishlist(item: Omit<WishlistItem, 'id' | 'addedDate'>): WishlistItem {
    const wishlist = this.getLocalWishlist();
    
    const existingItem = wishlist.find(w => w.productId === item.productId);
    if (existingItem) {
      toast.info('Mahsulot allaqachon sevimlilar ro\'yxatida');
      return existingItem;
    }

    const newItem: WishlistItem = {
      ...item,
      id: Date.now(),
      addedDate: new Date().toISOString()
    };

    wishlist.push(newItem);
    this.saveLocalWishlist(wishlist);
    toast.success('Sevimlilar ro\'yxatiga qo\'shildi!');
    return newItem;
  }

  // Hybrid Methods (Server + Local)
  async getWishlist(isAuthenticated: boolean): Promise<WishlistItem[]> {
    if (isAuthenticated) {
      try {
        const response = await wishlistAPI.getWishlist();
        return response.items || [];
      } catch (error) {
        return this.getLocalWishlist();
      }
    }
    return this.getLocalWishlist();
  }

  async toggleWishlist(item: Omit<WishlistItem, 'id' | 'addedDate'>, isAuthenticated: boolean): Promise<boolean> {
    if (isAuthenticated) {
      try {
        await wishlistAPI.toggleWishlist(item.productId);
        return true;
      } catch (error) {
        return this.toggleLocalWishlist(item);
      }
    }
    return this.toggleLocalWishlist(item);
  }

  private toggleLocalWishlist(item: Omit<WishlistItem, 'id' | 'addedDate'>): boolean {
    const wishlist = this.getLocalWishlist();
    const existingIndex = wishlist.findIndex(w => w.productId === item.productId);
    
    if (existingIndex >= 0) {
      wishlist.splice(existingIndex, 1);
      this.saveLocalWishlist(wishlist);
      toast.success('Sevimlilardan olib tashlandi!');
      return false;
    } else {
      this.addToLocalWishlist(item);
      return true;
    }
  }

  // Share Methods
  generateShareUrl(items: WishlistItem[]): string {
    const shareId = Date.now().toString();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://inbola.uz';
    
    // Save to localStorage temporarily
    try {
      localStorage.setItem(`wishlist_share_${shareId}`, JSON.stringify({
        items,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
    } catch (error) {
      console.error('Error saving share data:', error);
    }
    
    return `${baseUrl}/wishlist/shared/${shareId}`;
  }

  async shareViaEmail(email: string, items: WishlistItem[]): Promise<void> {
    const shareUrl = this.generateShareUrl(items);
    const subject = 'Sevimlilar ro\'yxati - INBOLA';
    const body = `Salom! Men INBOLA da ${items.length} ta mahsulotni tanladim. Ko'rishingiz mumkin: ${shareUrl}`;
    
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    if (typeof window !== 'undefined') {
      window.open(mailtoUrl);
      toast.success('Email dasturi ochildi!');
    }
  }
}

export const wishlistService = new WishlistService();
export default wishlistService;
