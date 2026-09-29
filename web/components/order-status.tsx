import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/format";

const TONE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-ink",
  CONFIRMED: "bg-blue-100 text-ink",
  PROCESSING: "bg-blue-100 text-ink",
  SHIPPED: "bg-blue-100 text-ink",
  DELIVERED: "bg-green-100 text-ink",
  CANCELLED: "bg-slate-200 text-ink-soft",
  PAID: "bg-green-100 text-ink",
  REFUNDED: "bg-slate-200 text-ink-soft",
};

export function StatusBadge({ status, kind = "order" }: { status: string; kind?: "order" | "payment" }) {
  const label = (kind === "order" ? ORDER_STATUS_LABEL : PAYMENT_STATUS_LABEL)[status] ?? status;
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${TONE[status] ?? "bg-slate-100"}`}>{label}</span>;
}

// Buyurtma bosqichlari haqiqatan ketma-ket — shuning uchun bosqich chizigʻi.
const STEPS = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"];

export function OrderProgress({ status }: { status: string }) {
  if (status === "CANCELLED") return null;
  const current = STEPS.indexOf(status);
  return (
    <ol className="grid grid-cols-5 gap-1 text-center text-xs font-semibold">
      {STEPS.map((step, i) => (
        <li key={step}>
          <div className={`mb-1 h-2 rounded-full ${i <= current ? "bg-block-blue" : "bg-line"}`} />
          <span className={i <= current ? "text-ink" : "text-ink-soft"}>{ORDER_STATUS_LABEL[step]}</span>
        </li>
      ))}
    </ol>
  );
}
