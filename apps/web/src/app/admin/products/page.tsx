'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch, formatRials } from '@/lib/api';

type Product = {
  id: string;
  slug: string;
  nameEn: string;
  priceRials: number;
  stock: number;
  isPublished: boolean;
  categoryId: string;
};

type Category = { id: string; slug: string; nameEn: string };

export default function AdminProductsPage() {
  const t = useTranslations('admin');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    categoryId: '',
    nameEn: '',
    nameFa: '',
    nameDe: '',
    slug: '',
    priceRials: 1000000,
    stock: 10,
  });

  async function load() {
    try {
      const [p, c] = await Promise.all([
        apiFetch<{ items: Product[] }>('/admin/products'),
        apiFetch<Category[]>('/admin/categories'),
      ]);
      setProducts(p.items);
      setCategories(c);
      if (!form.categoryId && c[0]) {
        setForm((f) => ({ ...f, categoryId: c[0].id }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    await apiFetch('/admin/products', {
      method: 'POST',
      body: JSON.stringify({ ...form, isPublished: true, imageUrls: [] }),
    });
    setForm((f) => ({
      ...f,
      nameEn: '',
      nameFa: '',
      nameDe: '',
      slug: '',
    }));
    await load();
  }

  async function remove(id: string) {
    await apiFetch(`/admin/products/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">{t('products')}</h1>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <form onSubmit={onCreate} className="glass grid gap-3 rounded-3xl p-5 md:grid-cols-2">
        <select
          className="rounded-xl border border-ink-900/10 bg-white/70 px-3 py-2"
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          required
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nameEn}
            </option>
          ))}
        </select>
        <input
          className="rounded-xl border border-ink-900/10 bg-white/70 px-3 py-2"
          placeholder="slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />
        <input
          className="rounded-xl border border-ink-900/10 bg-white/70 px-3 py-2"
          placeholder="nameEn"
          value={form.nameEn}
          onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          required
        />
        <input
          className="rounded-xl border border-ink-900/10 bg-white/70 px-3 py-2"
          placeholder="nameFa"
          value={form.nameFa}
          onChange={(e) => setForm({ ...form, nameFa: e.target.value })}
          required
        />
        <input
          className="rounded-xl border border-ink-900/10 bg-white/70 px-3 py-2"
          placeholder="nameDe"
          value={form.nameDe}
          onChange={(e) => setForm({ ...form, nameDe: e.target.value })}
          required
        />
        <input
          type="number"
          className="rounded-xl border border-ink-900/10 bg-white/70 px-3 py-2"
          value={form.priceRials}
          onChange={(e) => setForm({ ...form, priceRials: Number(e.target.value) })}
          required
        />
        <input
          type="number"
          className="rounded-xl border border-ink-900/10 bg-white/70 px-3 py-2"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          required
        />
        <button className="btn-primary md:col-span-2" type="submit">
          Create product
        </button>
      </form>

      <ul className="space-y-2">
        {products.map((p) => (
          <li key={p.id} className="glass flex items-center justify-between rounded-2xl px-4 py-3">
            <div>
              <p className="font-medium">{p.nameEn}</p>
              <p className="text-xs text-ink-700">
                {p.slug} · {formatRials(p.priceRials, 'en')} IRR · stock {p.stock}
              </p>
            </div>
            <button type="button" className="btn-ghost" onClick={() => remove(p.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
