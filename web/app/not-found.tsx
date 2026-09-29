import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-5xl font-extrabold">Bu sahifa topilmadi</h1>
      <p className="text-ink-soft">Manzil notoʻgʻri yoki mahsulot sotuvdan olingan.</p>
      <ButtonLink href="/catalog">Katalogga oʻtish</ButtonLink>
    </div>
  );
}
