'use client';

import * as React from 'react';
import { type Product } from '@/lib/mock-data';
import { Button, cn } from '@/components/ui';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="group relative flex flex-col bg-white border border-neutral-100 overflow-hidden"
    >
      <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-neutral-50 px-8 py-12">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-8 transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          
        />
        <div className="absolute top-4 left-4">
          <span className="bg-black text-[8px] text-white px-2 py-1 uppercase tracking-widest font-bold">Tester</span>
        </div>
      </Link>
      <div className="p-8 flex flex-col items-center text-center">
        <h3 className="text-lg font-serif mb-2 group-hover:underline underline-offset-4">{product.name}</h3>
        <p className="text-xs font-serif tracking-widest mb-6 text-neutral-500">${product.price}.00</p>
        <Button variant="outline" size="sm" className="w-full rounded-none border-neutral-200 group-hover:bg-black group-hover:text-white transition-all text-[10px] uppercase tracking-widest h-10">
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};

export default function TestersPage() {
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedProducts = Object.entries(data).map(([id, product]: [string, any]) => ({
          id,
          ...product
        }));
        setProductsList(formattedProducts.filter(p => p.category === 'Testers'));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto"
    >
      <div className="text-center mb-24 max-w-2xl mx-auto">
        <span className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 mb-4 block font-bold">Discover Excellence</span>
        <h1 className="text-5xl md:text-6xl font-serif mb-8">Try Our Testers</h1>
        <p className="text-neutral-500 leading-relaxed italic">
          "Experience luxury before you commit. Our testers are identical to the original scents, providing the same trail and longevity in simpler packaging."
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-200" />
        </div>
      ) : productsList.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">No testers available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {productsList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
