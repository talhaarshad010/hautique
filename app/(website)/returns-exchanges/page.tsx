"use client";

import * as React from "react";
import { motion } from "motion/react";
import { RefreshCw, ShieldCheck, Mail, Heart } from "lucide-react";

const PolicyCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <div className="bg-neutral-50 p-8 md:p-12 border-none transition-all duration-300">
    <Icon className="w-8 h-8 text-neutral-300 mb-8" />
    <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">
      {title}
    </h3>
    <p className="text-sm text-neutral-600 leading-relaxed uppercase tracking-widest text-[11px] font-medium">
      {description}
    </p>
  </div>
);

export default function ReturnsExchangesPage() {
  return (
    <div className="pt-40 pb-24 px-6 md:px-12 max-w-6xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-24 text-center"
      >
        <span className="text-[10px] uppercase tracking-[0.5em] text-neutral-400 block mb-6 font-bold">
          Client Care
        </span>
        <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tighter">
          Returns &<br />
          Exchanges
        </h1>
        <p className="text-neutral-500 max-w-2xl mx-auto uppercase tracking-widest text-[10px] leading-loose italic">
          Your satisfaction is the heartbeat of Hautique. While fragrance is an
          intimate purchase, we are here to ensure your experience remains
          exquisite.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-100 border border-neutral-100 p-px">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <PolicyCard
            icon={RefreshCw}
            title="30-Day Window"
            description="We offer a 30-day return window for products that are in their original, unopened, and sealed box. Fragrance bottles that have been unsealed cannot be returned due to health and safety regulations."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <PolicyCard
            icon={ShieldCheck}
            title="Integrity Check"
            description="Our quality control team inspects every return to ensure the product has not been tampered with. If the seal is broken or the packaging is damaged, the return may be denied."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <PolicyCard
            icon={Mail}
            title="How to Start"
            description="To initiate a return, please email our concierge at hautique0724@gmail.com with your Order Number and photos of the sealed packaging. We will provide a pre-paid shipping label."
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <PolicyCard
            icon={Heart}
            title="Faulty Items"
            description="In the rare event that your product arrives damaged or faulty (e.g., a leaking bottle or broken sprayer), please notify us within 48 hours for an immediate complimentary exchange."
          />
        </motion.div>
      </div>

      <section className="mt-32 max-w-4xl mx-auto text-center space-y-12">
        <h2 className="text-3xl font-bold">Refund Process</h2>
        <div className="space-y-8 text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="flex-1">01. Request Approval</div>
            <div className="hidden md:block w-12 h-px bg-neutral-200" />
            <div className="flex-1">02. Ship Back</div>
            <div className="hidden md:block w-12 h-px bg-neutral-200" />
            <div className="flex-1">03. Inspection</div>
            <div className="hidden md:block w-12 h-px bg-neutral-200" />
            <div className="flex-1">04. Refund Issued</div>
          </div>
          <p className="text-neutral-500 italic max-w-2xl mx-auto normal-case tracking-normal py-8 border-t border-neutral-100">
            * Refunds typically take 5-7 business days to appear on your
            statement once the inspection is passed.
          </p>
        </div>
      </section>
    </div>
  );
}
