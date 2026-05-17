'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';
import { productsAPI } from '@/lib/api';
import { Product } from '@/types';

interface RelatedProductsProps {
  categoryId: number;
  currentProductId: number;
}

export default function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const locale = useI18nStore((s) => s.locale);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelated();
  }, [categoryId]);

  const fetchRelated = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.list({ category_id: categoryId, page_size: 4 });
      const filtered = (response.data.products || []).filter(
        (p: Product) => p.id !== currentProductId
      );
      setProducts(filtered);
    } catch (error) {
      console.error('Failed to fetch related products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t(locale, 'common.youMayAlsoLike')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
