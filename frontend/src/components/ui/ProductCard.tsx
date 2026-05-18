'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useI18nStore } from '@/store/i18nStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { t } from '@/lib/i18n';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const locale = useI18nStore((s) => s.locale);
  const { formatPrice } = useCurrencyStore();
  const router = useRouter();

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push('/account/login');
      return;
    }
    try {
      await addItem(product.id, 1);
    } catch {
      // error handled by API interceptor or silently ignored for stock issues
    }
  };

  const discount = product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Link href={`/products/${product.id}`} className="block group">
        <div className="relative overflow-hidden">
          <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
            {product.images ? (
              <img src={JSON.parse(product.images)[0]} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-4xl">📦</div>
            )}
            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-[#e63946] text-white text-xs font-bold px-2.5 py-1">
                -{discount}%
              </div>
            )}
            <button onClick={handleAddToCart} className="absolute bottom-0 left-0 right-0 bg-black text-white text-sm font-medium py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              {t(locale, 'common.addToCart')}
            </button>
          </div>
        </div>
        <div className="pt-3 pb-1">
          <h3 className="text-sm font-medium text-gray-900 mb-1.5 line-clamp-2 group-hover:text-gray-600 transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</span>
            {product.compare_price > product.price && (
              <span className="text-sm text-gray-400 line-through">{formatPrice(product.compare_price)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
