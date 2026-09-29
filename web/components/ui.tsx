import Link from "next/link";
import type { ComponentProps } from "react";

// Asosiy harakat — sariq kubik; ikkinchi darajali — oq, chiziqli.
const base = "inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50";
export const buttonStyles = {
  primary: `${base} bg-block-yellow text-ink block-shadow`,
  secondary: `${base} border-2 border-ink bg-white text-ink hover:bg-paper`,
  danger: `${base} border-2 border-block-red bg-white text-block-red hover:bg-red-50`,
  quiet: `${base} px-3 text-block-blue hover:underline`,
};

export function Button({ variant = "primary", className = "", ...props }: ComponentProps<"button"> & { variant?: keyof typeof buttonStyles }) {
  return <button className={`${buttonStyles[variant]} ${className}`} {...props} />;
}

export function ButtonLink({ variant = "primary", className = "", ...props }: ComponentProps<typeof Link> & { variant?: keyof typeof buttonStyles }) {
  return <Link className={`${buttonStyles[variant]} ${className}`} {...props} />;
}

// Yordamchi matn label'dan tashqarida: aks holda u maydonning nomiga qo'shilib ketadi
// (ekran o'quvchisi "Manzil Ko'cha, uy..." deb o'qiydi).
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold">{label}</span>
        {children}
      </label>
      {hint && !error && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      {error && <p className="mt-1 text-sm text-block-red">{error}</p>}
    </div>
  );
}

export const inputStyles = "w-full rounded-xl border-2 border-line bg-white px-3 py-2.5 outline-none focus:border-block-blue";

export function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p role="alert" className="rounded-xl border-2 border-block-red bg-red-50 px-4 py-3 text-sm text-block-red">{children}</p>;
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-line bg-white px-6 py-12 text-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      {children && <div className="mx-auto mt-3 max-w-md text-ink-soft">{children}</div>}
    </div>
  );
}

export function Spinner({ label = "Yuklanmoqda" }: { label?: string }) {
  return (
    <p className="py-10 text-center text-ink-soft" aria-live="polite">
      {label}…
    </p>
  );
}
