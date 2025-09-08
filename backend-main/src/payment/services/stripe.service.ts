import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe | null;
  private readonly logger = new Logger(StripeService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!apiKey) {
      this.logger.warn('Stripe secret key (STRIPE_SECRET_KEY) not set. Stripe features are disabled.');
      this.stripe = null;
      return;
    }
    this.stripe = new Stripe(apiKey);
  }

  async createPaymentIntent(amount: number, currency = 'usd', metadata: any = {}) {
    try {
      if (!this.stripe) {
        throw new HttpException('Stripe is not configured', HttpStatus.SERVICE_UNAVAILABLE);
      }
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
        metadata,
      });

      return {
        client_secret: paymentIntent.client_secret,
        id: paymentIntent.id,
        status: paymentIntent.status,
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw new HttpException('Stripe payment intent creation failed', HttpStatus.BAD_REQUEST);
    }
  }

  async confirmPaymentIntent(paymentIntentId: string) {
    try {
      if (!this.stripe) {
        throw new HttpException('Stripe is not configured', HttpStatus.SERVICE_UNAVAILABLE);
      }
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount_received: paymentIntent.amount_received,
      };
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      throw new HttpException('Stripe payment confirmation failed', HttpStatus.BAD_REQUEST);
    }
  }

  async createRefund(paymentIntentId: string, amount?: number) {
    try {
      if (!this.stripe) {
        throw new HttpException('Stripe is not configured', HttpStatus.SERVICE_UNAVAILABLE);
      }
      const refund = await this.stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: amount ? Math.round(amount * 100) : undefined,
      });

      return {
        id: refund.id,
        status: refund.status,
        amount: refund.amount / 100,
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
      throw new HttpException('Stripe refund failed', HttpStatus.BAD_REQUEST);
    }
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const webhookSecret = this.configService.get('STRIPE_WEBHOOK_SECRET');
    
    try {
      if (!this.stripe) {
        throw new HttpException('Stripe is not configured', HttpStatus.SERVICE_UNAVAILABLE);
      }
      const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
      return event;
    } catch (error) {
      console.error('Stripe webhook signature verification error:', error);
      throw new HttpException('Invalid webhook signature', HttpStatus.BAD_REQUEST);
    }
  }

  async retrievePaymentIntent(paymentIntentId: string) {
    try {
      if (!this.stripe) {
        throw new HttpException('Stripe is not configured', HttpStatus.SERVICE_UNAVAILABLE);
      }
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);
      return {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata,
      };
    } catch (error) {
      console.error('Stripe payment intent retrieval error:', error);
      throw new HttpException('Payment intent not found', HttpStatus.NOT_FOUND);
    }
  }
}
