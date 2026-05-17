'use client';

import { useState, useEffect } from 'react';
import { addressesAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { UserAddress } from '@/types';
import { useRouter } from 'next/navigation';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';

export default function AddressesPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '', phone: '', country: '', state: '', city: '',
    district: '', street: '', zip_code: '', is_default: false,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/account/login');
      return;
    }
    fetchAddresses();
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const res = await addressesAPI.list();
      setAddresses(res.data.addresses || []);
    } catch {
      console.error('Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressesAPI.update(editingId, form);
      } else {
        await addressesAPI.create(form);
      }
      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchAddresses();
    } catch {
      alert('Failed to save address');
    }
  };

  const handleEdit = (addr: UserAddress) => {
    setForm({
      name: addr.name, phone: addr.phone, country: addr.country,
      state: addr.state, city: addr.city, district: addr.district,
      street: addr.street, zip_code: addr.zip_code, is_default: addr.is_default,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t(locale, 'account.deleteAddressConfirm'))) return;
    try {
      await addressesAPI.delete(id);
      fetchAddresses();
    } catch {
      alert('Failed to delete address');
    }
  };

  const resetForm = () => {
    setForm({ name: '', phone: '', country: '', state: '', city: '', district: '', street: '', zip_code: '', is_default: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-40 bg-gray-200 rounded" />
          <div className="h-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-black tracking-tight">{t(locale, 'account.myAddresses')}</h1>
          <button
            onClick={() => { resetForm(); setEditingId(null); setShowForm(true); }}
            className="bg-black text-white font-medium px-6 py-3 text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
          >
            {t(locale, 'account.addAddress')}
          </button>
        </div>

        {/* Address Form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 p-6 border border-gray-200 bg-gray-50">
            <h3 className="text-lg font-semibold text-black mb-4">
              {editingId ? t(locale, 'account.editAddress') : t(locale, 'account.addAddress')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input type="text" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                <input type="text" required value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                <input type="text" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input type="text" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <input type="text" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input type="text" value={form.zip_code} onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <input type="checkbox" id="is_default" checked={form.is_default}
                  onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                  className="w-4 h-4 border-gray-300" />
                <label htmlFor="is_default" className="text-sm text-gray-700">Set as default address</label>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit"
                className="bg-black text-white font-medium px-6 py-3 text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors">
                {t(locale, 'common.save')}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}
                className="border border-gray-300 text-gray-700 font-medium px-6 py-3 text-sm hover:bg-gray-50 transition-colors">
                {t(locale, 'common.cancel')}
              </button>
            </div>
          </form>
        )}

        {/* Address List */}
        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="border border-gray-200 p-6 relative">
                {addr.is_default && (
                  <span className="absolute top-4 right-4 text-xs font-medium bg-black text-white px-2 py-1">
                    Default
                  </span>
                )}
                <div className="space-y-1">
                  <p className="font-medium text-gray-900">{addr.name}</p>
                  <p className="text-sm text-gray-600">{addr.phone}</p>
                  <p className="text-sm text-gray-600">
                    {[addr.street, addr.district, addr.city, addr.state, addr.country].filter(Boolean).join(', ')}
                    {addr.zip_code && ` ${addr.zip_code}`}
                  </p>
                </div>
                <div className="flex gap-4 mt-4">
                  <button onClick={() => handleEdit(addr)} className="text-sm text-gray-600 hover:text-black transition-colors">
                    {t(locale, 'common.edit')}
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="text-sm text-red-500 hover:text-red-700 transition-colors">
                    {t(locale, 'common.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t(locale, 'account.noSavedAddresses')}</h3>
            <p className="text-gray-500">Add an address to speed up checkout</p>
          </div>
        )}
      </div>
    </div>
  );
}
