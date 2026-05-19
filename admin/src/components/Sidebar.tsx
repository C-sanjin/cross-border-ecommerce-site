'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: '仪表盘', icon: '📊' },
  { href: '/products', label: '商品管理', icon: '📦' },
  { href: '/orders', label: '订单管理', icon: '🛒' },
  { href: '/users', label: '商城用户', icon: '👥' },
  { href: '/admins', label: '管理员管理', icon: '🔑' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold">运营管理</h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => {
            localStorage.removeItem('admin_token');
            window.location.href = '/login';
          }}
          className="w-full px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors text-left"
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
