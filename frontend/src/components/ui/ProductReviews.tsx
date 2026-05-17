'use client';

import { useState, useEffect } from 'react';
import { reviewsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { useI18nStore } from '@/store/i18nStore';
import { t } from '@/lib/i18n';
import { ProductReview } from '@/types';

interface ProductReviewsProps {
  productId: number;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const { isAuthenticated } = useAuthStore();
  const locale = useI18nStore((s) => s.locale);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const res = await reviewsAPI.list(productId);
      setReviews(res.data.reviews || []);
      setAvgRating(res.data.avg_rating || 0);
      setTotal(res.data.total || 0);
    } catch {
      console.error('Failed to fetch reviews');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await reviewsAPI.create(productId, {
        rating: newRating,
        title: newTitle,
        content: newContent,
      });
      setShowForm(false);
      setNewTitle('');
      setNewContent('');
      setNewRating(5);
      fetchReviews();
    } catch {
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => setNewRating(star) : undefined}
            className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          >
            <svg
              className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 fill-gray-300'}`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
    );
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="mt-20 border-t border-gray-100 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-black">Customer Reviews</h2>
          {total > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {renderStars(Math.round(avgRating))}
              <span className="text-sm text-gray-500">
                {avgRating.toFixed(1)} out of 5 ({total} {total === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>
        {isAuthenticated && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white font-medium px-6 py-3 text-sm uppercase tracking-wide hover:bg-gray-800 transition-colors"
          >
            {t(locale, 'product.writeReview')}
          </button>
        )}
      </div>

      {/* Review Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-10 p-6 border border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-black mb-4">Write Your Review</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            {renderStars(newRating, true)}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors text-sm"
              placeholder="Summarize your review"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-200 focus:border-black focus:outline-none transition-colors text-sm resize-none"
              placeholder="Share your experience with this product"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-black text-white font-medium px-6 py-3 text-sm uppercase tracking-wide hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="border border-gray-300 text-gray-700 font-medium px-6 py-3 text-sm hover:bg-gray-50 transition-colors"
            >
              {t(locale, 'common.cancel')}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                    {review.user_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <span className="font-medium text-gray-900 text-sm">{review.user_name}</span>
                </div>
                <span className="text-xs text-gray-400">{formatDate(review.created_at)}</span>
              </div>
              <div className="ml-11">
                {renderStars(review.rating)}
                {review.title && (
                  <h4 className="font-medium text-gray-900 mt-2 text-sm">{review.title}</h4>
                )}
                {review.content && (
                  <p className="text-gray-600 mt-1 text-sm leading-relaxed">{review.content}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">{t(locale, 'product.noReviews')}</p>
        </div>
      )}
    </div>
  );
}
