import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Cormorant_Garamond, Manrope, Vazirmatn } from 'next/font/google';
import { SiteHeader } from '@/components/site-header';
import { CartProvider } from '@/lib/cart';
import { isRtl } from '@/i18n/config';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});

const sans = Manrope({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fa = Vazirmatn({
  subsets: ['arabic'],
  variable: '--font-fa',
});

export const metadata = {
  title: 'ViraPlaza',
  description: 'Accessories store for bracelets and rings',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const rtl = isRtl(locale);

  return (
    <html lang={locale} dir={rtl ? 'rtl' : 'ltr'}>
      <body
        className={`${display.variable} ${sans.variable} ${fa.variable} ${
          rtl ? 'font-fa' : 'font-sans'
        } antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <CartProvider>
            <div className="relative min-h-screen overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-[70vh] bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.35)_45%,transparent_70%)] bg-[length:200%_100%] animate-shimmer"
              />
              <SiteHeader />
              <main className="relative mx-auto max-w-6xl px-4 py-8">{children}</main>
            </div>
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
