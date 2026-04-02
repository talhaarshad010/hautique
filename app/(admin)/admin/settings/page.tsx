'use client';

import * as React from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Button } from '@/components/ui';
import { Truck, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function SettingsPage() {
  const [shippingFee, setShippingFee] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const settingsRef = ref(database, 'settings');
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data && typeof data.shippingFee === 'number') {
        setShippingFee(data.shippingFee);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await set(ref(database, 'settings/shippingFee'), Number(shippingFee));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-200" />
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-serif tracking-tight">Store Settings</h1>
        <p className="text-neutral-400 text-sm uppercase tracking-widest">Configure your boutique's global parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Shipping Configuration */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-border p-8 rounded-2xl shadow-sm space-y-8"
          >
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-black" />
              </div>
              <div>
                <h2 className="text-xl font-serif">Delivery Logistics</h2>
                <p className="text-xs text-neutral-400 uppercase tracking-widest mt-1">Manage shipping costs and fees</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-500">
                  Flat Rate Shipping Fee ($)
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-400 font-medium">$</span>
                  <input
                    type="number"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value))}
                    className="w-full bg-neutral-50 border border-border rounded-xl px-12 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-black/5 transition-all font-medium"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[10px] text-neutral-400 leading-relaxed italic">
                  Note: This fee will be applied globally to all orders during checkout. Use 0 for free shipping.
                </p>
              </div>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full md:w-auto min-w-[200px] py-4 rounded-xl"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : saved ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? 'Saving...' : saved ? 'Settings Updated' : 'Save Changes'}
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-black text-white p-6 rounded-2xl space-y-4">
            <h3 className="text-sm font-serif italic text-neutral-400">Pro Tip</h3>
            <p className="text-xs leading-relaxed text-neutral-300">
              Consider seasonal promotions where you set the shipping fee to $0 to encourage higher conversion rates.
            </p>
          </div>
          
          <div className="bg-neutral-100 p-6 rounded-2xl border border-border">
            <h3 className="text-[10px] uppercase tracking-widest font-bold mb-3">Active Configuration</h3>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 italic">Current Fee</span>
                <span className="font-bold font-serif">${shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-500 italic">Method</span>
                <span className="font-bold font-serif">Standard Flat Rate</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
