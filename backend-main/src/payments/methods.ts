import { ConfigService } from '@nestjs/config';

// Bitta manba: checkout ko'rsatadigan va buyurtma qabul qiladigan usullar bir xil.
// Faqat env'ga tayanadi — OrderModule va PaymentsModule bir-birini import qilmasin.
export function enabledPaymentMethods(config: ConfigService): string[] {
  const methods: string[] = [];
  if (config.get('PAYME_MERCHANT_ID') && config.get('PAYME_SECRET_KEY')) methods.push('PAYME');
  if (config.get('CLICK_SERVICE_ID') && config.get('CLICK_MERCHANT_ID') && config.get('CLICK_SECRET_KEY')) methods.push('CLICK');
  if (config.get('CASH_ON_DELIVERY_ENABLED') !== 'false') methods.push('CASH');
  return methods;
}
