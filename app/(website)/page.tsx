'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Button, Badge, cn } from '@/components/ui';
import { products, type Product } from '@/lib/mock-data';
import { ArrowRight, ShoppingCart } from 'lucide-react';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const slides = [
    {
      image: 'https://picsum.photos/seed/hautique-hero-1/1920/1080',
      tag: 'Exquisite Fragrances',
      title: 'The Art of \n Invisible Luxury',
    },
    {
      image: 'https://picsum.photos/seed/hautique-hero-2/1920/1080',
      tag: 'New Collection',
      title: 'Elegance in \n Every Drop',
    },
    {
      image: 'https://picsum.photos/seed/hautique-hero-3/1920/1080',
      tag: 'Limited Edition',
      title: 'Scent of \n Distinction',
    },
  ];

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
            className="object-cover brightness-75"
            priority
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 text-white">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Button size="lg" className="bg-white text-black hover:bg-neutral-200 border-none">
                Shop Collection
              </Button>
            </motion.div>
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
              'w-12 h-1 transition-all duration-500',
              currentSlide === i ? 'bg-white' : 'bg-white/30'
            )}
          />
        ))}
      </div>
    </section>
  );
};

import { AnimatePresence } from 'motion/react';

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <motion.div
      whileHover={{ y: -10 }}
      className="group relative flex flex-col bg-white border border-border overflow-hidden"
    >
      <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        {product.isNew && (
          <div className="absolute top-4 left-4">
            <Badge>New Arrival</Badge>
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>
      <div className="p-6 flex flex-col items-center text-center">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400 mb-2">{product.category}</span>
        <h3 className="text-lg font-serif mb-2 group-hover:underline underline-offset-4">{product.name}</h3>
        <p className="text-sm font-medium mb-6">${product.price}.00</p>
        <Button variant="outline" size="sm" className="w-full group-hover:bg-black group-hover:text-white">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};

const ProductGrid = ({ title, products }: { title: string; products: Product[] }) => {
  return (
    <section className="py-24 px-6 md:px-12">
      <div className="flex justify-between items-end mb-12 border-b border-border pb-6">
        <h2 className="text-3xl md:text-4xl font-serif">{title}</h2>
        <Link href="/shop" className="text-xs uppercase tracking-widest flex items-center gap-2 hover:opacity-60 transition-opacity">
          View All <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default function HomePage() {
  const deals = products.filter((p) => p.category === 'Deals');
  const testers = products.filter((p) => p.category === 'Testers');
  const forHer = products.filter((p) => p.category === 'For Her');
  const forHim = products.filter((p) => p.category === 'For Him');

  return (
    <div className="pt-0">
      <Hero />
      <ProductGrid title="Exclusive Deals" products={deals} />
      <section className="bg-neutral-50 py-24 px-6 md:px-12 flex flex-col md:flex-row items-center gap-12">
        <div className="w-full md:w-1/2 relative aspect-[4/5] overflow-hidden">
          <Image
            src="https://picsum.photos/seed/hautique-story/800/1000"
            alt="Perfume Story"
            fill
            className="object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-start max-w-xl">
          <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-6">Our Heritage</span>
          <h2 className="text-4xl md:text-6xl font-serif mb-8 leading-tight">Crafted with Passion, Worn with Elegance</h2>
          <p className="text-neutral-600 leading-relaxed mb-10">
            Hautique was born from a desire to create fragrances that transcend time. Each bottle tells a story of rare ingredients sourced from the corners of the globe, blended with meticulous precision in our Parisian atelier.
          </p>
          <Button variant="outline" size="lg">Discover Our Story</Button>
        </div>
      </section>
      <ProductGrid title="Try Our Testers" products={testers} />
      <ProductGrid title="For Her" products={forHer} />
      <ProductGrid title="For Him" products={forHim} />
    </div>
  );
}
