import * as React from 'react';
import { Metadata } from 'next';
import { ref, get, child } from 'firebase/database';
import { database } from '@/lib/firebase';
import ProductDetailsClient from './ProductDetailsClient';

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, `products/${params.id}`));
  const product = snapshot.val();
  
  if (!product) return { title: 'Hautique - Signature Collection' };

  return {
    title: `Hautique - ${product.name}`,
    description: product.description,
    openGraph: {
      title: `Hautique - ${product.name}`,
      description: product.description,
      images: [{ url: product.image, width: 800, height: 800, alt: product.name }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `Hautique - ${product.name}`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const dbRef = ref(database);
  const snapshot = await get(child(dbRef, `products/${params.id}`));
  const productData = snapshot.val();

  if (!productData) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-32">
        <p className="text-xl font-serif text-neutral-400 uppercase tracking-widest">Fragrance not found.</p>
      </div>
    );
  }

  const product = { id: params.id, ...productData };

  return <ProductDetailsClient initialProduct={product} productId={params.id} />;
}
