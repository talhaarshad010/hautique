"use client";

import * as React from "react";
import { type Deal, type Product } from "@/lib/mock-data";
import { Button, cn } from "@/components/ui";
import {
  Calendar,
  Tag,
  ArrowRight,
  Loader2,
  Sparkles,
  ShoppingCart,
} from "lucide-react";
import { motion } from "motion/react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import Link from "next/link";

export default function DealsPage() {
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const dealsRef = ref(database, "deals");
    const unsubscribe = onValue(dealsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(
          ([id, deal]: [string, any]) => ({
            id,
            ...deal,
          }),
        );
        setDeals(formatted);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    const productsRef = ref(database, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(
          ([id, product]: [string, any]) => ({
            id,
            ...product,
          }),
        );
        setProducts(formatted);
      }
    });

    return () => unsubscribe();
  }, []);

  const getProductById = (id: string) => products.find((p) => p.id === id);

  return (
    <div className="bg-white min-h-screen">
      <div className="pt-24 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="max-w-2xl mb-32">
          <h1 className="text-6xl md:text-8xl  mb-10 leading-[0.9] uppercase tracking-tighter">
            The Private <br /> Collection
          </h1>
          <p className="text-neutral-500 leading-relaxed max-w-md text-[11px] uppercase tracking-[0.2em] font-medium border-l border-neutral-200 pl-8">
            Seasonal campaigns and limited-time promotional logic. Discover your
            next signature scent at an exceptional value.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-neutral-200" />
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
              Unlocking Campaigns...
            </p>
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-32 bg-white border border-dashed border-neutral-100 italic">
            <Sparkles className="w-8 h-8 text-neutral-200 mx-auto mb-4" />
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2">
              No active campaigns at this moment
            </p>
            <p className="text-neutral-300 text-sm">
              Join our newsletter to be notified of the next private sale.
            </p>
          </div>
        ) : (
          <div className="space-y-40">
            {deals.map((deal, index) => (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="relative"
              >
                {/* Campaign Entry */}
                <div
                  className={cn(
                    "flex flex-col lg:flex-row gap-16 items-center",
                    index % 2 === 1 && "lg:flex-row-reverse",
                  )}
                >
                  {/* Campaign Image with decorative elements */}
                  <div className="w-full lg:w-3/5 relative group">
                    <div className="absolute -inset-4 bg-neutral-50/50 -z-10 rounded-3xl rotate-2 group-hover:rotate-0 transition-transform duration-700" />
                    <div className="relative aspect-[16/10] overflow-hidden bg-neutral-50 border border-neutral-100 shadow-2xl">
                      <img
                        src={deal.image}
                        alt={deal.name}
                        className="w-full h-full object-contain transition-transform duration-1000 scale-100 group-hover:scale-105"
                      />
                    </div>
                  </div>

                  {/* Campaign Details */}
                  <div className="w-full lg:w-2/5 space-y-10">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.4em] font-bold text-neutral-400">
                        <Tag className="w-3 h-3" />
                        <span>Featured Campaign</span>
                      </div>
                      <h2 className="text-5xl md:text-6xl  leading-none tracking-tighter uppercase">
                        {deal.name}
                      </h2>
                      <div className="flex items-center gap-6">
                        <div className="h-px w-12 bg-neutral-200" />
                        <p className="text-neutral-400 uppercase tracking-widest text-[10px] font-bold">
                          {deal.subtextText}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="flex items-center gap-4 text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                        <Calendar className="w-4 h-4 text-neutral-200" />
                        <span className="italic">{deal.durationRange}</span>
                      </div>

                      {deal.price && (
                        <div className="bg-white p-8 border border-neutral-100 shadow-sm relative overflow-hidden group/price">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-neutral-50 -mr-12 -mt-12 rounded-full blur-2xl group-hover/price:scale-150 transition-transform duration-700" />
                          <p className="text-[10px] uppercase tracking-widest text-neutral-400 mb-3 font-bold relative z-10">
                            Exclusive Collection Rate
                          </p>
                          <p className="text-4xl  relative z-10 font-bold">
                            PKR {deal.price}.00
                          </p>
                        </div>
                      )}

                      <Link href={`/deals/${deal.id}`} className="block">
                        <Button className="w-full lg:w-auto h-14 px-12 rounded-none bg-black text-white hover:bg-neutral-800 text-[10px] uppercase tracking-widest font-bold group/btn shadow-xl">
                          Explore Campaign
                          <ArrowRight className="w-4 h-4 ml-3 group-hover/btn:translate-x-2 transition-transform" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
