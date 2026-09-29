"use client";

export type SessionKind = "user" | "admin";
type Tokens = { access_token: string; refresh_token: string };

const KEY: Record<SessionKind, string> = { user: "inbola.session", admin: "inbola.admin" };
const REFRESH_PATH: Record<SessionKind, string> = { user: "/auth/refresh", admin: "/admin/auth/refresh" };

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

// Token localStorageʼda: MVP uchun qabul qilingan xavf (docs/QUALITY_BAR.md, M5).
export function getTokens(kind: SessionKind): Tokens | null {
  try {
    const raw = localStorage.getItem(KEY[kind]);
    return raw ? (JSON.parse(raw) as Tokens) : null;
  } catch {
    return null;
  }
}

export function setTokens(kind: SessionKind, tokens: Tokens | null) {
  try {
    if (tokens) localStorage.setItem(KEY[kind], JSON.stringify({ access_token: tokens.access_token, refresh_token: tokens.refresh_token }));
    else localStorage.removeItem(KEY[kind]);
  } catch {
    /* xususiy rejim: sessiya faqat shu sahifa uchun */
  }
  window.dispatchEvent(new Event(`inbola:${kind}-session`));
}

// Bir vaqtda kelgan bir nechta 401 bitta refreshʼni kutadi — aks holda rotatsiya
// tufayli ikkinchi refresh eski tokenni yuborib sessiyani oʻchirib yuborardi.
const inflight: Partial<Record<SessionKind, Promise<boolean>>> = {};

async function refresh(kind: SessionKind): Promise<boolean> {
  inflight[kind] ??= (async () => {
    const tokens = getTokens(kind);
    if (!tokens) return false;
    const res = await fetch(`/api/v1${REFRESH_PATH[kind]}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: tokens.refresh_token }),
    });
    if (!res.ok) {
      setTokens(kind, null);
      return false;
    }
    setTokens(kind, await res.json());
    return true;
  })().finally(() => delete inflight[kind]);
  return inflight[kind]!;
}

type Options = { method?: string; body?: unknown; kind?: SessionKind; form?: FormData };

export async function api<T = unknown>(path: string, options: Options = {}, retried = false): Promise<T> {
  const kind = options.kind ?? "user";
  const tokens = getTokens(kind);
  const headers: Record<string, string> = {};
  if (tokens) headers.Authorization = `Bearer ${tokens.access_token}`;
  if (options.body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(`/api/v1${path}`, {
    method: options.method ?? (options.body !== undefined || options.form ? "POST" : "GET"),
    headers,
    body: options.form ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined),
  });

  if (res.status === 401 && tokens && !retried && (await refresh(kind))) {
    return api<T>(path, options, true);
  }
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = Array.isArray(data?.message) ? data.message.join(". ") : data?.message;
    throw new ApiError(message || "Soʻrov bajarilmadi, qayta urinib koʻring", res.status);
  }
  return (res.status === 204 ? null : res.json()) as Promise<T>;
}

export function errorText(error: unknown): string {
  return error instanceof Error ? error.message : "Kutilmagan xato";
}
