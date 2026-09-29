import Link from "next/link";

// Oyda: backend `age_months` ga mos mahsulotlarni qaytaradi. Har kubik oraliqning oʻrtasi.
export const AGE_GROUPS = [
  { label: "0–1", unit: "yosh", months: 6, color: "bg-block-yellow" },
  { label: "1–3", unit: "yosh", months: 24, color: "bg-white" },
  { label: "3–5", unit: "yosh", months: 48, color: "bg-block-yellow" },
  { label: "5–8", unit: "yosh", months: 78, color: "bg-white" },
  { label: "8+", unit: "yosh", months: 108, color: "bg-block-yellow" },
];

export function AgePicker({ active }: { active?: number }) {
  return (
    <div className="flex flex-wrap gap-3 sm:gap-4">
      {AGE_GROUPS.map((group) => {
        const selected = active === group.months;
        return (
          <Link
            key={group.label}
            href={selected ? "/catalog" : `/catalog?age_months=${group.months}`}
            aria-pressed={selected}
            className={`block-shadow flex h-20 w-20 flex-col items-center justify-center rounded-2xl border-2 border-ink sm:h-24 sm:w-24 ${selected ? "bg-block-blue text-white" : group.color}`}
          >
            <span className="font-display text-3xl font-extrabold leading-none sm:text-4xl">{group.label}</span>
            <span className="text-xs font-semibold">{group.unit}</span>
          </Link>
        );
      })}
    </div>
  );
}
