'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';
import { ordersAPI } from '@/lib/api';
import { Order } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

export default function OrdersPage() {
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login?redirect=/account/orders');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated, page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 10 };
      if (statusFilter) params.status = statusFilter;
      const response = await ordersAPI.list(params);
      setOrders(response.data.orders || []);
      setTotalPages(response.data.total_pages || 1);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center text-gray-500">{t(locale, 'common.loading')}</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{t(locale, 'account.myOrders')}</h1>

        {/* Status Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => { setStatusFilter(''); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
              !statusFilter ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm capitalize whitespace-nowrap ${
                statusFilter === status ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t(locale, 'status.' + status)}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/6"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg">
            <p className="text-gray-500 mb-4">{t(locale, 'account.noOrders')}</p>
            <button
              onClick={() => router.push('/products')}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t(locale, 'account.startShopping')}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-500">{t(locale, 'account.orderNo')}</p>
                    <p className="font-medium">{order.order_no}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {t(locale, 'status.' + order.status)}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <p className="text-gray-400">{t(locale, 'account.date')}</p>
                    <p>{new Date(order.created_at * 1000).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{t(locale, 'common.orders')}</p>
                    <p>{order.items?.length || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">{t(locale, 'account.payment')}</p>
                    <p className="capitalize">{order.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Total</p>
                    <p className="font-semibold text-gray-900">${order.total_amount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/account/orders/${order.id}`)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                  >
                    {t(locale, 'account.viewDetails')}
                  </button>
                  {order.status === 'pending' && (
                    <button
                      onClick={() => { /* handle cancel */ }}
                      className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                    >
                      {t(locale, 'account.cancelOrder')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t(locale, 'common.previous')}
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`px-4 py-2 border rounded ${
                  p === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              {t(locale, 'common.next')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
