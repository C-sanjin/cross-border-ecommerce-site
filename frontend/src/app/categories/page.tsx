'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';
import ProductCard from '@/components/ui/ProductCard';
import Pagination from '@/components/ui/Pagination';
import { productsAPI } from '@/lib/api';
import { Product, ProductCategory } from '@/types';

export default function CategoriesPage() {
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Map<number, Product[]>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      const cats = response.data.categories || [];
      setCategories(cats);

      for (const cat of cats) {
        const prodResp = await productsAPI.list({ category_id: cat.id, page_size: 4 });
        const products = prodResp.data.products || [];
        setProductsByCategory((prev) => {
          const next = new Map(prev);
          next.set(cat.id, products);
          return next;
        });
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">{t(locale, 'common.categories')}</h1>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse">
                <div className="aspect-[3/2] bg-gray-200" />
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-12">
            {categories.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">{cat.name}</h2>
                  <button
                    onClick={() => router.push(`/products?category_id=${cat.id}`)}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {t(locale, 'common.viewAll')} &rarr;
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {(productsByCategory.get(cat.id) || []).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                {(!productsByCategory.get(cat.id) || productsByCategory.get(cat.id)!.length === 0) && (
                  <p className="text-center py-8 text-gray-400">{t(locale, 'product.noProductsFound')}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
