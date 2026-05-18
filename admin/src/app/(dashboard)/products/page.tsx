'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import ProductFormModal from '@/components/ProductFormModal';
import { adminAPI } from '@/lib/api';
import { Product } from '@/types';

const productStatusLabels: Record<string, string> = {
  active: '上架',
  draft: '草稿',
  inactive: '已归档',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page, statusFilter]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      if (statusFilter) params.status = statusFilter;
      const response = await adminAPI.listProducts(params);
      setProducts(response.data.products || []);
      setTotalPages(response.data.total_pages || 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此商品吗？')) return;
    try {
      await adminAPI.deleteProduct(id);
      fetchProducts();
    } catch {
      alert('删除商品失败');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">商品管理</h1>
          <button
            onClick={() => { setEditingProduct(null); setShowModal(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            添加商品
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {['', 'active', 'draft', 'inactive'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded text-sm capitalize ${
                statusFilter === s ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-50'
              }`}
            >
              {s ? (productStatusLabels[s] || s) : '全部'}
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">编号</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">标题</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">价格</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">库存</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="px-4 py-3 text-sm">{p.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{p.title}</td>
                    <td className="px-4 py-3 text-sm">¥{p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">{p.stock}</td>
                    <td className="px-4 py-3 text-sm capitalize">
                      <span className={`px-2 py-1 rounded text-xs ${
                        p.status === 'active' ? 'bg-green-100 text-green-800' :
                        p.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{productStatusLabels[p.status] || p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => { setEditingProduct(p); setShowModal(true); }}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
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
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-4 py-2 border rounded ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50">下一页</button>
          </div>
        )}
      </div>

      {showModal && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => { setShowModal(false); setEditingProduct(null); }}
          onSaved={() => fetchProducts()}
        />
      )}
    </div>
  );
}
