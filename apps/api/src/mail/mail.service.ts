import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Admin, Email } from '@prisma/client';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  // async sendMail(user: User) {
  //     const url = `${process.env.API_URL}/api/auth/activate/${user.activation_link}`;
  //     await this.mailerService.sendMail({
  //         to: user.email,
  //         subject: `PHONO-TECHga hush kelibsiz!`,
  //         template: "./confirm",
  //         context: {
  //             name: `${user.first_name} ${user.last_name}`,
  //             url
  //         },
  //     });
  // }
  async sendAdminMail(admin: Admin) {
    const url = `${process.env.API_URL}/api/auth/admin/activate/${admin.activation_link}`;
    await this.mailerService.sendMail({
      to: admin.email,
      subject: `PHONO-TECH ga hush kelibsiz!`,
      template: './confirm',
      context: {
        name: `${admin.first_name} ${admin.last_name}`,
        url,
      },
    });
  }

  // email.service.ts
  async sendEmailActivationLink(email: Email) {
    const url = `${process.env.API_URL}/api/email/activate/${email.activation_link}`;
    console.log('mail.service: email: ', email);
    console.log('mail.service: url: ', url);
    const result = await this.mailerService.sendMail({
      to: email.email,
      subject: `PHONO-TECH: Email manzilingizni tasdiqlang`,
      template: './confirm', // .hbs fayl bo'lishi kerak
      context: {
        name: email.email,
        url,
      },
    });
    console.log('mail.service: result: ', result);
  }

  // Additional methods needed by notification service
  async sendOrderConfirmation(userEmail: string, order: any) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Buyurtmangiz tasdiqlandi',
      template: './order-confirmation',
      context: {
        orderId: order.id,
        orderTotal: order.final_amount
      }
    });
  }

  async sendOrderStatusUpdate(userEmail: string, order: any, newStatus: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'Buyurtma holati yangilandi',
      template: './order-status-update',
      context: {
        orderId: order.id,
        status: newStatus
      }
    });
  }

  async sendWelcomeEmail(userEmail: string, user: any) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: 'INBOLA ga xush kelibsiz!',
      template: './welcome',
      context: {
        name: `${user.first_name} ${user.last_name}`
      }
    });
  }

  async sendPasswordReset(email: string, resetToken: string) {
    const url = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Parolni tiklash',
      template: './password-reset',
      context: {
        url
      }
    });
  }

  async sendProductApprovalNotification(userEmail: string, product: any, approved: boolean) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject: approved ? 'Mahsulotingiz tasdiqlandi' : 'Mahsulotingiz rad etildi',
      template: './product-approval',
      context: {
        productTitle: product.title,
        approved
      }
    });
  }

  async sendBulkEmail(userEmail: string, subject: string, content: string) {
    await this.mailerService.sendMail({
      to: userEmail,
      subject,
      html: content
    });
  }
}