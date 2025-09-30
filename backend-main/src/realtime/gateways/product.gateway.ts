// @ts-nocheck
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { ProductService } from '../services/product.service';
import { RealtimeGateway } from './realtime.gateway';

@WebSocketGateway({ namespace: '/products' })
export class ProductGateway {
  constructor(
    private readonly productService: ProductService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @SubscribeMessage('subscribeToProduct')
  async handleSubscribeToProduct(
    @MessageBody() data: { productId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`product:${data.productId}`);
    
    const product = await this.productService.getProduct(data.productId);
    client.emit('productUpdate', product);

    return { success: true };
  }

  @SubscribeMessage('subscribeToCategory')
  async handleSubscribeToCategory(
    @MessageBody() data: { categoryId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`category:${data.categoryId}`);
    
    const products = await this.productService.getCategoryProducts(data.categoryId);
    client.emit('categoryProducts', products);

    return { success: true };
  }

  @SubscribeMessage('subscribeToSearch')
  async handleSubscribeToSearch(
    @MessageBody() data: { query: string; filters?: any },
    @ConnectedSocket() client: Socket,
  ) {
    const searchId = `search:${Buffer.from(JSON.stringify({ query: data.query, filters: data.filters })).toString('base64')}`;
    client.join(searchId);
    
    const results = await this.productService.searchProducts(data.query, data.filters);
    client.emit('searchResults', results);

    return { success: true, searchId };
  }

  async emitProductUpdate(productId: string, update: any) {
    this.realtimeGateway.emitToRoom(`product:${productId}`, 'productUpdate', {
      productId,
      ...update,
      timestamp: new Date(),
    });
  }

  async emitProductStockUpdate(productId: string, stock: number) {
    this.realtimeGateway.emitToRoom(`product:${productId}`, 'stockUpdate', {
      productId,
      stock,
      timestamp: new Date(),
    });
  }

  async emitPriceUpdate(productId: string, oldPrice: number, newPrice: number) {
    this.realtimeGateway.emitToRoom(`product:${productId}`, 'priceUpdate', {
      productId,
      oldPrice,
      newPrice,
      timestamp: new Date(),
    });
  }

  async emitNewProduct(product: any) {
    this.realtimeGateway.emitToRoom(`category:${product.category_id}`, 'newProduct', {
      product,
      timestamp: new Date(),
    });
  }
}
