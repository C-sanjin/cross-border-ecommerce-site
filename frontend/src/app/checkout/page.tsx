'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { addressesAPI, couponsAPI, ordersAPI } from '@/lib/api';
import { UserAddress, CouponValidation } from '@/types';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';

export default function CheckoutPage() {
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);
  const { isAuthenticated, loading: authLoading } = useAuthStore();
  const { items, getTotal, fetchCart, clearCart, loading: cartLoading } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [address, setAddress] = useState({
    name: '', phone: '', country: 'United States', state: '', city: '', street: '', zip_code: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('paypal');
  const [note, setNote] = useState('');

  const [couponCode, setCouponCode] = useState('');
  const [couponValidation, setCouponValidation] = useState<CouponValidation | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/account/login?redirect=/checkout');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchAddresses();
    }
  }, [isAuthenticated]);

  const fetchAddresses = async () => {
    try {
      const res = await addressesAPI.list();
      const addrs = res.data.addresses || [];
      setSavedAddresses(addrs);
      const defaultAddr = addrs.find((a: UserAddress) => a.is_default);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
        fillAddressForm(defaultAddr);
      }
    } catch {
      console.error('Failed to fetch addresses');
    }
  };

  const fillAddressForm = (addr: UserAddress) => {
    setAddress({
      name: addr.name, phone: addr.phone, country: addr.country,
      state: addr.state, city: addr.city, street: addr.street, zip_code: addr.zip_code,
    });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
    setSelectedAddressId(null);
  };

  const handleSelectAddress = (addr: UserAddress) => {
    setSelectedAddressId(addr.id);
    fillAddressForm(addr);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponValidation(null);
    try {
      const subtotal = getTotal();
      const res = await couponsAPI.validate(couponCode.trim(), subtotal);
      setCouponValidation(res.data);
    } catch {
      setCouponValidation({ coupon: null as any, discount_amount: 0, is_valid: false, message: 'Failed to validate coupon' });
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponValidation(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!address.name || !address.phone || !address.country || !address.state || !address.city || !address.street || !address.zip_code) {
      setError('Please fill in all address fields');
      return;
    }

    setSubmitting(true);

    try {
      const orderData: any = {
        shipping_address: address,
        payment_method: paymentMethod,
        note,
      };
      if (couponValidation?.is_valid && couponValidation.coupon) {
        orderData.coupon_code = couponValidation.coupon.code;
      }

      const response = await ordersAPI.create(orderData);
      await clearCart();
      router.push(`/checkout/success?order_id=${response.data.id}`);
    } catch {
      setError('Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const subtotal = getTotal();
  const shippingFee = subtotal > 100 ? 0 : 15;
  const discountAmount = couponValidation?.is_valid ? couponValidation.discount_amount : 0;
  const total = subtotal + shippingFee - discountAmount;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-black tracking-tight mb-8">{t(locale, 'checkout.title')}</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Your cart is empty</p>
            <button onClick={() => router.push('/products')}
              className="bg-black text-white font-medium px-6 py-3 text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors">
              Browse Products
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-black mb-4">{t(locale, 'checkout.savedAddresses')}</h2>
                  <div className="space-y-3">
                    {savedAddresses.map((addr) => (
                      <button
                        key={addr.id}
                        type="button"
                        onClick={() => handleSelectAddress(addr)}
                        className={`w-full text-left p-4 border transition-colors ${
                          selectedAddressId === addr.id ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{addr.name}</span>
                          {addr.is_default && (
                            <span className="text-xs bg-black text-white px-2 py-0.5">Default</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{addr.phone}</p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {[addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(', ')} {addr.zip_code}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Shipping Address Form */}
              <div className="border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4">
                  {selectedAddressId ? t(locale, 'checkout.shippingAddress') : t(locale, 'checkout.newAddress')}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t(locale, 'auth.name')}</label>
                    <input type="text" name="name" value={address.name} onChange={handleAddressChange} required
                      className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" name="phone" value={address.phone} onChange={handleAddressChange} required
                      className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input type="text" name="country" value={address.country} onChange={handleAddressChange} required
                      className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                    <input type="text" name="state" value={address.state} onChange={handleAddressChange} required
                      className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input type="text" name="city" value={address.city} onChange={handleAddressChange} required
                      className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                    <input type="text" name="zip_code" value={address.zip_code} onChange={handleAddressChange} required
                      className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input type="text" name="street" value={address.street} onChange={handleAddressChange} required
                      className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm" />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4">{t(locale, 'checkout.paymentMethod')}</h2>
                <div className="space-y-3">
                  <label className={`flex items-center p-4 border cursor-pointer transition-colors ${
                    paymentMethod === 'paypal' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                  }`}>
                    <input type="radio" name="payment" value="paypal" checked={paymentMethod === 'paypal'}
                      onChange={() => setPaymentMethod('paypal')} className="mr-3" />
                    <span className="font-medium text-sm">PayPal</span>
                  </label>
                  <label className={`flex items-center p-4 border cursor-pointer transition-colors ${
                    paymentMethod === 'stripe' ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-400'
                  }`}>
                    <input type="radio" name="payment" value="stripe" checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')} className="mr-3" />
                    <span className="font-medium text-sm">Credit Card (Stripe)</span>
                  </label>
                </div>
              </div>

              {/* Order Note */}
              <div className="border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-black mb-4">{t(locale, 'checkout.orderNote')}</h2>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                  className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none text-sm resize-none"
                  placeholder={t(locale, 'checkout.orderNote')} />
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="border border-gray-200 p-6 sticky top-20">
                <h2 className="text-lg font-semibold text-black mb-4">{t(locale, 'common.orderSummary')}</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 bg-gray-100 flex-shrink-0 overflow-hidden">
                        {item.product.images ? (
                          <img src={JSON.parse(item.product.images)[0]} alt={item.product.title}
                            className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.title}</p>
                        <p className="text-xs text-gray-500">{t(locale, 'product.quantity')}: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Coupon Code */}
                <div className="mb-6 border-t border-gray-100 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t(locale, 'checkout.couponCode')}</label>
                  {couponValidation?.is_valid ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200">
                      <div>
                        <span className="text-sm font-medium text-green-700">{couponCode}</span>
                        <span className="text-sm text-green-600 ml-2">-${discountAmount.toFixed(2)}</span>
                      </div>
                      <button type="button" onClick={handleRemoveCoupon} className="text-sm text-red-500 hover:text-red-700">{t(locale, 'checkout.remove')}</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1 px-4 py-2.5 border border-gray-200 focus:border-black focus:outline-none text-sm"
                        placeholder={t(locale, 'checkout.couponCode')} />
                      <button type="button" onClick={handleApplyCoupon} disabled={couponLoading}
                        className="bg-black text-white font-medium px-4 py-2.5 text-sm hover:bg-gray-800 disabled:bg-gray-400 transition-colors">
                        {couponLoading ? '...' : t(locale, 'checkout.apply')}
                      </button>
                    </div>
                  )}
                  {couponValidation && !couponValidation.is_valid && (
                    <p className="text-xs text-red-500 mt-1">{couponValidation.message}</p>
                  )}
                </div>

                <div className="space-y-3 border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t(locale, 'cart.subtotal')}</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>{t(locale, 'checkout.discount')}</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{t(locale, 'cart.shipping')}</span>
                    <span>{shippingFee === 0 ? t(locale, 'cart.freeShipping') : `$${shippingFee.toFixed(2)}`}</span>
                  </div>
                  {shippingFee === 0 && (
                    <p className="text-xs text-green-600">Free shipping on orders over $100</p>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-3">
                    <span>{t(locale, 'cart.total')}</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full mt-6 py-4 bg-black text-white font-medium text-sm uppercase tracking-wide hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors">
                  {submitting ? t(locale, 'checkout.processing') : t(locale, 'checkout.placeOrder')}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
