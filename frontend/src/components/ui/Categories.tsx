'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';
import { productsAPI } from '@/lib/api';
import { ProductCategory } from '@/types';

export default function Categories() {
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || categories.length === 0) return null;

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-900">{t(locale, 'common.categories')}</h2>
          <p className="mt-3 text-lg text-gray-600">Browse our collections by category</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/products?category_id=${cat.id}`)}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 hover:border-blue-300 transition-all hover:shadow-lg aspect-square"
            >
              {cat.image_url ? (
                <img
                  src={cat.image_url}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : null}
              <div className={`absolute inset-0 flex flex-col items-center justify-center p-8 text-center ${cat.image_url ? 'bg-black/20 group-hover:bg-black/30 transition-colors' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
                {!cat.image_url && <div className="text-4xl mb-3">{cat.name.charAt(0)}</div>}
                <h3 className={`font-semibold transition-colors ${cat.image_url ? 'text-white drop-shadow-sm' : 'text-gray-900 group-hover:text-blue-600'}`}>
                  {cat.name}
                </h3>
                <p className={`text-sm mt-1 ${cat.image_url ? 'text-white/80' : 'text-gray-500'}`}>{t(locale, 'common.shop')}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
