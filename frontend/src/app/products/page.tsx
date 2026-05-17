'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ui/ProductCard';
import Pagination from '@/components/ui/Pagination';
import { productsAPI } from '@/lib/api';
import { Product, ProductCategory } from '@/types';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';

function ProductsContent() {
  const searchParams = useSearchParams();
  const locale = useI18nStore((s) => s.locale);
  const initialKeyword = searchParams?.get('keyword') || '';
  const initialCategory = searchParams?.get('category_id') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState(initialKeyword);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, selectedCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 15 };
      if (selectedCategory) params.category_id = parseInt(selectedCategory);
      if (keyword) params.keyword = keyword;

      const response = await productsAPI.list(params);
      setProducts(response.data.products || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl md:text-5xl font-bold text-black tracking-tight mb-4">{t(locale, 'product.allProducts')}</h1>
          <p className="text-gray-500 max-w-xl">{t(locale, 'home.heroDesc')}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 pb-8 border-b border-gray-100">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder={t(locale, 'product.searchProducts')}
              className="flex-1 px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors text-sm"
            />
            <button
              type="submit"
              className="bg-black hover:bg-gray-800 text-white font-medium px-6 py-3 text-sm uppercase tracking-wide transition-colors"
            >
              {t(locale, 'common.search')}
            </button>
          </form>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors bg-white text-sm"
          >
            <option value="">{t(locale, 'common.allCategories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200" />
                <div className="pt-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <Pagination page={page} total_pages={totalPages} />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t(locale, 'product.noProductsFound')}</h3>
            <p className="text-gray-600">{t(locale, 'common.noResults')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
