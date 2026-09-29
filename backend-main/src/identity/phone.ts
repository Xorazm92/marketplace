import { BadRequestException } from '@nestjs/common';

// Bitta foydalanuvchi "+998 90 123-45-67" va "901234567" deb ikki xil yozib,
// ikkita hisob ochmasligi uchun raqam bazaga faqat +998XXXXXXXXX ko'rinishida tushadi.
export function normalizeUzPhone(input: string): string {
  const digits = String(input ?? '').replace(/\D/g, '');
  const full = digits.length === 9 ? `998${digits}` : digits;
  if (!/^998\d{9}$/.test(full)) {
    throw new BadRequestException("Telefon raqami noto'g'ri. Namuna: +998901234567");
  }
  return `+${full}`;
}
