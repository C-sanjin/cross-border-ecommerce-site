'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';
import { ordersAPI } from '@/lib/api';
import { Order } from '@/types';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order_id') || '';
  const { user } = useAuthStore();
  const locale = useI18nStore((s) => s.locale);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await ordersAPI.getById(parseInt(orderId));
      setOrder(response.data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-8">
            Thank you{user?.name ? `, ${user.name}` : ''}! Your order has been confirmed.
          </p>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto" />
            </div>
          ) : order ? (
            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">{t(locale, 'account.orderNo')}</span>
                  <span className="font-medium">{order.order_no}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className="font-medium capitalize text-yellow-600">{order.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total</span>
                  <span className="font-bold text-lg">${order.total_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t(locale, 'checkout.paymentMethod')}</span>
                  <span className="font-medium capitalize">{order.payment_method}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 mb-8">Could not load order details</p>
          )}

          <p className="text-sm text-gray-500 mb-6">
            We&apos;ll send you an email with shipping details once your order is processed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push(`/account/orders/${orderId}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium"
            >
              {t(locale, 'account.viewDetails')}
            </button>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
            >
              {t(locale, 'cart.continueShopping')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
