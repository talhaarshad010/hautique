'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { ShoppingCart, Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Button, Badge, cn } from '@/components/ui';
import { type Product } from '@/lib/mock-data';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

interface ProductDetailsClientProps {
  initialProduct: Product;
  productId: string;
}

export default function ProductDetailsClient({ initialProduct, productId }: ProductDetailsClientProps) {
  const [product, setProduct] = React.useState<Product>(initialProduct);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState<string>(initialProduct.image);
  const [selectedSize, setSelectedSize] = React.useState<string>(initialProduct.sizes?.[0] || '');
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const { addToCart } = useCart();
  const router = useRouter();

  React.useEffect(() => {
    // Sync with real-time data if needed
    const productRef = ref(database, `products/${productId}`);
    const unsubscribe = onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProduct({ id: productId, ...data });
      }
    });

    // Fetch related products
    const allProductsRef = ref(database, 'products');
    onValue(allProductsRef, (allSnapshot) => {
      const allData = allSnapshot.val();
      if (allData) {
        const formatted = Object.entries(allData)
          .map(([id, p]: [string, any]) => ({ id, ...p }))
          .filter((p) => p.category === initialProduct.category && p.id !== productId)
          .slice(0, 4);
        setRelatedProducts(formatted);
      }
    }, { onlyOnce: true });

    return () => unsubscribe();
  }, [productId, initialProduct.category]);


  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-16 mb-24">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square bg-neutral-100 border border-border overflow-hidden"
          >
            <img
              src={selectedImage.includes('/upload/') ? selectedImage.replace('/upload/', '/upload/f_auto,q_auto/') : selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {product.isNew && <Badge className="absolute top-6 left-6">New Arrival</Badge>}
          </motion.div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[product.image, ...(product.gallery || [])].map((imgUrl, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative flex-shrink-0 w-24 h-24 bg-neutral-100 border transition-all cursor-pointer overflow-hidden ${
                  selectedImage === imgUrl ? 'border-black opacity-100' : 'border-border opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={imgUrl.includes('/upload/') ? imgUrl.replace('/upload/', '/upload/f_auto,q_auto/') : imgUrl}
                  alt={`Thumbnail ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-4 block">{product.brand}</span>
            <h1 className="text-4xl md:text-5xl font-serif mb-4 leading-tight">{product.name}</h1>
            <p className="text-2xl font-medium">${product.price}.00</p>
          </div>

          <p className="text-neutral-600 leading-relaxed mb-10 border-b border-border pb-10">
            {product.description}
          </p>

          <div className="space-y-8 mb-12">
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-widest font-bold">Select Size</span>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all border",
                        selectedSize === size 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-neutral-400 border-neutral-100 hover:border-black hover:text-black"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-6">
              <span className="text-xs uppercase tracking-widest font-bold">Quantity</span>
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-neutral-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-neutral-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="flex-grow"
                onClick={() => {
                  addToCart(product, quantity, selectedSize);
                  router.push('/cart');
                }}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Add to Cart
              </Button>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-14 h-14 p-0 transition-all duration-300",
                    isWishlisted ? "bg-red-50 border-red-100 text-red-500" : "hover:border-black"
                  )}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-border">
            <div className="flex flex-col items-center text-center gap-3">
              <Truck className="w-6 h-6 text-neutral-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <RotateCcw className="w-6 h-6 text-neutral-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold">30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <ShieldCheck className="w-6 h-6 text-neutral-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="pt-24 border-t border-border">
          <h2 className="text-3xl font-serif mb-12">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -5 }}
                className="group flex flex-col bg-white border border-border overflow-hidden"
              >
                <a href={`/product/${p.id}`} className="relative aspect-square overflow-hidden">
                  <img
                    src={p.image.includes('/upload/') ? p.image.replace('/upload/', '/upload/f_auto,q_auto/') : p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </a>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-serif mb-2">{p.name}</h3>
                  <p className="text-sm font-medium">${p.price}.00</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
