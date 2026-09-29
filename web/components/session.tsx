"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, getTokens, setTokens } from "@/lib/client-api";
import type { CartResponse, User } from "@/lib/types";

type Session = {
  user: User | null;
  ready: boolean;
  cartCount: number;
  signIn: (tokens: { access_token: string; refresh_token: string }, user: User) => void;
  signOut: () => Promise<void>;
  reloadCart: () => Promise<void>;
  setUser: (user: User) => void;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const reloadCart = useCallback(async () => {
    const cart = await (getTokens("user") ? api<CartResponse>("/cart").catch(() => null) : Promise.resolve(null));
    setCartCount(cart?.total_items ?? 0);
  }, []);

  const load = useCallback(async () => {
    // Holat faqat javobdan keyin yoziladi (tokensiz holatda ham), shuning uchun
    // effekt ichida sinxron setState yo'q.
    const me = await (getTokens("user") ? api<User>("/auth/me").catch(() => null) : Promise.resolve(null));
    setUser(me);
    setReady(true);
    if (me) await reloadCart();
    else setCartCount(0);
  }, [reloadCart]);

  useEffect(() => {
    // Holat faqat API javobidan keyin yoziladi (load ichidagi await); lint buni ko'rmaydi.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const onChange = () => {
      if (!getTokens("user")) {
        setUser(null);
        setCartCount(0);
      }
    };
    window.addEventListener("inbola:user-session", onChange);
    return () => window.removeEventListener("inbola:user-session", onChange);
  }, [load]);

  const value: Session = {
    user,
    ready,
    cartCount,
    setUser,
    reloadCart,
    signIn: (tokens, nextUser) => {
      setTokens("user", tokens);
      setUser(nextUser);
      reloadCart();
    },
    signOut: async () => {
      await api("/auth/logout", { method: "POST" }).catch(() => undefined);
      setTokens("user", null);
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession SessionProvider ichida ishlatiladi");
  return session;
}
