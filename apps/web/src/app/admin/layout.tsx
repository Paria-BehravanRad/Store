import Link from 'next/link';
import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('admin');

  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <aside className="glass h-fit space-y-2 rounded-3xl p-4">
        <p className="mb-3 font-display text-2xl">{t('title')}</p>
        <AdminLink href="/admin">{t('title')}</AdminLink>
        <AdminLink href="/admin/users">{t('users')}</AdminLink>
        <AdminLink href="/admin/products">{t('products')}</AdminLink>
        <AdminLink href="/admin/orders">{t('orders')}</AdminLink>
        <AdminLink href="/admin/settings">{t('settings')}</AdminLink>
      </aside>
      <div>{children}</div>
    </div>
  );
}

function AdminLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-3 py-2 text-sm text-ink-800 transition hover:bg-white/60"
    >
      {children}
    </Link>
  );
}
