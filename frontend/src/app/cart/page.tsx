'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useI18nStore } from '@/store/i18nStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { useToastStore } from '@/store/toastStore';
import { couponsAPI } from '@/lib/api';
import { CouponValidation } from '@/types';
import { t } from '@/lib/i18n';

export default function CartPage() {
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);
  const { isAuthenticated } = useAuthStore();
  const { cart, items, loading, fetchCart, updateItem, removeItem, clearCart, getTotal } = useCartStore();
  const formatPrice = useCurrencyStore((s) => s.formatPrice);
  const currency = useCurrencyStore((s) => s.currency);
  const addToast = useToastStore((s) => s.addToast);
  const [updating, setUpdating] = useState<number | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState<CouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponValidation(null);
    try {
      const subtotal = getTotal();
      const res = await couponsAPI.validate(couponCode.trim(), subtotal);
      setCouponValidation(res.data);
      if (res.data.is_valid) {
        addToast(`Coupon applied! -${formatPrice(res.data.discount_amount)}`, 'success');
      } else {
        addToast(res.data.message || 'Invalid coupon', 'error');
      }
    } catch {
      setCouponValidation({ coupon: null as any, discount_amount: 0, is_valid: false, message: 'Failed to validate coupon' });
      addToast('Failed to validate coupon', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponValidation(null);
    addToast('Coupon removed', 'info');
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) return;
    setUpdating(itemId);
    await updateItem(itemId, quantity);
    setUpdating(null);
  };

  const handleRemove = async (itemId: number) => {
    await removeItem(itemId);
    addToast('Item removed from cart', 'info');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t(locale, 'cart.empty')}</h2>
          <Link href="/account/login" className="text-blue-600 font-medium hover:text-blue-700">
            {t(locale, 'auth.loginBtn')}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">{t(locale, 'cart.empty')}</h2>
          <p className="text-gray-600 mb-6">{t(locale, 'common.noResults')}</p>
          <Link
            href="/products"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-all hover:shadow-lg"
          >
            {t(locale, 'product.allProducts')}
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = getTotal();
  const shippingFee = 0;
  const discountAmount = couponValidation?.is_valid ? couponValidation.discount_amount : 0;
  const total = subtotal + shippingFee - discountAmount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">{t(locale, 'cart.title')}</h1>
          <span className="text-gray-600">{items.length} {t(locale, 'cart.items')}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              >
                <div className="flex items-center gap-4">
                  {/* Product Image */}
                  <Link href={`/products/${item.product_id}`} className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                    {item.product.images ? (
                      <img
                        src={JSON.parse(item.product.images)[0]}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        📦
                      </div>
                    )}
                  </Link>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.product_id}`} className="font-semibold text-gray-900 hover:text-blue-600 truncate block">
                      {item.product.title}
                    </Link>
                    <p className="text-gray-500 text-sm mt-1">
                      {formatPrice(item.product.price)} {t(locale, 'cart.priceEach')}
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      disabled={updating === item.id}
                      className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-2 font-medium min-w-[2.5rem] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      disabled={updating === item.id}
                      className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[5rem]">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={async () => { await clearCart(); addToast('Cart cleared', 'info'); }}
              className="text-gray-500 hover:text-red-600 font-medium transition-colors"
            >
              {t(locale, 'cart.clearCart')}
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t(locale, 'common.orderSummary')}</h3>

              {/* Coupon Code */}
              <div className="mb-6 border-b border-gray-100 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t(locale, 'checkout.couponCode')}</label>
                {couponValidation?.is_valid ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <span className="text-sm font-medium text-green-700">{couponCode}</span>
                      <span className="text-sm text-green-600 ml-2">-{formatPrice(discountAmount)}</span>
                    </div>
                    <button type="button" onClick={handleRemoveCoupon} className="text-sm text-red-500 hover:text-red-700">{t(locale, 'checkout.remove')}</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-4 py-2.5 border border-gray-200 focus:border-blue-600 focus:outline-none text-sm rounded-lg"
                      placeholder={t(locale, 'checkout.couponCode')} />
                    <button type="button" onClick={handleApplyCoupon} disabled={couponLoading}
                      className="bg-blue-600 text-white font-medium px-4 py-2.5 text-sm hover:bg-blue-700 disabled:bg-gray-400 rounded-lg transition-colors">
                      {couponLoading ? '...' : t(locale, 'checkout.apply')}
                    </button>
                  </div>
                )}
                {couponValidation && !couponValidation.is_valid && (
                  <p className="text-xs text-red-500 mt-1">{couponValidation.message}</p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>{t(locale, 'cart.subtotal')}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>{t(locale, 'cart.shipping')}</span>
                  <span className="text-green-600">{t(locale, 'cart.freeShipping')}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>{t(locale, 'checkout.discount')}</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold text-gray-900">
                    <span>{t(locale, 'cart.total')}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const params = new URLSearchParams();
                  if (couponCode && couponValidation?.is_valid) {
                    params.set('coupon', couponCode);
                    params.set('discount', String(discountAmount));
                  }
                  router.push(`/checkout?${params.toString()}`);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all hover:shadow-lg active:scale-[0.98]"
              >
                {t(locale, 'cart.checkout')}
              </button>

              <Link
                href="/products"
                className="block text-center text-blue-600 font-medium mt-4 hover:text-blue-700 transition-colors"
              >
                {t(locale, 'cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
