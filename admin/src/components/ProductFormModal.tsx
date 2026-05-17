'use client';

import { useState, useEffect } from 'react';
import { Product, ProductCreateRequest, ProductCategory } from '@/types';
import { adminAPI } from '@/lib/api';
import ImageUploader from '@/components/ImageUploader';

interface ProductFormModalProps {
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function ProductFormModal({ product, onClose, onSaved }: ProductFormModalProps) {
  const isEdit = product !== null;

  const [form, setForm] = useState<ProductCreateRequest>({
    title: '',
    slug: '',
    description: '',
    short_desc: '',
    category_id: 1,
    price: 0,
    compare_price: 0,
    stock: 0,
    weight: 0,
    status: 'draft',
    images: '',
    is_featured: false,
    meta_title: '',
    meta_desc: '',
  });

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminAPI.listCategories().then((res) => setCategories(res.data?.categories || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title || '',
        slug: product.slug || '',
        description: product.description || '',
        short_desc: product.short_desc || '',
        category_id: product.category_id || 1,
        price: product.price || 0,
        compare_price: product.compare_price || 0,
        stock: product.stock || 0,
        weight: product.weight || 0,
        status: product.status || 'draft',
        images: product.images || '',
        is_featured: product.is_featured || false,
        meta_title: product.meta_title || '',
        meta_desc: product.meta_desc || '',
      });
    }
  }, [product]);

  const handleChange = (field: keyof ProductCreateRequest, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      slug: isEdit ? prev.slug : slugify(value),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit && product) {
        await adminAPI.updateProduct(product.id, form);
      } else {
        await adminAPI.createProduct(form);
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Product' : 'Add Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Title *</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
                placeholder="Product title"
              />
            </div>

            <div>
              <label className={labelClass}>Slug</label>
              <input
                className={inputClass}
                value={form.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="product-slug"
              />
            </div>

            <div>
              <label className={labelClass}>Status</label>
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Category</label>
              <select
                className={inputClass}
                value={form.category_id}
                onChange={(e) => handleChange('category_id', Number(e.target.value))}
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Price *</label>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Compare Price</label>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min="0"
                value={form.compare_price}
                onChange={(e) => handleChange('compare_price', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className={labelClass}>Stock *</label>
              <input
                className={inputClass}
                type="number"
                min="0"
                value={form.stock}
                onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div>
              <label className={labelClass}>Weight (g)</label>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                min="0"
                value={form.weight}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Short Description</label>
              <input
                className={inputClass}
                value={form.short_desc}
                onChange={(e) => handleChange('short_desc', e.target.value)}
                placeholder="Brief product summary"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Full Description</label>
              <textarea
                className={inputClass}
                rows={4}
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Detailed product description"
              />
            </div>

            <div className="md:col-span-2">
              <ImageUploader
                images={form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : []}
                onChange={(urls) => handleChange('images', urls.join(', '))}
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Meta Title (SEO)</label>
              <input
                className={inputClass}
                value={form.meta_title}
                onChange={(e) => handleChange('meta_title', e.target.value)}
                placeholder="SEO title"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Meta Description (SEO)</label>
              <textarea
                className={inputClass}
                rows={2}
                value={form.meta_desc}
                onChange={(e) => handleChange('meta_desc', e.target.value)}
                placeholder="SEO description"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => handleChange('is_featured', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Featured Product</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 transition-colors"
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}