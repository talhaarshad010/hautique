'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { Button, Badge, Input, cn } from '@/components/ui';
import { type Product } from '@/lib/mock-data';
import { ArrowRight, ShoppingCart, Loader2 } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

const Hero = ({ dynamicSlides }: { dynamicSlides?: any[] }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const defaultSlides = [
    {
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=1920',
      tag: 'Exquisite Fragrances',
      title: 'The Art of \n Invisible Luxury',
    },
    {
      image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=1920',
      tag: 'New Collection',
      title: 'Elegance in \n Every Drop',
    },
    {
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=1920',
      tag: 'Limited Edition',
      title: 'Scent of \n Distinction',
    },
  ];

  const slides = dynamicSlides && dynamicSlides.length > 0 ? dynamicSlides : defaultSlides;

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative h-[70vh] md:h-[90vh] w-full overflow-hidden bg-neutral-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <Image
            src={slides[currentSlide].image}
            alt="Luxury Perfume"
            fill
            className="object-cover brightness-75 transition-transform duration-[10000ms] scale-110"
            priority
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white bg-black/20">
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
              className="text-5xl md:text-8xl font-serif mb-8 max-w-4xl leading-tight whitespace-pre-line"
            >
              {slides[currentSlide].title}
            </motion.h1>
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
              'w-12 h-0.5 transition-all duration-500',
              currentSlide === i ? 'bg-white' : 'bg-white/30'
            )}
          />
        ))}
      </div>
    </section>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group relative flex flex-col bg-white border border-neutral-100 overflow-hidden"
    >
      <Link href={`/product/${product.id}`} className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          
        />
        {product.isNew && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-white/90 text-black border-none backdrop-blur-sm px-3 py-1 rounded-none text-[10px] tracking-widest uppercase font-bold">New</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>
      <div className="p-8 flex flex-col items-center text-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2 font-bold">{product.category}</span>
        <h3 className="text-xl font-serif mb-2 group-hover:underline underline-offset-8 transition-all">{product.name}</h3>
        <p className="text-sm font-serif tracking-widest mb-8 text-neutral-500">PKR {product.price}.00</p>
        <Button variant="outline" size="sm" className="w-full rounded-none border-neutral-200 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all text-[10px] uppercase tracking-widest h-12 font-bold">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};

const ProductGrid = ({ title, products, loading }: { title: string; products: Product[]; loading?: boolean }) => {
  if (loading) {
    return (
      <section className="py-24 px-6 md:px-12">
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 px-6 md:px-12 max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-end mb-16 border-b border-neutral-100 pb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 mb-4 block font-bold">Curation</span>
          <h2 className="text-4xl md:text-5xl font-serif">{title}</h2>
        </div>
        <Link href="/shop" className="text-[10px] uppercase tracking-[0.2em] font-bold flex items-center gap-3 hover:gap-5 transition-all group border-b border-black pb-1">
          Explore All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default function HomePage() {
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [heroSlides, setHeroSlides] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Fetch Products
    const productsRef = ref(database, 'products');
    onValue(productsRef, (snapshot) => {
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

    // Fetch Hero Slider
    const sliderRef = ref(database, 'settings/heroSlider');
    onValue(sliderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedSlides = Object.entries(data).map(([id, slide]: [string, any]) => ({
          id,
          ...slide
        })).sort((a, b) => (a.order || 0) - (b.order || 0));
        setHeroSlides(formattedSlides);
      }
    });

    return () => {
      // Logic for cleanup if needed
    };
  }, []);

  const deals = productsList.filter((p) => p.category === 'Deals');
  const testers = productsList.filter((p) => p.category === 'Testers');
  const forHer = productsList.filter((p) => p.category === 'For Her');
  const forHim = productsList.filter((p) => p.category === 'For Him');

  return (
    <div className="pt-0 bg-white">
      <Hero dynamicSlides={heroSlides} />
      <ProductGrid title="Exclusive Deals" products={deals} loading={loading} />
      
      <div className="divide-y divide-neutral-50">
        <ProductGrid title="Try Our Testers" products={testers} loading={loading} />
        <ProductGrid title="For Her" products={forHer} loading={loading} />
        <ProductGrid title="For Him" products={forHim} loading={loading} />
      </div>

      <section className="py-24 border-y border-neutral-100 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 mb-10 font-bold">Newsletter</span>
            <h2 className="text-4xl md:text-5xl font-serif mb-12">Join the Hautique Society</h2>
            <div className="flex w-full max-w-md gap-4">
              <Input placeholder="Enter your email" className="rounded-none border-neutral-100 bg-neutral-50 h-14 text-sm" />
              <Button className="rounded-none h-14 px-10 text-[10px] uppercase tracking-widest font-bold">Join</Button>
            </div>
        </div>
      </section>
    </div>
  );
}
