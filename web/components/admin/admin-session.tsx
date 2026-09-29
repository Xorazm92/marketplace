"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getTokens, setTokens } from "@/lib/client-api";

export type Admin = { id: number; phone_number: string; first_name: string; last_name: string; role: "SUPER_ADMIN" | "ADMIN" | "MODERATOR" };

type AdminSession = { admin: Admin | null; ready: boolean; reload: () => Promise<void>; signOut: () => Promise<void> };
const Context = createContext<AdminSession | null>(null);

export function AdminSessionProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const me = await (getTokens("admin") ? api<Admin>("/admin/auth/me", { kind: "admin" }).catch(() => null) : Promise.resolve(null));
    setAdmin(me);
    setReady(true);
  }, []);

  useEffect(() => {
    // Holat faqat API javobidan keyin yoziladi (reload ichidagi await); lint buni ko'rmaydi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload();
    const onChange = () => !getTokens("admin") && setAdmin(null);
    window.addEventListener("inbola:admin-session", onChange);
    return () => window.removeEventListener("inbola:admin-session", onChange);
  }, [reload]);

  const signOut = async () => {
    await api("/admin/auth/logout", { method: "POST", kind: "admin" }).catch(() => undefined);
    setTokens("admin", null);
  };

  return <Context.Provider value={{ admin, ready, reload, signOut }}>{children}</Context.Provider>;
}

export function useAdmin() {
  const value = useContext(Context);
  if (!value) throw new Error("useAdmin AdminSessionProvider ichida ishlatiladi");
  return value;
}

export const adminApi = <T,>(path: string, options: Parameters<typeof api>[1] = {}) => api<T>(path, { ...options, kind: "admin" });
