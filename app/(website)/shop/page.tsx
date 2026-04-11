'use client';

import * as React from 'react';
import { type Product } from '@/lib/mock-data';
import { Button, Input, cn } from '@/components/ui';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Search, ShoppingCart, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useCart } from '@/context/CartContext';

const ProductCard = ({ product, addToCart }: { product: Product; addToCart: (product: Product) => void }) => {
  const [added, setAdded] = React.useState(false);

  const handleQuickAdd = () => {
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      className="group relative flex flex-col bg-white border border-neutral-100 overflow-hidden"
    >
      <Link href={`/product/${product.id}`} className="relative block aspect-[3/4] overflow-hidden bg-neutral-50">
        <img
          src={product.image.includes('/upload/') ? product.image.replace('/upload/', '/upload/f_auto,q_auto/') : product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </Link>
      <div className="p-8 flex flex-col items-center text-center">
        <span className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 mb-2 font-bold">{product.category}</span>
        <h3 className="text-lg font-serif mb-2 group-hover:underline underline-offset-8 decoration-neutral-300">{product.name}</h3>
        <p className="text-sm font-serif tracking-widest text-neutral-500 mb-8">PKR {product.price}.00</p>
        <Button 
          variant={added ? "primary" : "outline"} 
          size="sm" 
          onClick={handleQuickAdd}
          className={cn(
            "w-full rounded-none border-neutral-200 transition-all text-[10px] uppercase tracking-widest h-12 font-bold",
            !added && "group-hover:bg-black group-hover:text-white group-hover:border-black",
            added && "bg-black text-white border-black"
          )}
        >
          {added ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Just Added
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Quick Add
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

function ShopContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  const { addToCart } = useCart();

  React.useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedProducts = Object.entries(data).map(([id, product]: [string, any]) => ({
          id,
          ...product
        }));
        setProductsList(formattedProducts);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = productsList.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'For Her', 'For Him', 'Testers', 'Deals'];

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-7xl font-serif mb-8 leading-tight">The Boutique</h1>
          <p className="text-neutral-500 leading-relaxed max-w-md">
            Explore our complete collection of niche and designer fragrances. Filter by category or search for your signature scent.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 group-focus-within:text-black transition-colors" />
            <Input 
              type="text" 
              placeholder="Search fragrances..." 
              className="pl-10 w-full sm:w-[300px] border-neutral-100 rounded-none focus-visible:ring-black placeholder:text-neutral-300 h-12 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-16 border-b border-neutral-100 pb-8">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "text-[10px] uppercase tracking-[0.2em] font-bold px-6 py-2 transition-all",
              selectedCategory === category 
                ? "bg-black text-white" 
                : "text-neutral-400 hover:text-black hover:bg-neutral-50"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-neutral-200" />
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Opening the vault...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-32 bg-neutral-50 border border-dashed border-neutral-200">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-2">No matching fragrances found</p>
          <p className="text-neutral-300 text-sm italic">Try adjusting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <React.Suspense fallback={
      <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-200" />
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mt-4">Opening the vault...</p>
      </div>
    }>
      <ShopContent />
    </React.Suspense>
  );
}

