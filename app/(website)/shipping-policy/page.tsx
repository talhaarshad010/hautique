'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { Truck, Clock, ShieldCheck, Globe } from 'lucide-react';

const ShippingSection = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-neutral-50 rounded-full">
        <Icon className="w-5 h-5 text-neutral-400" />
      </div>
      <h2 className="text-[10px] uppercase tracking-[0.3em] font-black">{title}</h2>
    </div>
    <div className="pl-16">
      {children}
    </div>
  </div>
);

export default function ShippingPolicyPage() {
  return (
    <div className="pt-40 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-24"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block mb-6 font-bold">Policy</span>
        <h1 className="text-6xl md:text-7xl font-bold mb-8 tracking-tighter">Shipping &<br />Delivery</h1>
        <p className="text-neutral-500 max-w-xl uppercase tracking-widest text-[10px] leading-loose italic">
          We ensure that every fragrance journey starts with care. Our logistics partners are selected for their commitment to handling luxury goods with extreme precision.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <ShippingSection icon={Truck} title="Domestic Shipping">
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              We are pleased to offer complimentary standard delivery across all cities in Pakistan for all orders.
            </p>
            <ul className="text-[10px] uppercase tracking-widest text-neutral-400 space-y-4 font-bold">
              <li className="flex justify-between border-b border-neutral-100 pb-2">
                <span>Standard Delivery (3-5 Business Days)</span>
                <span className="text-black">COMPLIMENTARY</span>
              </li>
              <li className="flex justify-between border-b border-neutral-100 pb-2">
                <span>Express Delivery (1-2 Business Days)</span>
                <span className="text-black">COMPLIMENTARY</span>
              </li>
              <li className="flex justify-between border-b border-neutral-100 pb-2">
                <span>Nationwide Orders</span>
                <span className="text-black">ALWAYS FREE</span>
              </li>
            </ul>
          </ShippingSection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <ShippingSection icon={Globe} title="International Inquiries">
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              Currently, we primarily serve orders within Pakistan. For international shipping inquiries, please contact our concierge service directly.
            </p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold italic">
              * International shipping rates and customs duties vary by destination.
            </p>
          </ShippingSection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <ShippingSection icon={Clock} title="Processing Times">
            <p className="text-sm text-neutral-600 leading-relaxed">
              Orders placed before 2:00 PM (PKT) are typically dispatched on the same business day. Orders placed on weekends or public holidays will be processed on the next business day.
            </p>
          </ShippingSection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <ShippingSection icon={ShieldCheck} title="Signature & Integrity">
            <p className="text-sm text-neutral-600 leading-relaxed">
              All Hautique shipments are insured and require a signature upon delivery to ensure your fragrance arrives safely in its intended hands. If the parcel appears damaged, please do not accept the delivery and contact us immediately.
            </p>
          </ShippingSection>
        </motion.div>
      </div>

      <div className="mt-32 pt-16 border-t border-neutral-100 text-center">
        <p className="text-[10px] text-neutral-300 uppercase tracking-[0.4em]">Questions regarding your delivery?</p>
        <button className="mt-8 text-[10px] font-bold uppercase tracking-widest hover:text-black transition-colors text-neutral-400 underline underline-offset-8">
          Contact Logistics Concierge
        </button>
      </div>
    </div>
  );
}
