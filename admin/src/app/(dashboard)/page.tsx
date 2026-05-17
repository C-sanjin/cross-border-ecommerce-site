'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { adminAPI } from '@/lib/api';
import { DashboardStats } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.dashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total Revenue', value: stats ? `$${stats.total_revenue.toFixed(2)}` : '-', color: 'bg-green-500' },
    { label: 'Total Orders', value: stats?.total_orders || 0, color: 'bg-blue-500' },
    { label: 'Total Users', value: stats?.total_users || 0, color: 'bg-purple-500' },
    { label: 'Total Products', value: stats?.total_products || 0, color: 'bg-orange-500' },
    { label: 'Pending Orders', value: stats?.pending_orders || 0, color: 'bg-yellow-500' },
    { label: 'Low Stock Items', value: stats?.low_stock_products || 0, color: 'bg-red-500' },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((card) => (
              <div key={card.label} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${card.color}`}></div>
                  <span className="text-sm text-gray-500">{card.label}</span>
                </div>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
