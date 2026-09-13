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

  const links = [
    { href: '/admin', label: t('title') },
    { href: '/admin/users', label: t('users') },
    { href: '/admin/products', label: t('products') },
    { href: '/admin/orders', label: t('orders') },
    { href: '/admin/settings', label: t('settings') },
  ];

  return (
    <AdminClientGuard>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-8">
        <aside className="glass-strong rounded-[1.5rem] p-3 sm:rounded-[1.75rem] sm:p-4">
          <p className="mb-3 px-2 font-display text-xl tracking-tight sm:mb-4 sm:px-3 sm:text-2xl">
            {t('title')}
          </p>
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="shrink-0 rounded-xl px-3 py-2 text-sm text-ink-800 transition hover:bg-white/70 lg:py-2.5"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </AdminClientGuard>
  );
}
