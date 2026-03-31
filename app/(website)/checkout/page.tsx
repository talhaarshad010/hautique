'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Input, Textarea, Card } from '@/components/ui';
import { products } from '@/lib/mock-data';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  // Mock cart summary
  const cartItems = [
    { ...products[0], quantity: 1 },
    { ...products[1], quantity: 2 },
  ];
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = 15;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <CheckCircle2 className="w-20 h-20 text-black mb-8 mx-auto" />
          <h1 className="text-4xl font-serif mb-4">Order Placed Successfully</h1>
          <p className="text-neutral-500 mb-10 max-w-md">
            Thank you for choosing Hautique. Your order #ORD-7721 has been received and is being processed.
          </p>
          <Link href="/">
            <Button size="lg">Return to Home</Button>
          </Link>
        </motion.div>
      </div>
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
        <Link href="/cart" className="hover:opacity-60 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-4xl font-serif">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Shipping Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <section>
            <h2 className="text-xl font-serif mb-6 uppercase tracking-widest text-neutral-400">Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold">Full Name *</label>
                <Input required placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold">Email Address *</label>
                <Input required type="email" placeholder="john@example.com" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest font-bold">Phone Number *</label>
                <Input required type="tel" placeholder="+1 (555) 000-0000" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif mb-6 uppercase tracking-widest text-neutral-400">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold">Address</label>
                <Input placeholder="123 Luxury Lane" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold">City</label>
                  <Input placeholder="New York" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold">Postal Code</label>
                  <Input placeholder="10001" />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif mb-6 uppercase tracking-widest text-neutral-400">Additional Information</h2>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold">Order Notes (Optional)</label>
              <Textarea placeholder="Special instructions for delivery..." />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif mb-6 uppercase tracking-widest text-neutral-400">Payment Method</h2>
            <div className="p-6 border border-black bg-neutral-50 flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full border-4 border-black" />
                <span className="font-medium">Cash on Delivery (COD)</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">Standard</span>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold">Coupon Code</label>
              <div className="flex gap-2">
                <Input placeholder="Enter code (e.g. HAUTIQUE10)" />
                <Button variant="outline" type="button" className="shrink-0">Apply</Button>
              </div>
            </div>
          </section>

          <Button type="submit" size="lg" className="w-full">Place Order</Button>
        </form>

        {/* Order Summary */}
        <div className="w-full">
          <Card className="sticky top-32 bg-neutral-50 border-none">
            <h2 className="text-xl font-serif mb-8 border-b border-border pb-4">Your Order</h2>
            <div className="space-y-6 mb-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-white border border-border overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-serif">{item.name}</h3>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{item.category}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium">${item.price * item.quantity}.00</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span>${subtotal}.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span>${shipping}.00</span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total}.00</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white border border-border text-[10px] leading-relaxed text-neutral-500 uppercase tracking-widest text-center">
              By placing your order, you agree to Hautique&apos;s Terms of Service and Privacy Policy.
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
