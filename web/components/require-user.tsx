"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "./session";
import { Spinner } from "./ui";

export function RequireUser({ children }: { children: React.ReactNode }) {
  const { user, ready } = useSession();
  const router = useRouter();
  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(location.pathname + location.search)}`);
  }, [ready, user, router]);
  if (!ready || !user) return <Spinner />;
  return <>{children}</>;
}
