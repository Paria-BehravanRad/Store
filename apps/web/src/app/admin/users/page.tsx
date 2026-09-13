'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';
import { GlassSelect } from '@/components/glass-select';

type UserRow = {
  id: string;
  phone: string;
  role: string;
  preferredLocale: string | null;
  isActive: boolean;
};

const ROLE_OPTIONS = [
  { value: 'CUSTOMER', label: 'CUSTOMER' },
  { value: 'ADMIN', label: 'ADMIN' },
  { value: 'SUPER_ADMIN', label: 'SUPER_ADMIN' },
];

export default function AdminUsersPage() {
  const t = useTranslations('admin');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ items: UserRow[] }>('/users')
      .then((data) => setUsers(data.items))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed'));
  }, []);

  async function toggleActive(user: UserRow) {
    const updated = await apiFetch<UserRow>(`/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u)));
  }

  async function setRole(user: UserRow, role: string) {
    const updated = await apiFetch<UserRow>(`/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...updated } : u)));
  }

  return (
    <div className="space-y-4">
      <h1 className="section-title text-3xl">{t('users')}</h1>
      {error ? (
        <p className="glass rounded-2xl p-4 text-sm text-red-700">
          {error}. Sign in as admin first via /login.
        </p>
      ) : null}

      <div className="space-y-3 md:hidden">
        {users.map((user) => (
          <div key={user.id} className="glass space-y-3 rounded-2xl p-4">
            <p className="font-medium" dir="ltr">
              {user.phone}
            </p>
            <GlassSelect
              fullWidth
              value={user.role}
              options={ROLE_OPTIONS}
              onChange={(role) => void setRole(user, role)}
            />
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-ink-700">{user.preferredLocale ?? '—'}</span>
              <button type="button" className="btn-ghost !px-3 !py-2" onClick={() => toggleActive(user)}>
                {user.isActive ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass hidden overflow-x-auto rounded-3xl md:block">
        <table className="min-w-full text-start text-sm">
          <thead className="border-b border-ink-900/10 text-ink-700">
            <tr>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Locale</th>
              <th className="px-4 py-3 font-medium">Active</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-ink-900/5">
                <td className="px-4 py-3" dir="ltr">
                  {user.phone}
                </td>
                <td className="px-4 py-3">
                  <GlassSelect
                    value={user.role}
                    options={ROLE_OPTIONS}
                    onChange={(role) => void setRole(user, role)}
                  />
                </td>
                <td className="px-4 py-3">{user.preferredLocale ?? '—'}</td>
                <td className="px-4 py-3">{user.isActive ? 'yes' : 'no'}</td>
                <td className="px-4 py-3">
                  <button type="button" className="btn-ghost" onClick={() => toggleActive(user)}>
                    {user.isActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
