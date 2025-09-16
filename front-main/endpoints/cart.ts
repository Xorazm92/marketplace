import instance from "./instance";
import { toast } from "react-toastify";

// Cart API endpoints
export const getCart = async () => {
  try {
    const res = await instance.get("/api/v1/cart");
    return res.data;
  } catch (error: any) {
    console.error("Error loading cart:", error);

    // Agar foydalanuvchi login qilmagan bo'lsa, bo'sh cart qaytarish
    if (error.response?.status === 401 || error.response?.status === 403) {
      return {
        items: [],
        total_amount: 0,
        total_items: 0
      };
    }

    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Savatchani yuklashda xatolik yuz berdi");
      throw new Error("Savatchani yuklashda xatolik yuz berdi");
    }
  }
};

export const addToCart = async (productId: number, quantity: number = 1) => {
  try {
    const res = await instance.post("/api/v1/cart/add", {
      product_id: productId,
      quantity: quantity
    });
    toast.success("Mahsulot savatchaga qo'shildi!");
    return res.data;
  } catch (error: any) {
    console.error("Error adding to cart:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Savatchaga qo'shishda xatolik yuz berdi");
      throw new Error("Savatchaga qo'shishda xatolik yuz berdi");
    }
  }
};

export const updateCartItem = async (cartItemId: number, quantity: number) => {
  try {
    const res = await instance.put("/api/v1/cart/update", {
      cart_item_id: cartItemId,
      quantity: quantity
    });
    toast.success("Savatcha yangilandi!");
    return res.data;
  } catch (error: any) {
    console.error("Error updating cart:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Savatchani yangilashda xatolik yuz berdi");
      throw new Error("Savatchani yangilashda xatolik yuz berdi");
    }
  }
};

export const removeFromCart = async (cartItemId: number) => {
  try {
    const res = await instance.delete("/api/v1/cart/remove", {
      data: { cart_item_id: cartItemId }
    });
    toast.success("Mahsulot savatchadan olib tashlandi!");
    return res.data;
  } catch (error: any) {
    console.error("Error removing from cart:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Savatchadan olib tashlashda xatolik yuz berdi");
      throw new Error("Savatchadan olib tashlashda xatolik yuz berdi");
    }
  }
};

export const clearCart = async () => {
  try {
    const res = await instance.delete("/api/v1/cart/clear");
    toast.success("Savatcha tozalandi!");
    return res.data;
  } catch (error: any) {
    console.error("Error clearing cart:", error);
    if (error.response?.data?.message) {
      toast.error(error.response.data.message);
      throw new Error(error.response.data.message);
    } else if (error.message) {
      toast.error(error.message);
      throw new Error(error.message);
    } else {
      toast.error("Savatchani tozalashda xatolik yuz berdi");
      throw new Error("Savatchani tozalashda xatolik yuz berdi");
    }
  }
};
