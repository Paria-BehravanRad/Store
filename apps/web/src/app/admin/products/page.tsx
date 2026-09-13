'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { apiFetch, formatRials } from '@/lib/api';
import { GlassSelect } from '@/components/glass-select';

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
      <h1 className="section-title text-3xl">{t('products')}</h1>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <form
        onSubmit={onCreate}
        className="glass grid gap-3 rounded-[1.5rem] p-4 sm:rounded-3xl sm:p-5 md:grid-cols-2"
      >
        <GlassSelect
          fullWidth
          ariaLabel="Category"
          value={form.categoryId || categories[0]?.id || ''}
          options={categories.map((c) => ({ value: c.id, label: c.nameEn }))}
          onChange={(categoryId) => setForm({ ...form, categoryId })}
        />
        <input
          className="field"
          placeholder="slug"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />
        <input
          className="field"
          placeholder="nameEn"
          value={form.nameEn}
          onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          required
        />
        <input
          className="field"
          placeholder="nameFa"
          value={form.nameFa}
          onChange={(e) => setForm({ ...form, nameFa: e.target.value })}
          required
        />
        <input
          className="field"
          placeholder="nameDe"
          value={form.nameDe}
          onChange={(e) => setForm({ ...form, nameDe: e.target.value })}
          required
        />
        <input
          type="number"
          className="field"
          value={form.priceRials}
          onChange={(e) => setForm({ ...form, priceRials: Number(e.target.value) })}
          required
        />
        <input
          type="number"
          className="field"
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
          <li
            key={p.id}
            className="glass flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="font-medium">{p.nameEn}</p>
              <p className="truncate text-xs text-ink-700">
                {p.slug} · {formatRials(p.priceRials, 'en')} IRR · stock {p.stock}
              </p>
            </div>
            <button type="button" className="btn-ghost shrink-0" onClick={() => remove(p.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
