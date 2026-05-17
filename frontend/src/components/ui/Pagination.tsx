'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';

interface PaginationProps {
  page: number;
  total_pages: number;
}

export default function Pagination({ page, total_pages }: PaginationProps) {
  const router = useRouter();
  const locale = useI18nStore((s) => s.locale);

  if (total_pages <= 1) return null;

  const handlePageChange = (newPage: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', newPage.toString());
    router.push(url.toString());
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => handlePageChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        {t(locale, 'common.previous')}
      </button>

      {Array.from({ length: Math.min(5, total_pages) }, (_, i) => {
        let pageNum: number;
        if (total_pages <= 5) {
          pageNum = i + 1;
        } else if (page <= 3) {
          pageNum = i + 1;
        } else if (page >= total_pages - 2) {
          pageNum = total_pages - 4 + i;
        } else {
          pageNum = page - 2 + i;
        }

        return (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
              page === pageNum
                ? 'bg-blue-600 text-white'
                : 'border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= total_pages}
        className="px-4 py-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
      >
        {t(locale, 'common.next')}
      </button>
    </div>
  );
}
