export type ApiError = { message: string; status: number };

/** Prefer same-origin `/api` proxy so auth cookies attach to the web app host. */
function apiBase() {
  if (typeof window !== 'undefined') {
    return '';
  }
  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${apiBase()}/api${path}`, {
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

export function currencyLabel(locale: string) {
  return locale === 'fa' ? 'ریال' : 'IRR';
}

export function formatRials(amount: number, locale: string) {
  const formatted = new Intl.NumberFormat(
    locale === 'fa' ? 'fa-IR' : locale === 'de' ? 'de-DE' : 'en-US',
    {
      style: 'decimal',
      maximumFractionDigits: 0,
    },
  ).format(amount);
  return `${formatted} ${currencyLabel(locale)}`;
}
