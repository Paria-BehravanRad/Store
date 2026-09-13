'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useTranslations } from 'next-intl';

export function AdminClientGuard({ children }: { children: ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const t = useTranslations('common');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/admin');
      return;
    }
    if (!isAdmin) {
      router.replace('/');
    }
  }, [loading, user, isAdmin, router]);

  if (loading) {
    return (
      <div className="glass rounded-[1.75rem] px-6 py-10 text-center text-sm text-ink-700">
        {t('loading')}
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return <>{children}</>;
}
