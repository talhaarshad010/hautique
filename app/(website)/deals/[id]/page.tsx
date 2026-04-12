'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { type Deal, type Product } from '@/lib/mock-data';
import { Button, cn } from '@/components/ui';
import { 
  Calendar, 
  Tag, 
  ArrowLeft, 
  Loader2, 
  ShoppingCart, 
  Plus, 
  Check,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  
  const [deal, setDeal] = React.useState<Deal | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [addedItems, setAddedItems] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    if (!id) return;

    const dealRef = ref(database, `deals/${id}`);
    const unsubscribeDeal = onValue(dealRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDeal({ id: id as string, ...data });
        
        // Fetch products once deal is loaded
        if (data.productIds && data.productIds.length > 0) {
          const productsRef = ref(database, 'products');
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
      brand: 'Hautique Campaign',
      price: deal.price || 0,
      category: 'Deals',
      image: deal.image,
      description: deal.subtextText,
      sizes: []
    };
    
    addToCart(dealAsProduct, 1);
    
    setAddedItems(prev => ({ ...prev, all: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, all: false }));
      setLoading(false);
    }, 1500);
  };

  if (loading && !deal) {
    return (
      <div className="pt-32 pb-24 px-6 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-200" />
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold italic">Unlocking Exclusive Campaign...</p>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="pt-40 pb-24 px-6 text-center max-w-xl mx-auto">
        <Sparkles className="w-12 h-12 text-neutral-200 mx-auto mb-6" />
        <h2 className="text-3xl  mb-4 uppercase tracking-tight">Campaign Expired</h2>
        <p className="text-neutral-500 text-sm italic mb-12">This collection is no longer available or the link has changed.</p>
        <Button onClick={() => router.push('/deals')} variant="outline" className="text-[10px] uppercase tracking-widest px-8">
          Back to Collections
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Dynamic Hero Section */}
      <section className="relative h-[45vh] sm:h-[55vh] md:h-[70vh] w-full bg-white overflow-hidden">
        <div className="absolute inset-0 pt-24 md:pt-0 z-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            <img 
              src={deal.image.includes('/upload/') ? deal.image.replace('/upload/', '/upload/f_auto,q_auto/') : deal.image} 
              alt={deal.name}
              className="w-full h-full object-contain md:object-cover grayscale brightness-[0.8] md:brightness-[0.7]"
            />
            <div className="absolute inset-0 bg-black/20 md:bg-black/20" />
          </div>
        </div>
        
        <div className="relative z-10 text-center text-white px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-1 border border-white/30 backdrop-blur-md rounded-full text-[10px] uppercase tracking-[0.4em] mb-8 font-bold text-white">
              Exclusive Campaign
            </span>
            <h1 className="text-5xl md:text-8xl  mb-8 uppercase tracking-tighter leading-none text-white">
              {deal.name}
            </h1>
            <p className="text-lg md:text-xl font-light tracking-widest uppercase mb-12 text-white/80">
              {deal.subtextText}
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-8 text-[11px] uppercase tracking-widest">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-white/60" />
                <span className="text-white">{deal.durationRange}</span>
              </div>
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-white/60" />
                <span className="text-white">Special Pricing Enabled</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Price & Action Context */}
      <div className="py-16 border-b border-neutral-100 bg-neutral-50 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-8">
           <div>
             <p className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 mb-2 font-bold">Campaign Rate</p>
             <p className="text-5xl  leading-none italic">PKR {deal.price || 0}.00</p>
           </div>
           
           <Button 
             onClick={handleAddDealToCart}
             disabled={products.length === 0 || loading}
             className={cn(
               "h-16 px-16 rounded-none uppercase tracking-widest text-[10px] font-bold transition-all duration-500",
               addedItems.all
                 ? "bg-green-600 text-white" 
                 : "bg-black text-white hover:bg-neutral-800"
             )}
           >
             {addedItems.all ? (
               <>
                 <Check className="w-4 h-4 mr-3" />
                 Campaign Added to Atelier
               </>
             ) : loading && deal ? (
               <Loader2 className="w-4 h-4 animate-spin" />
             ) : (
               <>
                 <ShoppingCart className="w-4 h-4 mr-3" />
                 Add Entire Deal to Cart
               </>
             )}
           </Button>
           
           <p className="text-[9px] uppercase tracking-widest text-neutral-300 font-bold">
             Includes {products.length} exclusive fragrances
           </p>
        </div>
      </div>

      {/* Products Selection */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-md">
            <h2 className="text-3xl  uppercase tracking-tight mb-4 italic">Featured Elements</h2>
            <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold leading-relaxed">
              Fragrance components integrated into the {deal.name}. Selected for their harmonious resonance.
            </p>
          </div>
          <Button 
            onClick={() => router.push('/deals')} 
            variant="ghost" 
            className="text-[10px] uppercase tracking-widest px-0 hover:bg-transparent"
          >
            <ArrowLeft className="w-4 h-4 mr-3" />
            Back to Collections
          </Button>
        </div>

        {products.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-neutral-100 rounded">
            <p className="text-[10px] uppercase tracking-widest text-neutral-300 font-bold">Collection currently under curation...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                {/* Product Card */}
                <div className="bg-transparent overflow-hidden group/card relative">
                  <div className="relative aspect-[4/5] bg-neutral-100 overflow-hidden mb-6">
                    <img 
                      src={product.image.includes('/upload/') ? product.image.replace('/upload/', '/upload/f_auto,q_auto/') : product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-1000 scale-100 group-hover/card:scale-110 grayscale group-hover/card:grayscale-0"
                    />
                    
                    <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                       <span className="text-[8px] uppercase tracking-widest font-bold text-black">Featured in Deal</span>
                    </div>

                    <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/5 transition-colors pointer-events-none" />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold">{product.category}</p>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="text-xl  hover:underline underline-offset-8 decoration-neutral-100">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-lg  italic text-neutral-400">PKR {product.price}.00 (Ref)</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Campaign Footer Section */}
      <section className="bg-neutral-50 py-24 px-6 border-t border-neutral-100">
        <div className="max-w-4xl mx-auto text-center space-y-12">
           <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 font-bold mb-4 block underline underline-offset-8">Campaign Details</span>
           <h3 className="text-3xl md:text-4xl  italic">Limited-time fragrance explorations, available only while seasonal allocations remain.</h3>
           <Link href="/deals">
             <Button variant="outline" className="rounded-none h-14 px-12 text-[10px] uppercase tracking-widest font-bold mt-8">
                Explore Other Campaigns
             </Button>
           </Link>
        </div>
      </section>
    </div>
  );
}

// Minimal Card component since it's locally used
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-white border text-card-foreground shadow-sm", className)}>
    {children}
  </div>
);
