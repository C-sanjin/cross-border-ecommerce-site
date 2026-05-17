'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';

export default function LoginPage() {
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setError('Unable to connect to server. Please make sure the backend service is running.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-black tracking-tight mb-2">{t(locale, 'auth.loginTitle')}</h1>
          <p className="text-gray-500">{t(locale, 'auth.welcomeBack')}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t(locale, 'auth.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors text-sm"
              placeholder={t(locale, 'auth.email')}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t(locale, 'auth.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors text-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 disabled:bg-gray-300 text-white font-medium py-4 text-sm uppercase tracking-wide transition-colors"
          >
            {loading ? t(locale, 'checkout.processing') : t(locale, 'auth.loginBtn')}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-8 text-sm">
          {t(locale, 'auth.noAccount')}{' '}
          <Link href="/account/register" className="text-black font-medium hover:text-gray-600 border-b border-black pb-0.5">
            {t(locale, 'auth.registerBtn')}
          </Link>
        </p>
      </div>
    </div>
  );
}
