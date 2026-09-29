"use client";

import { Button } from "@/components/ui";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-4xl font-extrabold">Sahifa yuklanmadi</h1>
      <p className="text-ink-soft">Server javob bermadi. Internetni tekshirib, qayta urinib koʻring.</p>
      <Button onClick={reset}>Qayta urinish</Button>
    </div>
  );
}
