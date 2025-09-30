// @ts-nocheck
import { Injectable, Logger, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentGatewayService } from './payment-gateway.service';
import * as crypto from 'crypto';

@Injectable()
export class WebhookHandler {
  private readonly logger = new Logger(WebhookHandler.name);

  constructor(private readonly paymentService: PaymentGatewayService) {}

  async handleClickWebhook(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const { click_trans_id, service_id, merchant_trans_id, amount, action, sign_time, sign_string } = req.body;

      // Verify signature
      const expectedSignature = this.generateClickSignature(req.body);
      if (sign_string !== expectedSignature) {
        res.status(400).json({ error: 'Invalid signature' });
        return;
      }

      // Process based on action
      switch (action) {
        case '0': // Prepare
          await this.handleClickPrepare(click_trans_id, merchant_trans_id, amount);
          res.json({ click_trans_id, merchant_trans_id, error: 0, error_note: 'Success' });
          break;
        case '1': // Complete
          await this.handleClickComplete(click_trans_id, merchant_trans_id, amount);
          res.json({ click_trans_id, merchant_trans_id, error: 0, error_note: 'Success' });
          break;
        default:
          res.status(400).json({ error: 'Invalid action' });
      }
    } catch (error) {
      this.logger.error(`Click webhook error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async handlePaymeWebhook(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const { method, params } = req.body;

      // Verify authorization
      const auth = req.headers.authorization;
      if (!this.verifyPaymeAuth(auth)) {
        res.status(401).json({ error: { code: -32504, message: 'Access denied' } });
        return;
      }

      let result;
      switch (method) {
        case 'CheckPerformTransaction':
          result = await this.handlePaymeCheck(params);
          break;
        case 'CreateTransaction':
          result = await this.handlePaymeCreate(params);
          break;
        case 'PerformTransaction':
          result = await this.handlePaymePerform(params);
          break;
        case 'CancelTransaction':
          result = await this.handlePaymeCancel(params);
          break;
        case 'CheckTransaction':
          result = await this.handlePaymeCheckStatus(params);
          break;
        case 'GetStatement':
          result = await this.handlePaymeStatement(params);
          break;
        default:
          result = { error: { code: -32601, message: 'Method not found' } };
      }

      res.json({ result });
    } catch (error) {
      this.logger.error(`Payme webhook error: ${error.message}`);
      res.status(500).json({ error: { code: -32400, message: 'System error' } });
    }
  }

  async handleUzumWebhook(@Req() req: Request, @Res() res: Response): Promise<void> {
    try {
      const signature = req.headers['x-signature'] as string;
      const body = JSON.stringify(req.body);

      if (!this.verifyUzumSignature(body, signature)) {
        res.status(401).json({ error: 'Invalid signature' });
        return;
      }

      const { event, data } = req.body;

      switch (event) {
        case 'payment.success':
          await this.handleUzumSuccess(data);
          break;
        case 'payment.failed':
          await this.handleUzumFailed(data);
          break;
        case 'payment.refunded':
          await this.handleUzumRefunded(data);
          break;
        default:
          this.logger.warn(`Unknown Uzum event: ${event}`);
      }

      res.json({ success: true });
    } catch (error) {
      this.logger.error(`Uzum webhook error: ${error.message}`);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  private generateClickSignature(params: any): string {
    const secretKey = process.env.CLICK_SECRET_KEY;
    const stringToSign = `${params.click_trans_id}${secretKey}${params.service_id}${params.merchant_trans_id}`;
    return crypto.createHash('md5').update(stringToSign).digest('hex');
  }

  private verifyPaymeAuth(auth: string): boolean {
    const expectedAuth = `Basic ${Buffer.from(process.env.PAYME_LOGIN + ':' + process.env.PAYME_KEY).toString('base64')}`;
    return auth === expectedAuth;
  }

  private verifyUzumSignature(body: string, signature: string): boolean {
    const secretKey = process.env.UZUM_WEBHOOK_SECRET;
    const expectedSignature = crypto.createHmac('sha256', secretKey).update(body).digest('hex');
    return signature === expectedSignature;
  }

  // Handler implementations
  private async handleClickPrepare(clickId: string, merchantId: string, amount: number) {
    // Validate transaction
    const transaction = await this.paymentService.getTransactionStatus(merchantId);
    if (!transaction || transaction.amount !== amount) {
      throw new Error('Invalid transaction');
    }
  }

  private async handleClickComplete(clickId: string, merchantId: string, amount: number) {
    await this.paymentService.verifyPayment('click', merchantId, {
      click_trans_id: clickId,
      amount: amount
    });
  }

  private async handlePaymeCheck(params: any) {
    // Validate transaction
    const transaction = await this.paymentService.getTransactionStatus(params.account);
    
    if (!transaction) {
      return { error: { code: -31050, message: 'Transaction not found' } };
    }

    return { allow: true };
  }

  private async handlePaymeCreate(params: any) {
    // Create transaction in Payme
    return {
      create_time: Date.now(),
      transaction: params.id,
      state: 1
    };
  }

  private async handlePaymePerform(params: any) {
    // Complete transaction
    await this.paymentService.verifyPayment('payme', params.account, params);
    
    return {
      transaction: params.id,
      perform_time: Date.now(),
      state: 2
    };
  }

  private async handlePaymeCancel(params: any) {
    // Cancel transaction
    return {
      transaction: params.id,
      cancel_time: Date.now(),
      state: -1
    };
  }

  private async handlePaymeCheckStatus(params: any) {
    const transaction = await this.paymentService.getTransactionStatus(params.id);
    return {
      create_time: transaction.created_at.getTime(),
      perform_time: transaction.updated_at.getTime(),
      cancel_time: null,
      transaction: params.id,
      state: transaction.status === 'completed' ? 2 : 1,
      reason: null
    };
  }

  private async handlePaymeStatement(params: any) {
    const transactions = await this.paymentService.getTransactionStatement(
      params.from,
      params.to
    );
    
    return {
      transactions: transactions.map(t => ({
        id: t.id,
        time: t.created_at.getTime(),
        amount: t.amount * 100,
        account: t.order_id,
        create_time: t.created_at.getTime(),
        perform_time: t.updated_at.getTime(),
        cancel_time: null,
        state: t.status === 'completed' ? 2 : 1,
        reason: null
      }))
    };
  }

  private async handleUzumSuccess(data: any) {
    await this.paymentService.verifyPayment('uzum', data.order_id, data);
  }

  private async handleUzumFailed(data: any) {
    // Handle failed payment
    this.logger.error(`Uzum payment failed: ${JSON.stringify(data)}`);
  }

  private async handleUzumRefunded(data: any) {
    // Handle refund webhook
    this.logger.log(`Uzum refund processed: ${JSON.stringify(data)}`);
  }
}
