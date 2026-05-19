'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { adminAPI } from '@/lib/api';
import { AdminUser } from '@/types';

const roleLabels: Record<string, string> = {
  super_admin: '超级管理员',
  product_admin: '商品管理员',
  customer_service: '客服',
  finance: '财务',
  operator: '运营',
};

const statusLabels: Record<string, string> = {
  active: '正常',
  inactive: '已停用',
};

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    role: 'operator',
  });

  useEffect(() => {
    fetchAdmins();
  }, [page]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: 20 };
      const response = await adminAPI.listAdminUsers(params);
      setAdmins(response.data.users || []);
      setTotalPages(response.data.total_pages || 1);
    } catch {
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminAPI.createAdminUser(formData);
      setShowCreateModal(false);
      setFormData({ username: '', email: '', password: '', name: '', role: 'operator' });
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || '创建管理员失败');
    }
  };

  const handleToggleStatus = async (admin: AdminUser) => {
    const newStatus = admin.status === 'active' ? 'inactive' : 'active';
    try {
      await adminAPI.updateAdminUserStatus(admin.id, newStatus);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || '更新状态失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此管理员吗？此操作不可撤销。')) return;
    try {
      await adminAPI.deleteAdminUser(id);
      fetchAdmins();
    } catch (err: any) {
      alert(err.response?.data?.error || '删除管理员失败');
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">管理员用户管理</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            添加管理员
          </button>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
          <strong>说明：</strong>此处管理运营后台管理员账户。下方的「用户管理」页面管理的是商城前台用户（买家）。
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
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
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">用户名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">邮箱</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">姓名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">角色</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">最近登录</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{admin.id}</td>
                    <td className="px-4 py-3 text-sm font-medium">{admin.username}</td>
                    <td className="px-4 py-3 text-sm">{admin.email}</td>
                    <td className="px-4 py-3 text-sm">{admin.name || '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                        {roleLabels[admin.role] || admin.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {statusLabels[admin.status] || admin.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {admin.last_login ? new Date(admin.last_login * 1000).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button
                        onClick={() => handleToggleStatus(admin)}
                        className={admin.status === 'active' ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}
                      >
                        {admin.status === 'active' ? '停用' : '启用'}
                      </button>
                      <button
                        onClick={() => handleDelete(admin.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
                {admins.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">暂无管理员用户</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 border rounded disabled:opacity-50">上一页</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                className={`px-4 py-2 border rounded ${p === page ? 'bg-blue-600 text-white' : 'hover:bg-gray-50'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-4 py-2 border rounded disabled:opacity-50">下一页</button>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">添加管理员</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">用户名 *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">邮箱 *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">密码 *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">角色 *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="operator">运营</option>
                  <option value="product_admin">商品管理员</option>
                  <option value="customer_service">客服</option>
                  <option value="finance">财务</option>
                  <option value="super_admin">超级管理员</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  创建
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}