import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Cormorant_Garamond, Manrope, Vazirmatn } from 'next/font/google';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { CartProvider } from '@/lib/cart';
import { AuthProvider } from '@/lib/auth';
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
  weight: ['400', '500', '600', '700'],
  variable: '--font-fa',
  display: 'swap',
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
    <html lang={locale} dir={rtl ? 'rtl' : 'ltr'} className={`${display.variable} ${sans.variable} ${fa.variable}`}>
      <body className={`${rtl ? 'locale-fa font-fa' : 'font-sans'} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <CartProvider>
              <div className="site-shell relative flex min-h-screen flex-col">
                <div aria-hidden className="site-glow pointer-events-none absolute inset-0" />
                <SiteHeader />
                <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 pb-12 pt-6 sm:px-5 sm:pb-16 sm:pt-8 md:pt-10">
                  {children}
                </main>
                <SiteFooter />
              </div>
            </CartProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
