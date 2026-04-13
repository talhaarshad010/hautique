'use client';

import * as React from 'react';
import { motion } from 'motion/react';
import { FileText, Scale, Gavel, AlertCircle } from 'lucide-react';

const TermsSection = ({ icon: Icon, title, children }: { icon: any, title: string, children: React.ReactNode }) => (
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

export default function TermsOfServicePage() {
  return (
    <div className="pt-16 pb-24 px-6 md:px-12 max-w-4xl mx-auto min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-24"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 block mb-6 font-bold">Legal</span>
        <h1 className="text-6xl md:text-7xl font-bold mb-8 tracking-tighter">Terms of<br />Service</h1>
        <p className="text-neutral-500 max-w-xl uppercase tracking-widest text-[10px] leading-loose italic">
          Engagement with our digital atelier constitutes acceptance of these terms. We maintain these standards to preserve the integrity and exclusivity of the Hautique experience.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <TermsSection icon={Scale} title="Engagement">
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              By accessing the Hautique platform, you agree to comply with all applicable laws and these Terms of Service. This agreement governs:
            </p>
            <ul className="text-[10px] uppercase tracking-widest text-neutral-400 space-y-4 font-bold">
              <li className="flex justify-between border-b border-neutral-100 pb-2">
                <span>Account Registration</span>
                <span className="text-black">PERSONAL USE ONLY</span>
              </li>
              <li className="flex justify-between border-b border-neutral-100 pb-2">
                <span>Procurement Integrity</span>
                <span className="text-black">VALID INFORMATION REQUIRED</span>
              </li>
              <li className="flex justify-between border-b border-neutral-100 pb-2">
                <span>Platform Usage</span>
                <span className="text-black">NON-DISRUPTIVE CONDUCT</span>
              </li>
            </ul>
          </TermsSection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <TermsSection icon={FileText} title="Intellectual Property">
            <p className="text-sm text-neutral-600 leading-relaxed mb-4">
              All content on this platform—including scent descriptions, photography, brand identity, and code—is the exclusive property of Hautique. Unauthorized reproduction, modification, or distribution is strictly prohibited.
            </p>
          </TermsSection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <TermsSection icon={AlertCircle} title="Limitations">
            <p className="text-sm text-neutral-600 leading-relaxed">
              While we strive for absolute accuracy in our olfactory representations, variations in perception may occur. Hautique is not liable for indirect or consequential damages arising from the use or inability to use our platform or products.
            </p>
          </TermsSection>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <TermsSection icon={Gavel} title="Governing Law">
            <p className="text-sm text-neutral-600 leading-relaxed">
              These terms are governed by the laws of Pakistan. Any disputes arising from these terms or your use of the platform will be resolved exclusively in the appropriate courts of the jurisdiction.
            </p>
          </TermsSection>
        </motion.div>
      </div>

      <div className="mt-32 pt-16 border-t border-neutral-100 text-center">
        <p className="text-[10px] text-neutral-300 uppercase tracking-[0.4em]">Need clarification on our terms?</p>
        <button className="mt-8 text-[10px] font-bold uppercase tracking-widest hover:text-black transition-colors text-neutral-400 underline underline-offset-8">
          Contact Legal Concierge
        </button>
      </div>
    </div>
  );
}
