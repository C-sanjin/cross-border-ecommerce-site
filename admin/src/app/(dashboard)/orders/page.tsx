'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { adminAPI } from '@/lib/api';
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
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (statusFilter) params.status = statusFilter;
      const response = await adminAPI.listOrders(params);
      setOrders(response.data.orders || []);
      setTotalPages(response.data.total_pages || 1);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await adminAPI.updateOrderStatus(orderId, newStatus);
      setShowUpdateModal(false);
      fetchOrders();
    } catch {
      alert('Failed to update status');
    }
  };

  const handleRefund = async (orderId: number) => {
    if (!confirm('Are you sure you want to refund this order?')) return;
    try {
      await adminAPI.refundOrder(orderId);
      fetchOrders();
    } catch {
      alert('Failed to refund order');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Orders</h1>

        <div className="flex gap-2 mb-4 flex-wrap">
          {['', 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded text-sm capitalize ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order No</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Payment</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{o.order_no}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColors[o.status] || 'bg-gray-100 text-gray-800'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{o.items?.length || 0}</td>
                    <td className="px-4 py-3 text-sm font-semibold">${o.total_amount.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm capitalize">{o.payment_method}</td>
                    <td className="px-4 py-3 text-sm">{new Date(o.created_at * 1000).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => { setSelectedOrder(o); setShowUpdateModal(true); }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Update Status
                      </button>
                      {(o.status === 'paid' || o.status === 'delivered') && (
                        <button
                          onClick={() => handleRefund(o.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 border rounded disabled:opacity-50">Previous</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-4 py-2 border rounded ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50">Next</button>
          </div>
        )}

        {/* Update Status Modal */}
        {showUpdateModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96">
              <h2 className="text-lg font-bold mb-4">Update Order Status</h2>
              <p className="text-sm text-gray-500 mb-4">Order: {selectedOrder.order_no}</p>
              <p className="text-sm text-gray-500 mb-4">Current: {selectedOrder.status}</p>
              <div className="space-y-2">
                {['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].map((s) => (
                  <button
                    key={s}
                    onClick={() => handleUpdateStatus(selectedOrder.id, s)}
                    className={`w-full px-4 py-2 text-left rounded capitalize ${
                      selectedOrder.status === s ? 'bg-gray-100 cursor-not-allowed' : 'hover:bg-gray-100'
                    }`}
                    disabled={selectedOrder.status === s}
                  >
                    {s} {selectedOrder.status === s ? '(current)' : ''}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowUpdateModal(false)} className="mt-4 w-full px-4 py-2 border rounded hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
