'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

const FAQItem = ({ question, answer, isOpen, onToggle }: { question: string, answer: string, isOpen: boolean, onToggle: () => void }) => (
  <div className="border-b border-neutral-100 last:border-0 py-6 md:py-8">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between text-left group"
    >
      <h3 className="text-sm md:text-lg  tracking-tight pr-8">{question}</h3>
      <div className={cn(
        "w-8 h-8 rounded-full border border-neutral-100 flex items-center justify-center transition-all duration-300 group-hover:border-black",
        isOpen ? "bg-black text-white border-black" : "bg-white text-neutral-400"
      )}>
        {isOpen ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          className="overflow-hidden"
        >
          <p className="pt-6 pb-2 text-neutral-500 text-[10px] md:text-xs uppercase tracking-widest leading-loose max-w-2xl">
            {answer}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default function FAQPage() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const categories = [
    {
      title: "Products & Fragrance",
      questions: [
        {
          q: "Are Hautique fragrances natural?",
          a: "We use a sophisticated blend of the finest natural extracts and safe aroma-chemicals to achieve depth, longevity, and complexity that nature alone cannot always provide."
        },
        {
          q: "How should I store my perfume?",
          a: "To preserve integrity, store your bottle in a cool, dark place away from direct sunlight and humidity. Avoid keeping fragrances in bathrooms where temperature fluctuates."
        },
        {
          q: "Do you offer samples or testers?",
          a: "Yes, we have a dedicated 'Testers' section on our shop where you can purchase 5ml and 10ml travel sprays to experience our scents before committing to a full size."
        }
      ]
    },
    {
      title: "Ordering & Shipping",
      questions: [
        {
          q: "Can I change my delivery address?",
          a: "If your order has not yet been processed by our warehouse (typically within 2 hours of ordering), we can update your address. Please contact support@hautique.com immediately."
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards, bank transfers, and Cash on Delivery (COD) for domestic orders within Pakistan."
        },
        {
          q: "How can I track my shipment?",
          a: "Once dispatched, you will receive a tracking link via email and WhatsApp. You can also use our 'Track Order' tool on the website with your Order ID."
        }
      ]
    }
  ];

  return (
    <div className="pt-40 pb-24 px-6 md:px-12 max-w-5xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-32"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 block mb-6 font-bold">Concierge</span>
        <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter">Frequently Asked<br />Questions</h1>
      </motion.div>

      <div className="space-y-24">
        {categories.map((category, catIdx) => (
          <div key={catIdx} className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
            <div className="lg:col-span-1">
              <h2 className="text-[10px] uppercase tracking-[0.4em] font-black sticky top-40">{category.title}</h2>
            </div>
            <div className="lg:col-span-2 divide-y divide-neutral-100">
              {category.questions.map((item, qIdx) => {
                const globalIdx = catIdx * 100 + qIdx;
                return (
                  <FAQItem 
                    key={qIdx}
                    question={item.q}
                    answer={item.a}
                    isOpen={openIndex === globalIdx}
                    onToggle={() => setOpenIndex(openIndex === globalIdx ? null : globalIdx)}
                  />
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
