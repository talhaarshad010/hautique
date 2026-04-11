'use client';

import * as React from 'react';
import { type Deal, type Product } from '@/lib/mock-data';
import { Button, cn } from '@/components/ui';
import { Calendar, Tag, ArrowRight, Loader2, Sparkles, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import Link from 'next/link';

export default function DealsPage() {
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const dealsRef = ref(database, 'deals');
    const unsubscribe = onValue(dealsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([id, deal]: [string, any]) => ({
          id,
          ...deal
        }));
        setDeals(formatted);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([id, product]: [string, any]) => ({
          id,
          ...product
        }));
        setProducts(formatted);
      }
    });

    return () => unsubscribe();
  }, []);

  const getProductById = (id: string) => products.find(p => p.id === id);

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto min-h-screen">
      <div className="max-w-xl mb-24">
        <h1 className="text-5xl md:text-7xl  mb-8 leading-tight uppercase tracking-tight">The Private Collection</h1>
        <p className="text-neutral-500 leading-relaxed max-w-md text-sm uppercase tracking-widest font-bold">
          Exclusive seasonal campaigns and limited-time promotional logic. Discover your next signature scent at an exceptional value.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-neutral-200" />
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Unlocking Campaigns...</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-32 bg-neutral-50 border border-dashed border-neutral-200">
          <Sparkles className="w-8 h-8 text-neutral-200 mx-auto mb-4" />
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2">No active campaigns at this moment</p>
          <p className="text-neutral-300 text-sm italic">Join our newsletter to be notified of the next private sale.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-24">
          {deals.map((deal, index) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="space-y-12"
            >
              {/* Deal Header */}
              <div className={cn(
                "group relative flex flex-col lg:flex-row gap-12 items-center",
                index % 2 === 1 && "lg:flex-row-reverse"
              )}>
                {/* Campaign Image */}
                <div className="w-full lg:w-3/5 relative aspect-[16/9] lg:aspect-[4/3] overflow-hidden bg-neutral-100">
                  <img
                    src={deal.image.includes('/upload/') ? deal.image.replace('/upload/', '/upload/f_auto,q_auto/') : deal.image}
                    alt={deal.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700" />
                </div>

                {/* Campaign Details */}
                <div className="w-full lg:w-2/5 space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">
                      <Tag className="w-3 h-3" />
                      <span>Campaign Active</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl  leading-tight">{deal.name}</h2>
                    <p className="text-neutral-500 uppercase tracking-widest text-xs font-bold">{deal.subtextText}</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-xs">
                      <Calendar className="w-4 h-4 text-neutral-300" />
                      <span className="text-neutral-400  italic">{deal.durationRange}</span>
                    </div>
                    
                    {deal.price && (
                      <div className="pt-4 pb-2 border-b border-neutral-100">
                        <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1 font-bold">Featured Price</p>
                        <p className="text-3xl ">${deal.price}.00</p>
                      </div>
                    )}

                    <Link href={`/deals/${deal.id}`}>
                      <Button variant="outline" size="lg" className="w-full lg:w-auto mt-4 group/btn">
                        Explore Sale
                        <ArrowRight className="w-4 h-4 ml-3 group-hover/btn:translate-x-2 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Divider between deals */}
              {index < deals.length - 1 && (
                <div className="border-b border-neutral-100" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Footer Accents */}
      <div className="mt-32 pt-16 border-t border-neutral-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-bold">Discover Your Essence</p>
        <div className="flex gap-12 text-[10px] uppercase tracking-[0.2em] font-bold">
            <span className="text-neutral-300">Curated</span>
            <span className="text-neutral-300">Authentic</span>
            <span className="text-neutral-300">Timeless</span>
        </div>
      </div>
    </div>
  );
}
