"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { type Deal, type Product } from "@/lib/mock-data";
import { Button, cn, Badge } from "@/components/ui";
import {
  Calendar,
  Tag,
  ArrowLeft,
  Loader2,
  ShoppingCart,
  Plus,
  Check,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [deal, setDeal] = React.useState<Deal | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addedItems, setAddedItems] = React.useState<Record<string, boolean>>(
    {},
  );

  React.useEffect(() => {
    if (!id) return;

    const dealRef = ref(database, `deals/${id}`);
    const unsubscribeDeal = onValue(dealRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeal({ id: id as string, ...data });

        // Fetch products once deal is loaded
        if (data.productIds && data.productIds.length > 0) {
          const productsRef = ref(database, "products");
          onValue(productsRef, (prodSnapshot) => {
            const allProducts = prodSnapshot.val();
            if (allProducts) {
              const selectedProducts = data.productIds
                .map((pid: string) => ({ id: pid, ...allProducts[pid] }))
                .filter((p: any) => p.name); // basic validation
              setProducts(selectedProducts);
            }
          });
        }
      }
      setLoading(false);
    });

    return () => unsubscribeDeal();
  }, [id]);

  const handleAddDealToCart = () => {
    if (!deal) return;

    setLoading(true);

    // Create a specialized product object for the deal
    const dealAsProduct: Product = {
      id: `deal-${deal.id}`,
      name: deal.name,
      brand: "Hautique Campaign",
      price: deal.price || 0,
      category: "Deals",
      image: deal.image,
      description: deal.subtextText,
      sizes: [],
    };

    addToCart(dealAsProduct, 1);

    setAddedItems((prev) => ({ ...prev, all: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, all: false }));
      setLoading(false);
    }, 1500);
  };

  if (loading && !deal) {
    return (
      <div className="pt-12 pb-24 px-6 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-200" />
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold italic">
          Unlocking Exclusive Campaign...
        </p>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="pt-20 pb-24 px-6 text-center max-w-xl mx-auto">
        <Sparkles className="w-12 h-12 text-neutral-200 mx-auto mb-6" />
        <h2 className="text-3xl  mb-4 uppercase tracking-tight">
          Campaign Expired
        </h2>
        <p className="text-neutral-500 text-sm italic mb-12">
          This collection is no longer available or the link has changed.
        </p>
        <Button
          onClick={() => router.push("/deals")}
          variant="outline"
          className="text-[10px] uppercase tracking-widest px-8"
        >
          Back to Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Dynamic Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] md:h-[85vh] w-full overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <img
              src={
                deal.image.includes("/upload/")
                  ? deal.image.replace("/upload/", "/upload/f_auto,q_auto/")
                  : deal.image
              }
              alt={deal.name}
              className="w-full h-full object-contain transition-transform duration-[20s] scale-110 hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/40" />
          </div>
        </div>

        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/20 px-6 py-2 rounded-full mb-8">
               <Sparkles className="w-4 h-4 text-white" />
               <span className="text-[10px] uppercase tracking-[0.5em] font-bold text-white">
                Atelier Campaign
               </span>
            </div>
            <h1 className="text-6xl md:text-9xl  mb-6 uppercase tracking-tighter leading-none text-white drop-shadow-2xl">
              {deal.name}
            </h1>
            <p className="text-xl md:text-2xl font-medium tracking-[0.2em] uppercase mb-12 text-white/90 italic decoration-white">
              {deal.subtextText}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-10 text-[11px] uppercase tracking-[0.3em] font-bold">
              <div className="flex items-center gap-3 text-white">
                <Calendar className="w-4 h-4 text-white" />
                <span>{deal.durationRange}</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <Tag className="w-4 h-4 text-white" />
                <span>Exclusive Value Enabled</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Campaign Rate & CTA context */}
      <div className="relative z-20 -mt-24 px-6">
         <div className="max-w-4xl mx-auto bg-white shadow-2xl p-12 md:p-20 text-center border border-neutral-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neutral-50 -mr-32 -mt-32 rounded-full blur-3xl" />
            
            <p className="text-[11px] uppercase tracking-[0.6em] text-neutral-400 mb-6 font-bold">Campaign Entry Rate</p>
            <h2 className="text-6xl md:text-7xl  mb-12 italic tracking-tighter">
              PKR {deal.price || 0}.00
            </h2>

            <Button
              onClick={handleAddDealToCart}
              disabled={products.length === 0 || loading}
              className={cn(
                "h-20 px-16 rounded-none uppercase tracking-[0.3em] text-[11px] font-bold transition-all duration-700 shadow-2xl relative z-10",
                addedItems.all
                  ? "bg-green-600 text-white"
                  : "bg-black text-white hover:bg-neutral-800 hover:scale-[1.02]",
              )}
            >
              {addedItems.all ? (
                <>
                  <Check className="w-5 h-5 mr-3" />
                  Added to Cart
                </>
              ) : loading && deal ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5 mr-4" />
                  Add to Cart
                </>
              )}
            </Button>

            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mt-10">
              Includes {products.length} artisanal fragrances
            </p>
         </div>
      </div>

      {/* Products Selection */}
      <section className="py-40 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 mb-32 items-end">
          <div className="lg:col-span-8">
            <h2 className="text-4xl md:text-5xl  uppercase tracking-tighter mb-8 decoration-neutral-200 underline underline-offset-[16px]">
              Harmonious <br /> Resonance
            </h2>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-500 font-medium leading-relaxed max-w-xl">
              Each component of the {deal.name} has been selected for its unique vibration and contribution to the overall sensory narrative.
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <Button
              onClick={() => router.push("/deals")}
              variant="ghost"
              className="text-[11px] uppercase tracking-[0.4em] px-0 hover:bg-transparent text-neutral-400 hover:text-black transition-colors font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-4" />
              All Campaigns
            </Button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-40 text-center border border-dashed border-neutral-100 italic">
            <Sparkles className="w-8 h-8 text-neutral-100 mx-auto mb-6" />
            <p className="text-[11px] uppercase tracking-widest text-neutral-400 font-bold">
              The collection is currently being assembled...
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 md:gap-24">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative">
                  <div className="relative aspect-[3/4] overflow-hidden bg-white mb-8 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                    <img
                      src={
                        product.image.includes("/upload/")
                          ? product.image.replace(
                              "/upload/",
                              "/upload/f_auto,q_auto/",
                            )
                          : product.image
                      }
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    
                    <div className="absolute top-6 right-6">
                       <div className="bg-white/80 backdrop-blur-md px-4 py-2 border border-neutral-100">
                          <span className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Featured</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-400 font-bold">
                      {product.category}
                    </p>
                    <Link href={`/product/${product.id}`} className="block">
                      <h3 className="text-2xl  hover:text-neutral-500 transition-colors uppercase tracking-tight">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="h-px w-8 bg-neutral-200" />
                    <div className="space-y-3">
                      <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-1">Included Sizes</p>
                      <div className="flex flex-wrap gap-2">
                        {(deal?.productSizes?.[product.id] || product.sizes || []).map(size => (
                          <span key={size} className="px-3 py-1 bg-neutral-50 border border-neutral-100 text-[8px] uppercase tracking-widest font-bold text-neutral-600 rounded-full">
                            {size}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Campaign Story Section */}
      <section className="bg-white py-40 px-6 border-y border-neutral-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/linen.png')]" />
        
        <div className="max-w-4xl mx-auto text-center space-y-16 relative z-10">
          <Badge className="bg-neutral-50 text-neutral-400 hover:bg-neutral-100 border-none px-6 py-2 text-[10px] uppercase tracking-[0.4em] font-bold">
            The Philosophy
          </Badge>
          <h3 className="text-4xl md:text-5xl  italic leading-tight tracking-tight text-neutral-800">
            "Fragrance is the most intense form of memory. Our campaigns are curated to help you create unforgettable ones."
          </h3>
          <div className="flex flex-col items-center gap-8">
            <div className="h-20 w-px bg-neutral-200" />
            <Link href="/deals">
               <Button
                 variant="outline"
                 className="rounded-none h-16 px-16 text-[10px] uppercase tracking-[0.5em] font-bold border-neutral-200 hover:bg-black hover:text-white transition-all shadow-xl"
               >
                 View All Campaigns
               </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Minimal Card component since it's locally used
const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn("bg-white border text-card-foreground shadow-sm", className)}
  >
    {children}
  </div>
);
