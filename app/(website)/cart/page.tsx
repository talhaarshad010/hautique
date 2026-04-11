'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card } from '@/components/ui';
import { products } from '@/lib/mock-data';
import { motion } from 'motion/react';
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [shipping, setShipping] = React.useState<number>(0);

  React.useEffect(() => {
    const settingsRef = ref(database, 'settings/shippingFee');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (typeof data === 'number') {
        setShipping(data);
      }
    });

    return () => unsubscribe();
  }, []);
  
  const total = cartTotal + shipping;

  if (cartItems.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center"
      >
        <ShoppingBag className="w-16 h-16 text-neutral-200 mb-6" />
        <h1 className="text-3xl font-serif mb-4">Your cart is empty</h1>
        <p className="text-neutral-500 mb-8 max-w-md">Looks like you haven&apos;t added any fragrances to your collection yet.</p>
        <Link href="/shop">
          <Button size="lg">Continue Shopping</Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-12">
        <Link href="/shop" className="hover:opacity-60 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-4xl font-serif">Shopping Cart</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3 space-y-6">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-6 p-6 bg-white border border-border group">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-neutral-100 overflow-hidden">
                <img
                  src={item.image.includes('/upload/') ? item.image.replace('/upload/', '/upload/f_auto,q_auto/') : item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-grow flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-neutral-400 mb-1 block">{item.category}</span>
                    <h3 className="text-lg font-serif">{item.name}</h3>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.selectedSize)}
                    className="text-neutral-400 hover:text-black transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex justify-between items-end">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1, item.selectedSize)}
                      className="p-2 hover:bg-neutral-100 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1, item.selectedSize)}
                      className="p-2 hover:bg-neutral-100 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-medium">PKR {item.price * item.quantity}.00</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="w-full lg:w-1/3">
          <Card className="sticky top-32">
            <h2 className="text-xl font-serif mb-8 border-b border-border pb-4">Order Summary</h2>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span>PKR {cartTotal}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span>PKR {shipping}.00</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>PKR {total}.00</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button size="lg" className="w-full">Proceed to Checkout</Button>
            </Link>
            <p className="text-[10px] text-center text-neutral-400 mt-6 uppercase tracking-widest">
              Complimentary samples with every order
            </p>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
