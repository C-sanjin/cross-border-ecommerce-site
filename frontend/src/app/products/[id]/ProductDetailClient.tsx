'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProductReviews from '@/components/ui/ProductReviews';
import RelatedProducts from '@/components/ui/RelatedProducts';
import { productsAPI } from '@/lib/api';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useI18nStore } from '@/store/i18nStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { t } from '@/lib/i18n';
import { Product } from '@/types';

export default function ProductDetailClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const formatPrice = useCurrencyStore((s) => s.formatPrice);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await productsAPI.getById(Number(params.id));
      setProduct(response.data);
    } catch {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    if (!isAuthenticated) {
      router.push('/account/login');
      return;
    }
    try {
      await addItem(product.id, quantity);
    } catch {
      // error handled by API interceptor
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-24 bg-gray-200 rounded" />
              <div className="h-12 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Product not found</h2>
          <button
            onClick={() => router.push('/products')}
            className="mt-4 text-black font-medium hover:text-gray-600 border-b border-black pb-0.5"
          >
            {t(locale, 'common.back')}
          </button>
        </div>
      </div>
    );
  }

  const images = product.images ? JSON.parse(product.images) : [];
  const discount = product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={() => router.push('/')} className="hover:text-black transition-colors">{t(locale, 'common.home')}</button>
          <span className="text-gray-300">/</span>
          <button onClick={() => router.push('/products')} className="hover:text-black transition-colors">{t(locale, 'common.shop')}</button>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Images */}
          <div className="space-y-4">
            {images.length > 0 ? (
              <>
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                  <img
                    src={images[selectedImage]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                  {discount > 0 && (
                    <div className="absolute top-4 left-4 bg-[#e63946] text-white text-sm font-bold px-3 py-1.5">
                      -{discount}%
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {images.slice(0, 4).map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`aspect-square bg-gray-100 overflow-hidden border-2 transition-colors ${
                          selectedImage === idx ? 'border-black' : 'border-transparent hover:border-gray-300'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[3/4] bg-gray-100 flex items-center justify-center text-8xl">
                📦
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-black mb-3 tracking-tight">{product.title}</h1>
              <p className="text-gray-500 text-lg">{product.short_desc}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-black">
                {formatPrice(product.price)}
              </span>
              {product.compare_price > product.price && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.compare_price)}
                </span>
              )}
            </div>

            {product.stock > 0 ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckIcon className="w-4 h-4" />
                <span className="text-sm font-medium">{t(locale, 'product.inStock')} ({product.stock} {t(locale, 'product.available')})</span>
              </div>
            ) : (
              <div className="text-[#e63946] font-medium">{t(locale, 'product.outOfStock')}</div>
            )}

            <div className="border-t border-gray-100 pt-6">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 font-medium text-sm uppercase tracking-wide">{t(locale, 'product.quantity')}</span>
                <div className="flex items-center border border-gray-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2.5 hover:bg-gray-50 transition-colors text-lg"
                  >
                    -
                  </button>
                  <span className="px-6 py-2.5 font-medium min-w-[3rem] text-center text-sm">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="px-4 py-2.5 hover:bg-gray-50 transition-colors text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium py-4 transition-colors text-sm uppercase tracking-wide"
              >
                {t(locale, 'common.addToCart')}
              </button>
            </div>

            {/* Description */}
            <div className="border-t border-gray-100 pt-6">
              <h3 className="text-sm font-semibold text-black mb-3 uppercase tracking-wide">{t(locale, 'product.description')}</h3>
              <p className="text-gray-500 leading-relaxed whitespace-pre-line text-sm">{product.description}</p>
            </div>

            {/* Shipping Info */}
            <div className="border-t border-gray-100 pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <TruckIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">{t(locale, 'product.freeShipping')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <ReturnIcon className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-500">{t(locale, 'product.dayReturns')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <ProductReviews productId={product.id} />

        {/* Related Products */}
        <RelatedProducts categoryId={product.category_id} currentProductId={product.id} />
      </div>
    </div>
  );
}

function CheckIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function TruckIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  );
}

function ReturnIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
    </svg>
  );
}