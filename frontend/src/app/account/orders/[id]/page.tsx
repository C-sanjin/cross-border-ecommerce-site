'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';
import { ordersAPI } from '@/lib/api';
import { Order } from '@/types';

const statusSteps = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);
  const orderId = parseInt(params.id as string);
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated && orderId) {
      fetchOrder();
    }
  }, [isAuthenticated, orderId]);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getById(orderId);
      setOrder(response.data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm(t(locale, 'account.areYouSureCancel'))) return;
    try {
      await ordersAPI.cancel(orderId);
      await fetchOrder();
    } catch {
      alert('Failed to cancel order');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">{t(locale, 'common.loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">{t(locale, 'common.noResults')}</h1>
          <button onClick={() => router.push('/account/orders')} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {t(locale, 'account.backToOrders')}
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = statusSteps.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <button onClick={() => router.push('/account/orders')} className="text-sm text-gray-500 hover:text-gray-700 mb-2">
              {t(locale, 'account.backToOrders')}
            </button>
            <h1 className="text-2xl font-bold">{t(locale, 'account.orderDetails')}</h1>
            <p className="text-gray-500">{order.order_no}</p>
          </div>
          {order.status === 'pending' && (
            <button onClick={handleCancel} className="px-4 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50">
              {t(locale, 'account.cancelOrder')}
            </button>
          )}
        </div>

        {/* Status Timeline */}
        {order.status !== 'cancelled' && order.status !== 'refunded' && (
          <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4">Order Status</h2>
            <div className="flex items-center justify-between">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index <= currentStatusIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index < currentStatusIndex ? '✓' : index + 1}
                  </div>
                  <p className="text-xs mt-2 text-center capitalize">{t(locale, 'status.' + step)}</p>
                  {index < statusSteps.length - 1 && (
                    <div className={`h-0.5 w-full mt-4 ${index < currentStatusIndex ? 'bg-blue-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold mb-4">{t(locale, 'account.orderItems')}</h2>
          <div className="space-y-4">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0 last:pb-0">
                <div className="flex-1">
                  <p className="font-medium">{item.product_title}</p>
                  <p className="text-sm text-gray-500">SKU: {item.sku_code}</p>
                </div>
                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                <p className="font-semibold">${item.subtotal.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{t(locale, 'checkout.shippingAddress')}</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-medium text-gray-900">{order.shipping_address?.name}</p>
              <p>{order.shipping_address?.phone}</p>
              <p>{order.shipping_address?.street}</p>
              <p>
                {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zip_code}
              </p>
              <p>{order.shipping_address?.country}</p>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">{t(locale, 'common.orderSummary')}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t(locale, 'cart.subtotal')}</span>
                <span>${(order.total_amount - order.shipping_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t(locale, 'cart.shipping')}</span>
                <span>${order.shipping_fee.toFixed(2)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>{t(locale, 'checkout.discount')}</span>
                  <span>-${order.discount_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t(locale, 'checkout.paymentMethod')}</span>
                <span className="capitalize">{order.payment_method}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t(locale, 'account.orderDate')}</span>
                <span>{new Date(order.created_at * 1000).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {order.note && (
          <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
            <h2 className="text-lg font-semibold mb-2">{t(locale, 'account.orderNote')}</h2>
            <p className="text-gray-600">{order.note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
