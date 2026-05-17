import { create } from 'zustand';
import { CurrencyRate } from '@/types';

const CURRENCY_RATES: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149.5 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 7.24 },
  { code: 'KRW', name: 'Korean Won', symbol: '₩', rate: 1345.0 },
];

interface CurrencyState {
  currency: string;
  rates: CurrencyRate[];
  setCurrency: (code: string) => void;
  convert: (amount: number) => number;
  getSymbol: () => string;
  formatPrice: (amount: number) => string;
}

export const useCurrencyStore = create<CurrencyState>()((set, get) => ({
  currency: 'USD',
  rates: CURRENCY_RATES,
  setCurrency: (code) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', code);
    }
    set({ currency: code });
  },
  convert: (amount) => {
    const { currency, rates } = get();
    const rate = rates.find((r) => r.code === currency)?.rate || 1;
    return amount * rate;
  },
  getSymbol: () => {
    const { currency, rates } = get();
    return rates.find((r) => r.code === currency)?.symbol || '$';
  },
  formatPrice: (amount) => {
    const { currency, rates } = get();
    const rateInfo = rates.find((r) => r.code === currency);
    const converted = amount * (rateInfo?.rate || 1);
    const symbol = rateInfo?.symbol || '$';
    if (currency === 'JPY' || currency === 'KRW') {
      return `${symbol}${Math.round(converted).toLocaleString()}`;
    }
    return `${symbol}${converted.toFixed(2)}`;
  },
}));
