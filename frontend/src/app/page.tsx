'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import { productsAPI } from '@/lib/api';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';
import { Product } from '@/types';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const locale = useI18nStore((s) => s.locale);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.list({ page: 1, page_size: 10 });
      setProducts(response.data.products || []);
    } catch {
      console.error('Failed to fetch products');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[500px]">
          <div className="space-y-6">
            <span className="inline-block text-sm font-medium text-gray-500 uppercase tracking-widest">
              {t(locale, 'home.newCollection')}
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-[1.1] tracking-tight">
              {t(locale, 'home.heroTitle').split(' ').slice(0, 2).join(' ')}<br />{t(locale, 'home.heroTitle').split(' ').slice(2).join(' ')}
            </h1>
            <p className="text-lg text-gray-600 max-w-md leading-relaxed">
              {t(locale, 'home.heroDesc')}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <Link href="/products" className="bg-black text-white font-medium px-8 py-4 text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors">
                {t(locale, 'home.shopNow')}
              </Link>
              <Link href="/categories" className="border border-black text-black font-medium px-8 py-4 text-sm uppercase tracking-wide hover:bg-black hover:text-white transition-colors">
                {t(locale, 'home.explore')}
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] lg:h-[550px] bg-gray-100 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=800&h=1000&fit=crop" alt="Fashion Collection" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <div className="bg-black text-white py-4 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="text-sm font-medium uppercase tracking-widest mx-8">
              {t(locale, 'nav.announcement')} • {t(locale, 'common.newArrivals')} • {t(locale, 'home.heroDesc').split('.')[0]} •{' '}
            </span>
          ))}
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight">{t(locale, 'home.popularThisWeek')}</h2>
          <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-black transition-colors uppercase tracking-wide border-b border-gray-300 hover:border-black pb-0.5">
            {t(locale, 'common.viewAll')}
          </Link>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200" />
                <div className="pt-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative h-[400px] md:h-[500px] overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=1000&fit=crop" alt="Men Collection" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-8 left-8 right-8">
              <span className="text-white/80 text-sm uppercase tracking-widest mb-2 block">{t(locale, 'common.newArrivals')}</span>
              <h3 className="text-3xl font-bold text-white mb-4">{t(locale, 'home.menCollection')}</h3>
              <Link href="/products" className="inline-block bg-white text-black font-medium px-6 py-3 text-sm uppercase tracking-wide hover:bg-black hover:text-white transition-colors">
                {t(locale, 'home.shopNow')}
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px] overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=1000&fit=crop" alt="Women Collection" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-8 left-8 right-8">
              <span className="text-white/80 text-sm uppercase tracking-widest mb-2 block">{t(locale, 'home.trendingNow')}</span>
              <h3 className="text-3xl font-bold text-white mb-4">{t(locale, 'home.womenCollection')}</h3>
              <Link href="/products" className="inline-block bg-white text-black font-medium px-6 py-3 text-sm uppercase tracking-wide hover:bg-black hover:text-white transition-colors">
                {t(locale, 'home.shopNow')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-black tracking-tight mb-2">{t(locale, 'home.onInstagram')}</h2>
          <p className="text-gray-500 text-sm">{t(locale, 'home.followUs')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=400&h=400&fit=crop','https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop'].map((src, i) => (
            <a key={i} href="#" className="aspect-square overflow-hidden group">
              <img src={src} alt={`Instagram ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
