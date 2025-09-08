import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as paypal from '@paypal/checkout-server-sdk';

@Injectable()
export class PayPalService {
  private client: paypal.core.PayPalHttpClient;

  constructor(private configService: ConfigService) {
    const environment = this.configService.get('NODE_ENV') === 'production'
      ? new paypal.core.LiveEnvironment(
          this.configService.get('PAYPAL_CLIENT_ID'),
          this.configService.get('PAYPAL_CLIENT_SECRET')
        )
      : new paypal.core.SandboxEnvironment(
          this.configService.get('PAYPAL_CLIENT_ID'),
          this.configService.get('PAYPAL_CLIENT_SECRET')
        );

    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createOrder(amount: number, currency = 'USD', returnUrl: string, cancelUrl: string) {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        shipping_preference: 'NO_SHIPPING',
      },
      purchase_units: [{
        amount: {
          currency_code: currency,
          value: amount.toString(),
        },
      }],
    });

    try {
      const order = await this.client.execute(request);
      return {
        id: order.result.id,
        status: order.result.status,
        links: order.result.links,
      };
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw new HttpException('PayPal order creation failed', HttpStatus.BAD_REQUEST);
    }
  }

  async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    try {
      const capture = await this.client.execute(request);
      return {
        id: capture.result.id,
        status: capture.result.status,
        purchase_units: capture.result.purchase_units,
      };
    } catch (error) {
      console.error('PayPal capture error:', error);
      throw new HttpException('PayPal capture failed', HttpStatus.BAD_REQUEST);
    }
  }

  async refundPayment(captureId: string, amount: number, currency = 'USD') {
    const request = new paypal.payments.CapturesRefundRequest(captureId);
    request.requestBody({
      amount: {
        value: amount.toString(),
        currency_code: currency,
      },
    });

    try {
      const refund = await this.client.execute(request);
      return {
        id: refund.result.id,
        status: refund.result.status,
      };
    } catch (error) {
      console.error('PayPal refund error:', error);
      throw new HttpException('PayPal refund failed', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyWebhookSignature(headers: any, body: string): Promise<boolean> {
    try {
      const webhookId = this.configService.get('PAYPAL_WEBHOOK_ID');
      const request = new paypal.notifications.WebhookVerifySignatureRequest();
      
      request.requestBody({
        auth_algo: headers['paypal-auth-algo'],
        cert_id: headers['paypal-cert-id'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(body),
      });

      const response = await this.client.execute(request);
      return response.result.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('PayPal webhook verification error:', error);
      return false;
    }
  }
}
