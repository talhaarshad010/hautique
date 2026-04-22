"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Button, Badge, Input, cn, Skeleton } from "@/components/ui";
import { type Product, type Deal } from "@/lib/mock-data";
import { ChevronLeft, ChevronRight, ArrowRight, ShoppingCart, Loader2, Check } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

const Hero = ({
  dynamicSlides,
  loading,
}: {
  dynamicSlides?: any[];
  loading?: boolean;
}) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [direction, setDirection] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  const slides = dynamicSlides || [];

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentSlide((prev) => (prev + newDirection + slides.length) % slides.length);
  };

  React.useEffect(() => {
    if (slides.length > 1 && !isHovered) {
      const timer = setInterval(() => {
        paginate(1);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [slides.length, isHovered]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 1.1,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      scale: 0.9,
    }),
  };

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
    <section 
      className="relative h-[50vh] sm:h-[70vh] md:h-[85vh] w-full bg-neutral-900 overflow-hidden group/slider"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentSlide}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.6 },
            scale: { duration: 0.8 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          <div className="relative w-full h-full">
            {/* Desktop Media */}
            <div className="hidden lg:block absolute inset-0">
              {slides[currentSlide].video ? (
                <video
                  src={slides[currentSlide].video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover brightness-[0.85] transition-transform duration-[10s] ease-linear scale-105"
                />
              ) : (
                <Image
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title || "Luxury Perfume"}
                  fill
                  className="object-cover brightness-[0.85] transition-transform duration-[10s] ease-linear scale-105"
                  priority
                />
              )}
            </div>

            {/* Tablet Media */}
            <div className="hidden md:block lg:hidden absolute inset-0">
              {slides[currentSlide].videoTablet || slides[currentSlide].video ? (
                <video
                  src={slides[currentSlide].videoTablet || slides[currentSlide].video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover brightness-[0.85] scale-105"
                />
              ) : (
                <Image
                  src={slides[currentSlide].imageTablet || slides[currentSlide].image}
                  alt={slides[currentSlide].title || "Luxury Perfume"}
                  fill
                  className="object-cover brightness-[0.85] scale-105"
                  priority
                />
              )}
            </div>

            {/* Mobile Media */}
            <div className="block md:hidden absolute inset-0">
              {slides[currentSlide].videoMobile || slides[currentSlide].video ? (
                <video
                  src={slides[currentSlide].videoMobile || slides[currentSlide].video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover brightness-[0.85] scale-105"
                />
              ) : (
                <Image
                  src={slides[currentSlide].imageMobile || slides[currentSlide].image}
                  alt={slides[currentSlide].title || "Luxury Perfume"}
                  fill
                  className="object-cover brightness-[0.85] scale-105"
                  priority
                />
              )}
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white bg-black/20">
              <div className="max-w-5xl space-y-4 md:space-y-6">
                {slides[currentSlide].tag && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    <span className="inline-block px-4 py-1.5 border border-white/30 backdrop-blur-sm text-[10px] md:text-sm uppercase tracking-[0.4em] font-medium rounded-full mb-2">
                      {slides[currentSlide].tag}
                    </span>
                  </motion.div>
                )}
                
                {slides[currentSlide].title && (
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-light tracking-tight leading-[0.9] whitespace-pre-line"
                  >
                    {slides[currentSlide].title}
                  </motion.h1>
                )}

                {slides[currentSlide].buttonText && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="pt-8"
                  >
                    <Link href={slides[currentSlide].link || "/shop"}>
                      <Button variant="outline" className="bg-white/10 hover:bg-white text-white hover:text-black border-white/50 hover:border-white px-10 py-6 text-xs uppercase tracking-[0.3em] backdrop-blur-md transition-all">
                        {slides[currentSlide].buttonText}
                      </Button>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-x-4 md:inset-x-8 top-1/2 -translate-y-1/2 flex justify-between z-20 pointer-events-none">
        <button
          onClick={(e) => { e.preventDefault(); paginate(-1); }}
          className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-white/20 bg-black/10 hover:bg-white hover:text-black text-white backdrop-blur-sm transition-all pointer-events-auto opacity-0 translate-x-[-20px] group-hover/slider:opacity-100 group-hover/slider:translate-x-0"
        >
          <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
        </button>
        <button
          onClick={(e) => { e.preventDefault(); paginate(1); }}
          className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full border border-white/20 bg-black/10 hover:bg-white hover:text-black text-white backdrop-blur-sm transition-all pointer-events-auto opacity-0 translate-x-[20px] group-hover/slider:opacity-100 group-hover/slider:translate-x-0"
        >
          <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
        </button>
      </div>

      {/* Bottom Indicators & Progress */}
      <div className="absolute bottom-8 md:bottom-12 left-0 w-full px-6 md:px-12 z-20">
        <div className="max-w-7xl mx-auto flex items-end justify-between">
          <div className="flex gap-2 md:gap-4 flex-1 mr-8">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setDirection(i > currentSlide ? 1 : -1);
                  setCurrentSlide(i);
                }}
                className="relative h-1 flex-1 max-w-[100px] overflow-hidden rounded-full bg-white/20"
              >
                {currentSlide === i && (
                  <motion.div
                    className="absolute inset-0 bg-white origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isHovered ? (0) : 1 }}
                    transition={{ 
                      duration: isHovered ? 0 : 6, 
                      ease: "linear",
                      repeat: 0
                    }}
                  />
                )}
                {currentSlide > i && (
                  <div className="absolute inset-0 bg-white" />
                )}
              </button>
            ))}
          </div>
          
          <div className="flex items-baseline gap-1 text-white/50 text-[10px] md:text-sm font-mono tracking-tighter">
            <span className="text-white text-lg md:text-2xl font-light">{(currentSlide + 1).toString().padStart(2, '0')}</span>
            <span>/</span>
            <span>{slides.length.toString().padStart(2, '0')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const ProductCard = ({
  product,
  href,
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
          variant={adding ? "primary" : "outline"}
          size="sm"
          className={cn(
            "w-full rounded-none border-neutral-200 transition-all text-[10px] uppercase tracking-widest h-12 font-bold",
            adding
              ? "bg-green-600 border-green-600 text-white"
              : "group-hover:bg-black group-hover:text-white group-hover:border-black",
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
  const dynamicDeals = dealsList.map((d) => ({
    id: d.id,
    name: d.name,
    brand: d.subtextText || "Deal Collection",
    price: d.price || 0,
    category: "Deals" as const,
    image: d.image,
    description: d.subtextText || "",
    href: `/deals/${d.id}`,
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
