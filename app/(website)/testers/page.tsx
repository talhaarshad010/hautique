'use client';

import * as React from 'react';
import { products, type Product } from '@/lib/mock-data';
import { Button, Badge, cn } from '@/components/ui';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group relative flex flex-col bg-white border border-border overflow-hidden"
    >
      <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>
      <div className="p-6 flex flex-col items-center text-center">
        <h3 className="text-lg font-serif mb-2 group-hover:underline underline-offset-4">{product.name}</h3>
        <p className="text-sm font-medium mb-6">${product.price}.00</p>
        <Button variant="outline" size="sm" className="w-full group-hover:bg-black group-hover:text-white">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};

export default function TestersPage() {
  const testers = products.filter(p => p.category === 'Testers');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto"
    >
      <div className="text-center mb-20">
        <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-4 block">Discovery Set</span>
        <h1 className="text-5xl md:text-6xl font-serif mb-6">Fragrance Testers</h1>
        <p className="text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          Experience our signature scents before committing to a full bottle. Our testers are the perfect way to find your next signature fragrance.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {testers.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </motion.div>
  );
}
