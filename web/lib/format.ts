// Intl ishlatilmaydi: server va brauzerdagi ICU maʼlumoti farq qilsa, narx har xil
// chiziladi va gidratatsiya buziladi (mehnat-aiʼda shu xato boʻlgan).
export function formatSum(value: number): string {
  const rounded = Math.round(value);
  const digits = String(Math.abs(rounded)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${rounded < 0 ? "-" : ""}${digits} soʻm`;
}

const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getDate()}-${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ageLabel(min: number | null, max: number | null): string | null {
  const part = (m: number) => (m < 12 ? `${m} oy` : `${Math.floor(m / 12)} yosh`);
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${part(min)} – ${part(max)}`;
  return min != null ? `${part(min)}dan` : `${part(max!)}gacha`;
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Qabul qilindi",
  CONFIRMED: "Tasdiqlandi",
  PROCESSING: "Yigʻilmoqda",
  SHIPPED: "Yoʻlda",
  DELIVERED: "Yetkazildi",
  CANCELLED: "Bekor qilindi",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: "Toʻlanmagan",
  PAID: "Toʻlangan",
  FAILED: "Xato",
  CANCELLED: "Bekor qilingan",
  REFUNDED: "Qaytarilgan",
};

export const PAYMENT_METHOD_LABEL: Record<string, string> = {
  PAYME: "Payme",
  CLICK: "Click",
  CASH: "Naqd, yetkazganda",
};
