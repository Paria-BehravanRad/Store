import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ReactNode } from 'react';
import { getTranslations } from 'next-intl/server';
import { getServerSession, isAdminRole } from '@/lib/session';
import { AdminClientGuard } from '@/components/admin-client-guard';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('admin');
  const session = await getServerSession();

  if (session && !isAdminRole(session.role)) {
    redirect('/');
  }

  return (
    <AdminClientGuard>
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside className="glass-strong h-fit space-y-1 rounded-[1.75rem] p-4">
          <p className="mb-4 px-3 font-display text-2xl tracking-tight">{t('title')}</p>
          <AdminLink href="/admin">{t('title')}</AdminLink>
          <AdminLink href="/admin/users">{t('users')}</AdminLink>
          <AdminLink href="/admin/products">{t('products')}</AdminLink>
          <AdminLink href="/admin/orders">{t('orders')}</AdminLink>
          <AdminLink href="/admin/settings">{t('settings')}</AdminLink>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </AdminClientGuard>
  );
}

function AdminLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-xl px-3 py-2.5 text-sm text-ink-800 transition hover:bg-white/70"
    >
      {children}
    </Link>
  );
}
