import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, UpdateCartItemDto, RemoveFromCartDto } from './dto/cart.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreateCart(userId: number) {
    let cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                product_image: true,
                currency: true,
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { user_id: userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  product_image: true,
                  currency: true,
                },
              },
            },
          },
        },
      });
    }

    return this.calculateCartTotals(cart);
  }

  async addToCart(userId: number, addToCartDto: AddToCartDto) {
    const { product_id, quantity } = addToCartDto;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: product_id },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Get or create cart
    const cart = await this.getOrCreateCart(userId);

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findFirst({
      where: {
        cart_id: cart.id,
        product_id,
      },
    });

    if (existingItem) {
      // Update quantity and total price
      const newQuantity = existingItem.quantity + quantity;
      const newTotalPrice = Number(existingItem.unit_price) * newQuantity;

      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: newQuantity,
          total_price: newTotalPrice
        },
      });
    } else {
      // Get product price
      const product = await this.prisma.product.findUnique({
        where: { id: product_id },
        select: { price: true }
      });

      const unitPrice = product?.price || 0;
      const totalPrice = Number(unitPrice) * quantity;

      // Create new cart item
      await this.prisma.cartItem.create({
        data: {
          cart_id: cart.id,
          product_id,
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
        },
      });
    }

    return this.getOrCreateCart(userId);
  }

  async updateCartItem(userId: number, updateCartItemDto: UpdateCartItemDto) {
    const { cart_item_id, quantity } = updateCartItemDto;

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cart_item_id },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.cart.user_id !== userId) {
      throw new BadRequestException('Unauthorized to update this cart item');
    }

    await this.prisma.cartItem.update({
      where: { id: cart_item_id },
      data: { quantity },
    });

    return this.getOrCreateCart(userId);
  }

  async removeFromCart(userId: number, removeFromCartDto: RemoveFromCartDto) {
    const { cart_item_id } = removeFromCartDto;

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cart_item_id },
      include: { cart: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.cart.user_id !== userId) {
      throw new BadRequestException('Unauthorized to remove this cart item');
    }

    await this.prisma.cartItem.delete({
      where: { id: cart_item_id },
    });

    return this.getOrCreateCart(userId);
  }

  async clearCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cart_id: cart.id },
    });

    return this.getOrCreateCart(userId);
  }

  private calculateCartTotals(cart: any) {
    const total_items = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const total_amount = cart.items.reduce(
      (sum: number, item: any) => sum + (parseFloat(item.product.price) * item.quantity),
      0
    );

    return {
      ...cart,
      total_items,
      total_amount,
    };
  }

  async getUserCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      // Create new cart if doesn't exist
      return await this.prisma.cart.create({
        data: { user_id: userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    const totalAmount = cart.items.reduce((total, item) =>
      total + (Number(item.product.price) * item.quantity), 0
    );

    const totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

    return {
      ...cart,
      totalAmount,
      totalItems,
    };
  }

  async getCartCount(userId: number): Promise<number> {
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        items: true,
      },
    });

    const count = cart?.items.reduce((total, item) => total + item.quantity, 0) || 0;
    return count;
  }
}