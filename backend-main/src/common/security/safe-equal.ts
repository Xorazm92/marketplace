import { timingSafeEqual } from 'crypto';

// Oddiy `===` birinchi mos kelmagan belgida to'xtaydi va javob vaqti orqali
// imzoni belgima-belgi taxmin qilishga imkon beradi.
export function safeEqual(a: string | undefined | null, b: string | undefined | null): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}
