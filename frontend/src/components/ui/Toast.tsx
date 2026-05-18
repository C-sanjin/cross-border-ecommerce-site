'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useToastStore, Toast as ToastItem, ToastType } from '@/store/toastStore';

const bgMap: Record<ToastType, string> = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-gray-800',
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const removeToast = useToastStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, removeToast]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => removeToast(toast.id)}
      className={`${bgMap[toast.type]} text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-[380px] cursor-pointer`}
    >
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeToast(toast.id);
        }}
        className="shrink-0 hover:opacity-70 transition-opacity"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastCard toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}