'use client';

import * as React from 'react';
import { products, type Product } from '@/lib/mock-data';
import { Button, Badge, cn } from '@/components/ui';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ShoppingCart, Filter, ChevronDown } from 'lucide-react';

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
        {product.isNew && (
          <div className="absolute top-4 left-4">
            <Badge>New Arrival</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>
      <div className="p-6 flex flex-col items-center text-center">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">{product.category}</span>
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

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = React.useState<'All' | 'For Her' | 'For Him' | 'Testers' | 'Deals'>('All');

  const filteredProducts = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === activeCategory);

  const categories = ['All', 'For Her', 'For Him', 'Testers', 'Deals'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 border-b border-border pb-8">
        <div>
          <h1 className="text-5xl font-serif mb-4">The Collection</h1>
          <p className="text-neutral-500 max-w-md">Explore our full range of artisanal fragrances, crafted for every mood and occasion.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={cn(
                "text-[10px] uppercase tracking-widest px-4 py-2 border transition-all duration-300",
                activeCategory === cat
                  ? "bg-black text-white border-black"
                  : "bg-white text-black border-border hover:border-black"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-xl font-serif text-neutral-400">No products found in this category.</p>
        </div>
      )}
    </motion.div>
  );
}
