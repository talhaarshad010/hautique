"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@/components/ui";
import { Search, ShoppingBag, ArrowRight, Clock, Package } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function TrackOrderSearchPage() {
  const [orderId, setOrderId] = React.useState("");
  const [recentOrders, setRecentOrders] = React.useState<string[]>([]);
  const router = useRouter();

  React.useEffect(() => {
    const saved = localStorage.getItem("hautique_recent_orders");
    if (saved) {
      try {
        setRecentOrders(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent orders");
      }
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) {
      const id = orderId.trim().toUpperCase();
      // Ensure it has the ORD- prefix if not typed
      const formattedId = id.startsWith("ORD-") ? id : `ORD-${id}`;
      router.push(`/order-tracking/${formattedId}`);
    }
  };

  return (
    <div className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-[80vh]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h1 className="text-5xl  mb-6 tracking-tight">Track Your Order</h1>
        <p className="text-neutral-500 max-w-lg mx-auto uppercase tracking-widest text-[10px] leading-loose">
          Enter your order ID from your confirmation email to check the current
          status of your luxury fragrance delivery.
        </p>
      </motion.div>

      <Card className="p-8 md:p-12 mb-16 border-none shadow-xl bg-neutral-50">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 font-bold" />
            <Input
              placeholder="E.G. ORD-XJ7Y2A"
              className="pl-14 h-16 text-lg tracking-[0.2em] font-bold uppercase border-none bg-white shadow-inner"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <Button
            size="lg"
            className="w-full h-16 text-xs uppercase tracking-[0.3em] font-black"
          >
            Track Journey
          </Button>
        </form>
      </Card>

      <AnimatePresence>
        {recentOrders.length > 0 && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <Clock className="w-4 h-4 text-neutral-400" />
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-black text-neutral-400">
                Recent Orders
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentOrders.map((id) => (
                <button
                  key={id}
                  onClick={() => router.push(`/order-tracking/${id}`)}
                  className="flex items-center justify-between p-6 bg-white border border-neutral-100 hover:border-black transition-all group text-left"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-widest mb-1">
                        {id}
                      </p>
                      <p className="text-[8px] text-neutral-400 uppercase tracking-widest">
                        Click to view details
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-neutral-300 group-hover:text-black group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
