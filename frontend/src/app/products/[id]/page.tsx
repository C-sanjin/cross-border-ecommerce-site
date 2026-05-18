import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';

interface Props {
  params: { id: string };
}

async function getProduct(id: string) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';
    const res = await fetch(`${apiUrl}/products/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const product = await res.json();
    return product;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found - The Boutique',
    };
  }

  const images = product.images ? JSON.parse(product.images) : [];
  const ogImage = images.length > 0 ? images[0] : undefined;

  return {
    title: product.meta_title || `${product.title} - The Boutique`,
    description: product.meta_desc || product.description?.substring(0, 160) || '',
    openGraph: {
      title: product.title,
      description: product.meta_desc || product.description?.substring(0, 160) || '',
      images: ogImage ? [{ url: ogImage }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.meta_desc || product.description?.substring(0, 160) || '',
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default function ProductPage({ params }: Props) {
  return <ProductDetailClient params={params} />;
}