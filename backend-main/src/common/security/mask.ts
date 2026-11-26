// Loglar uchun: telefon raqami shaxsiy ma'lumot, lekin voqeani bog'lash uchun uning
// boshi (operator kodi) va oxirgi ikki raqami yetarli. "+998901234567" → "+99890*****67".
export function maskPhone(phone: string | null | undefined): string {
  const value = String(phone ?? '');
  if (value.length < 8) return '***';
  return `${value.slice(0, 6)}${'*'.repeat(value.length - 8)}${value.slice(-2)}`;
}
