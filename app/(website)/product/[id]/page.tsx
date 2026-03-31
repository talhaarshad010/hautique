'use client';

import * as React from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { products, type Product } from '@/lib/mock-data';
import { Button, Badge } from '@/components/ui';
import { ShoppingCart, Heart, Share2, Minus, Plus, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductPage() {
  const params = useParams();
  const product = products.find((p) => p.id === params.id);
  const [quantity, setQuantity] = React.useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-serif">Product not found.</p>
      </div>
    );
  }

  const relatedProducts = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-16 mb-24">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square bg-neutral-100 border border-border overflow-hidden"
          >
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
            {product.isNew && <Badge className="absolute top-6 left-6">New Arrival</Badge>}
          </motion.div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="relative aspect-square bg-neutral-100 border border-border cursor-pointer hover:opacity-70 transition-opacity">
                <Image
                  src={`https://picsum.photos/seed/perfume-thumb-${i}/300/300`}
                  alt="Thumbnail"
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-4 block">{product.brand}</span>
            <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight">{product.name}</h1>
            <p className="text-2xl font-medium">${product.price}.00</p>
          </div>

          <p className="text-neutral-600 leading-relaxed mb-10 border-b border-border pb-10">
            {product.description}
          </p>

          <div className="space-y-8 mb-12">
            <div className="flex items-center gap-6">
              <span className="text-xs uppercase tracking-widest font-bold">Quantity</span>
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-neutral-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-neutral-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-grow">
                <ShoppingCart className="w-5 h-5 mr-3" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg" className="px-6">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="px-6">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-border">
            <div className="flex flex-col items-center text-center gap-3">
              <Truck className="w-6 h-6 text-neutral-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <RotateCcw className="w-6 h-6 text-neutral-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold">30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <ShieldCheck className="w-6 h-6 text-neutral-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pt-24 border-t border-border">
          <h2 className="text-3xl font-serif mb-12">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -5 }}
                className="group flex flex-col bg-white border border-border overflow-hidden"
              >
                <a href={`/product/${p.id}`} className="relative aspect-square overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </a>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-serif mb-2">{p.name}</h3>
                  <p className="text-sm font-medium">${p.price}.00</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
