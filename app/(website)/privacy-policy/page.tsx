"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Shield, Eye, Lock, Database } from "lucide-react";

const PolicySection = ({
  icon: Icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-6">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-neutral-50 rounded-full">
        <Icon className="w-5 h-5 text-neutral-400" />
      </div>
      <h2 className="text-[10px] uppercase tracking-[0.3em] font-black">
        {title}
      </h2>
    </div>
    <div className="pl-16">{children}</div>
  </div>
);

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-16 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-24"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block mb-6 font-bold">
          Legal
        </span>
        <h1 className="text-6xl md:text-7xl font-bold mb-8 tracking-tighter">
          Privacy Policy
        </h1>
        <p className="text-neutral-500 max-w-xl uppercase tracking-widest text-[10px] leading-loose italic">
          At Hautique, your privacy is as exclusive as our fragrances. We are
          committed to protecting the personal data you share with our atelier.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <PolicySection icon={Eye} title="Data Collection">
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              We collect information necessary to process your orders and
              enhance your olfactory journey. This includes:
            </p>
            <ul className="text-[10px] uppercase tracking-widest text-neutral-400 space-y-4 font-bold">
              <li className="flex justify-between border-b border-neutral-100 pb-2">
                <span>Identity & Contact Data</span>
                <span className="text-black">NAME, EMAIL, PHONE</span>
              </li>
              <li className="flex justify-between border-b border-neutral-100 pb-2">
                <span>Transaction & Logistics</span>
                <span className="text-black">ADDRESS, ORDER HISTORY</span>
              </li>
              <li className="flex justify-between border-b border-neutral-100 pb-2">
                <span>Technical & Usage</span>
                <span className="text-black">IP, BROWSER, NAVIGATION</span>
              </li>
            </ul>
          </PolicySection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <PolicySection icon={Database} title="Information Use">
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              Your data allows us to provide a seamless procurement experience.
              We use your information to:
            </p>
            <ul className="text-neutral-500 text-sm space-y-2 list-disc pl-4">
              <li>Process and deliver your signature scent selections.</li>
              <li>Communicate order updates and logistical transitions.</li>
              <li>
                Refine our collection based on anonymous customer preferences.
              </li>
              <li>
                Ensure secure payment processing through verified gateways.
              </li>
            </ul>
          </PolicySection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <PolicySection icon={Lock} title="Data Security">
            <p className="text-sm text-neutral-600 leading-relaxed">
              We implement advanced encryption and security protocols to
              safeguard your information from unauthorized access or disclosure.
              Our digital atelier is monitored continuously to ensure the
              integrity of your personal records.
            </p>
          </PolicySection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <PolicySection icon={Shield} title="Your Rights">
            <p className="text-sm text-neutral-600 leading-relaxed">
              You maintain full authority over your data. You may request
              access, correction, or deletion of your personal information at
              any time by contacting our digital concierge service.
            </p>
          </PolicySection>
        </motion.div>
      </div>
    </div>
  );
}
