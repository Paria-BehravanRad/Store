'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch } from '@/lib/api';

type UserRow = {
  id: string;
  phone: string;
  role: string;
  preferredLocale: string | null;
  isActive: boolean;
};

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
      <h1 className="font-display text-3xl">{t('users')}</h1>
      {error ? (
        <p className="glass rounded-2xl p-4 text-sm text-red-700">
          {error}. Sign in as admin first via /login.
        </p>
      ) : null}
      <div className="glass overflow-x-auto rounded-3xl">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-ink-900/10 text-ink-700">
            <tr>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Locale</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-ink-900/5">
                <td className="px-4 py-3">{user.phone}</td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-ink-900/10 bg-white/70 px-2 py-1"
                    value={user.role}
                    onChange={(e) => setRole(user, e.target.value)}
                  >
                    <option value="CUSTOMER">CUSTOMER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
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
