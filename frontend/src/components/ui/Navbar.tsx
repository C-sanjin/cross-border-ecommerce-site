'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useI18nStore } from '@/store/i18nStore';
import { useCurrencyStore } from '@/store/currencyStore';
import { t } from '@/lib/i18n';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { getItemCount, fetchCart } = useCartStore();
  const locale = useI18nStore((s) => s.locale);
  const setLocale = useI18nStore((s) => s.setLocale);
  const { currency, setCurrency, rates } = useCurrencyStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved && ['en', 'zh', 'ja'].includes(saved)) {
      useI18nStore.setState({ locale: saved as any });
    }
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency) {
      useCurrencyStore.setState({ currency: savedCurrency });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  const itemCount = getItemCount();

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?keyword=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, router]);

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-[#e63946] text-white text-center py-2.5 text-sm font-medium tracking-wide">
        {t(locale, 'nav.announcement')}
      </div>

      {/* Main Navbar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left - Menu Links */}
            {/* Hamburger - Mobile */}
            <button
              className="md:hidden p-2 hover:bg-gray-50 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-black transition-colors uppercase tracking-wide">
                {t(locale, 'common.shop')}
              </Link>
              <Link href="/categories" className="text-sm font-medium text-gray-700 hover:text-black transition-colors uppercase tracking-wide">
                {t(locale, 'common.categories')}
              </Link>
              <Link href="/products" className="text-sm font-medium text-gray-700 hover:text-black transition-colors uppercase tracking-wide">
                {t(locale, 'common.newArrivals')}
              </Link>
            </div>

            {/* Center - Logo */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <span className="text-2xl font-bold tracking-tight text-black">
                minimog
              </span>
            </Link>

            {/* Right - Icons */}
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <select
                value={locale}
                onChange={(e) => setLocale(e.target.value as any)}
                className="text-xs border border-gray-200 bg-white px-1.5 py-1.5 focus:outline-none focus:border-black cursor-pointer"
              >
                <option value="en">EN</option>
                <option value="zh">中文</option>
                <option value="ja">日本語</option>
              </select>

              {/* Currency Switcher */}
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="text-xs border border-gray-200 bg-white px-1.5 py-1.5 focus:outline-none focus:border-black cursor-pointer"
              >
                {rates.map((r) => (
                  <option key={r.code} value={r.code}>{r.code}</option>
                ))}
              </select>

              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors"
              >
                <SearchIcon className="w-5 h-5 text-gray-700" />
              </button>

              {/* User */}
              {isAuthenticated ? (
                <div className="relative group">
                  <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                    <UserIcon className="w-5 h-5 text-gray-700" />
                  </button>
                  <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                    <div className="w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-50">
                        {user?.name || 'Account'}
                      </div>
                      <Link href="/account/profile" className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                        {t(locale, 'common.profile')}
                      </Link>
                      <Link href="/account/orders" className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                        {t(locale, 'common.orders')}
                      </Link>
                      <Link href="/account/addresses" className="block px-4 py-2 text-sm hover:bg-gray-50 text-gray-700">
                        {t(locale, 'common.addresses')}
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600"
                      >
                        {t(locale, 'common.logout')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/account/login" className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                  <UserIcon className="w-5 h-5 text-gray-700" />
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative p-2 hover:bg-gray-50 rounded-full transition-colors">
                <ShoppingBagIcon className="w-5 h-5 text-gray-700" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="border-t border-gray-100 py-4 px-4">
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t(locale, 'common.search')}
                  className="w-full px-4 py-3 border border-gray-200 focus:outline-none focus:border-black transition-colors"
                  autoFocus
                />
              </form>
            </div>
          </div>
        )}

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 shadow-lg bg-white">
            <Link href="/products" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide" onClick={() => setMobileMenuOpen(false)}>
              {t(locale, 'common.shop')}
            </Link>
            <Link href="/categories" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide" onClick={() => setMobileMenuOpen(false)}>
              {t(locale, 'common.categories')}
            </Link>
            <Link href="/products" className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 uppercase tracking-wide" onClick={() => setMobileMenuOpen(false)}>
              {t(locale, 'common.newArrivals')}
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}

function SearchIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function UserIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  );
}

function ShoppingBagIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}
