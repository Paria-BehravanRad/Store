const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type ApiError = { message: string; status: number };

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      (body as { message?: string | string[] }).message?.toString() ??
      `Request failed (${res.status})`;
    throw Object.assign(new Error(message), { status: res.status }) as Error & ApiError;
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function formatRials(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : locale === 'de' ? 'de-DE' : 'en-US', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount);
}
