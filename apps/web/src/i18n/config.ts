import { LOCALES, type Locale } from '@viraplaza/shared';

export const locales = LOCALES;
export type AppLocale = Locale;
export const defaultLocale: AppLocale = 'en';

export function isRtl(locale: string) {
  return locale === 'fa';
}
