import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { OrderService } from '../order/order.service';

@Injectable()
export class AdminOrOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private orderService: OrderService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const orderId = parseInt(request.params.id);

    if (!user || !orderId) {
      throw new ForbiddenException('Access denied');
    }

    // Admin har doim ruxsat
    if (user.role === 'admin' || user.is_admin) {
      return true;
    }

    try {
      // Order egasini tekshirish
      const order = await this.orderService.findOne(orderId);
      
      if (order.user_id === user.id) {
        return true;
      }

      throw new ForbiddenException('You can only access your own orders');
    } catch (error) {
      throw new ForbiddenException('Access denied');
    }
  }
}
