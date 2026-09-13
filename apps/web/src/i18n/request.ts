import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, isRtl, locales, type AppLocale } from './config';
import { isLocale } from '@viraplaza/shared';

async function resolveLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  try {
    const api = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
    const res = await fetch(`${api}/api/settings/public`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = (await res.json()) as { defaultLocale?: string };
      if (data.defaultLocale && isLocale(data.defaultLocale)) {
        return data.defaultLocale;
      }
    }
  } catch {
    // fall through
  }

  const accept = (await headers()).get('accept-language') ?? '';
  const preferred = accept.split(',')[0]?.split('-')[0];
  if (preferred && isLocale(preferred)) {
    return preferred;
  }

  return defaultLocale;
}

export default getRequestConfig(async () => {
  const locale = await resolveLocale();
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: 'Asia/Tehran',
  };
});

export { isRtl, locales };
