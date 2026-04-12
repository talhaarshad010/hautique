"use client";

import * as React from "react";
import { type Product } from "@/lib/mock-data";
import { Button, cn } from "@/components/ui";
import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

const ProductCard = ({ product }: { product: Product }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group relative flex flex-col bg-white border border-neutral-100 overflow-hidden"
    >
      <Link
        href={`/product/${product.id}`}
        className="relative aspect-[4/5] overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
      </Link>
      <div className="p-8 flex flex-col items-center text-center">
        <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-2 font-bold">
          Category
        </span>
        <h3 className="text-xl  mb-2 group-hover:underline underline-offset-8 transition-all">
          {product.name}
        </h3>
        <p className="text-sm  tracking-widest mb-8 text-neutral-500">
          PKR {product.price}.00
        </p>
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-none border-neutral-200 group-hover:bg-black group-hover:text-white group-hover:border-black transition-all text-[10px] uppercase tracking-widest h-12 font-bold"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
};

export default function ForHimPage() {
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const productsRef = ref(database, "products");
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedProducts = Object.entries(data)
          .map(([id, product]: [string, any]) => ({
            id,
            ...product,
          }))
          .sort(
            (a, b) =>
              new Date(b.createdAt || 0).getTime() -
              new Date(a.createdAt || 0).getTime(),
          );
        setProductsList(
          formattedProducts.filter((p) => p.category === "For Him"),
        );
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto"
    >
      <div className="mb-16">
        <h1 className="text-4xl md:text-6xl uppercase tracking-tighter font-bold mb-4">
          For Him
        </h1>
        <p className="text-xs uppercase tracking-[0.4em] text-neutral-400">
          Masculine Collection
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-200" />
        </div>
      ) : productsList.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
            No fragrances in this collection yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
          {productsList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </motion.div>
  );
}
