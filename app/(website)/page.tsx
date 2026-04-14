"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Button, Badge, Input, cn, Skeleton } from "@/components/ui";
import { type Product, type Deal } from "@/lib/mock-data";
import { ArrowRight, ShoppingCart, Loader2 } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { Check } from "lucide-react";

const Hero = ({ dynamicSlides, loading }: { dynamicSlides?: any[], loading?: boolean }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = dynamicSlides || [];

  React.useEffect(() => {
    if (slides.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [slides.length]);

  if (loading || slides.length === 0) {
    return (
      <section className="relative h-[45vh] sm:h-[65vh] md:h-[80vh] w-full bg-neutral-50 overflow-hidden">
        <Skeleton className="w-full h-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <Skeleton className="h-4 w-32 mb-6" />
          <Skeleton className="h-12 md:h-20 w-3/4 max-w-2xl mb-8" />
          <Skeleton className="h-1 w-48" />
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[45vh] sm:h-[65vh] md:h-[80vh] w-full bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="relative w-full h-full">
            {/* Desktop Image */}
            <Image
              src={slides[currentSlide].image}
              alt="Luxury Perfume"
              fill
              className="hidden lg:block object-cover brightness-95 md:brightness-90"
              priority
            />
            {/* Tablet Image */}
            <Image
              src={slides[currentSlide].imageTablet || slides[currentSlide].image}
              alt="Luxury Perfume"
              fill
              className="hidden md:block lg:hidden object-cover brightness-95 md:brightness-90"
              priority
            />
            {/* Mobile Image */}
            <Image
              src={slides[currentSlide].imageMobile || slides[currentSlide].image}
              alt="Luxury Perfume"
              fill
              className="block md:hidden object-cover brightness-95 md:brightness-90"
              priority
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white bg-black/10 md:bg-black/20">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-xs md:text-sm uppercase tracking-[0.3em] mb-6 font-medium"
              >
                {slides[currentSlide].tag}
              </motion.span>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-5xl md:text-8xl  mb-8 max-w-4xl leading-tight whitespace-pre-line"
              >
                {slides[currentSlide].title}
              </motion.h1>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slider Indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-4 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={cn(
              "w-12 h-0.5 transition-all duration-500",
              currentSlide === i ? "bg-white" : "bg-white/30",
            )}
          />
        ))}
      </div>
    </section>
  );
};

const ProductCard = ({ 
  product, 
  href 
}: { 
  product: Product;
  href?: string;
}) => {
  const { addToCart } = useCart();
  const [adding, setAdding] = React.useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    setAdding(true);
    addToCart(product, 1);
    setTimeout(() => setAdding(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group relative flex flex-col bg-white border border-neutral-100 overflow-hidden"
    >
      <Link
        href={href || `/product/${product.id}`}
        className="relative aspect-[4/5] overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110 w-full"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        {product.isNew && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/90 text-black border-none backdrop-blur-sm px-3 py-1 rounded-none text-[10px] tracking-widest uppercase font-bold">
              New
            </Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>
      <div className="p-8 flex flex-col items-center text-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2 font-bold">
          {product.category}
        </span>
        <h3 className="text-xl  mb-2 group-hover:underline underline-offset-8 transition-all">
          {product.name}
        </h3>
        <p className="text-sm  tracking-widest mb-8 text-neutral-500">
          PKR {product.price}.00
        </p>
        <Button
          onClick={handleAdd}
          variant={adding ? "default" : "outline"}
          size="sm"
          className={cn(
            "w-full rounded-none border-neutral-200 transition-all text-[10px] uppercase tracking-widest h-12 font-bold",
            adding ? "bg-green-600 border-green-600 text-white" : "group-hover:bg-black group-hover:text-white group-hover:border-black"
          )}
        >
          {adding ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Added
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
};

const ProductGrid = ({
  title,
  exploreUrl,
  products,
  loading,
}: {
  title: string;
  exploreUrl?: string;
  products: (Product & { href?: string })[];
  loading?: boolean;
}) => {
  if (loading) {
    return (
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-end mb-16 border-b border-neutral-100 pb-8">
          <div>
            <Skeleton className="h-3 w-20 mb-4" />
            <Skeleton className="h-10 w-48" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-6">
              <Skeleton className="aspect-[4/5] w-full" />
              <div className="space-y-3 flex flex-col items-center">
                <Skeleton className="h-3 w-20 mx-auto" />
                <Skeleton className="h-6 w-40 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-12 w-full mt-4" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-16 border-b border-neutral-100 pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-4 block font-bold">
            Curation
          </span>
          <h2 className="text-4xl md:text-5xl ">{title}</h2>
        </div>
        <Link
          href={exploreUrl || "/shop"}
          className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-3 hover:gap-5 transition-all group border-b border-black pb-1"
        >
          Explore All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} href={product.href} />
        ))}
      </div>
    </section>
  );
};

export default function HomePage() {
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [dealsList, setDealsList] = React.useState<Deal[]>([]);
  const [heroSlides, setHeroSlides] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Fetch Products
    const productsRef = ref(database, "products");
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedProducts = Object.entries(data).map(
          ([id, product]: [string, any]) => ({
            id,
            ...product,
          }),
        );
        setProductsList(formattedProducts);
      }
      setLoading(false);
    });

    // Fetch Deals
    const dealsRef = ref(database, "deals");
    onValue(dealsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedDeals = Object.entries(data).map(
          ([id, deal]: [string, any]) => ({
            id,
            ...deal,
          }),
        );
        setDealsList(formattedDeals);
      }
    });

    // Fetch Hero Slider
    const sliderRef = ref(database, "settings/heroSlider");
    onValue(sliderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedSlides = Object.entries(data)
          .map(([id, slide]: [string, any]) => ({
            id,
            ...slide,
          }))
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        setHeroSlides(formattedSlides);
      }
    });

    return () => {
      // Logic for cleanup if needed
    };
  }, []);

  const productDeals = productsList.filter((p) => p.category === "Deals");
  const dynamicDeals = dealsList.map(d => ({
    id: d.id,
    name: d.name,
    brand: d.subtextText || 'Deal Collection',
    price: d.price || 0,
    category: 'Deals' as const,
    image: d.image,
    description: d.subtextText || '',
    href: `/deals/${d.id}`
  }));
  const deals = [...dynamicDeals, ...productDeals];
  
  const testers = productsList.filter((p) => p.category === "Testers");
  const forHer = productsList.filter((p) => p.category === "For Her");
  const forHim = productsList.filter((p) => p.category === "For Him");
  const unisex = productsList.filter((p) => p.category === "Unisex");

  return (
    <div className="pt-0 bg-white">
      <Hero dynamicSlides={heroSlides} loading={loading} />

      <div className="divide-y divide-neutral-50">
        <ProductGrid
          title="Try Our Testers"
          products={testers}
          loading={loading}
          exploreUrl="/testers"
        />
        <ProductGrid 
          title="For Her" 
          products={forHer} 
          loading={loading} 
          exploreUrl="/for-her" 
        />
        <ProductGrid 
          title="For Him" 
          products={forHim} 
          loading={loading} 
          exploreUrl="/for-him" 
        />
        <ProductGrid 
          title="Unisex" 
          products={unisex} 
          loading={loading} 
          exploreUrl="/unisex" 
        />
        <ProductGrid 
          title="Exclusive Deals" 
          products={deals} 
          loading={loading} 
          exploreUrl="/deals"
        />
      </div>
    </div>
  );
}
