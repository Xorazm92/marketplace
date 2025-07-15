import instance from "./instance";
import { toast } from "react-toastify";

// Wishlist API endpoints

// Get user's wishlist
export const getWishlist = async (page: number = 1, limit: number = 10) => {
  try {
    const res = await instance.get(`/wishlist?page=${page}&limit=${limit}`);
    return res.data;
  } catch (error: any) {
    console.error("Error loading wishlist:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Sevimlilar ro'yxatini yuklashda xatolik yuz berdi");
      throw new Error("Sevimlilar ro'yxatini yuklashda xatolik yuz berdi");
    }
  }
};

// Add product to wishlist
export const addToWishlist = async (productId: number) => {
  try {
    const res = await instance.post("/wishlist", { product_id: productId });
    toast.success("Mahsulot sevimlilar ro'yxatiga qo'shildi!");
    return res.data;
  } catch (error: any) {
    console.error("Error adding to wishlist:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Sevimlilar ro'yxatiga qo'shishda xatolik yuz berdi");
      throw new Error("Sevimlilar ro'yxatiga qo'shishda xatolik yuz berdi");
    }
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (productId: number) => {
  try {
    const res = await instance.delete(`/wishlist/${productId}`);
    toast.success("Mahsulot sevimlilar ro'yxatidan olib tashlandi!");
    return res.data;
  } catch (error: any) {
    console.error("Error removing from wishlist:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Sevimlilar ro'yxatidan olib tashishda xatolik yuz berdi");
      throw new Error("Sevimlilar ro'yxatidan olib tashishda xatolik yuz berdi");
    }
  }
};

// Check if product is in wishlist
export const isInWishlist = async (productId: number) => {
  try {
    const res = await instance.get(`/wishlist/check/${productId}`);
    return res.data.isInWishlist;
  } catch (error: any) {
    console.error("Error checking wishlist:", error);
    return false;
  }
};

// Toggle wishlist (add if not exists, remove if exists)
export const toggleWishlist = async (productId: number) => {
  try {
    const inWishlist = await isInWishlist(productId);
    
    if (inWishlist) {
      return await removeFromWishlist(productId);
    } else {
      return await addToWishlist(productId);
    }
  } catch (error: any) {
    console.error("Error toggling wishlist:", error);
    throw error;
  }
};

// Clear entire wishlist
export const clearWishlist = async () => {
  try {
    const res = await instance.delete("/wishlist/clear");
    toast.success("Sevimlilar ro'yxati tozalandi!");
    return res.data;
  } catch (error: any) {
    console.error("Error clearing wishlist:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Sevimlilar ro'yxatini tozalashda xatolik yuz berdi");
      throw new Error("Sevimlilar ro'yxatini tozalashda xatolik yuz berdi");
    }
  }
};

// Get wishlist count
export const getWishlistCount = async () => {
  try {
    const res = await instance.get("/wishlist/count");
    return res.data.count;
  } catch (error: any) {
    console.error("Error getting wishlist count:", error);
    return 0;
  }
};

// Move wishlist items to cart
export const moveWishlistToCart = async (productIds: number[]) => {
  try {
    const res = await instance.post("/wishlist/move-to-cart", { product_ids: productIds });
    toast.success("Mahsulotlar savatchaga ko'chirildi!");
    return res.data;
  } catch (error: any) {
    console.error("Error moving to cart:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Savatchaga ko'chirishda xatolik yuz berdi");
      throw new Error("Savatchaga ko'chirishda xatolik yuz berdi");
    }
  }
};

export default {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
  toggleWishlist,
  clearWishlist,
  getWishlistCount,
  moveWishlistToCart,
};
