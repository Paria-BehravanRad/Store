import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import LoginClient from './login-client';

export default async function LoginRoute() {
  const t = await getTranslations('common');

  return (
    <Suspense
      fallback={
        <div className="glass rounded-[1.75rem] p-8 text-center text-sm text-ink-700">
          {t('loading')}
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}
