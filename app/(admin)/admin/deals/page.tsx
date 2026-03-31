'use client';

import * as React from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Calendar, 
  Tag, 
  ChevronDown,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';
import { Button, Card, Input, cn } from '@/components/ui';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';

const activeDeals = [
  { 
    id: '1', 
    category: 'For Her', 
    subtext: 'FLORAL & MUSK COLLECTION', 
    discount: '20% OFF', 
    duration: 'May 01 — Jun 15', 
    progress: 65,
    image: 'https://picsum.photos/seed/perfume1/100/100'
  },
  { 
    id: '2', 
    category: 'For Him', 
    subtext: 'WOODY & SPICE COLLECTION', 
    discount: '15% OFF', 
    duration: 'Jun 10 — Jul 10', 
    progress: 20,
    image: 'https://picsum.photos/seed/perfume2/100/100'
  },
  { 
    id: '3', 
    category: 'Testers', 
    subtext: 'DISCOVERY SETS', 
    discount: '10% OFF', 
    duration: 'Permanent', 
    progress: 100,
    image: 'https://picsum.photos/seed/perfume3/100/100'
  },
];

export default function DealsPage() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif tracking-tight uppercase mb-2">Campaigns & Deals</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Configure promotional logic for the monolith store.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          size="sm" 
          className="text-[10px] uppercase tracking-widest h-10 px-8 bg-black text-white"
        >
          Add New Deal
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Deal Blueprint Form */}
        <Card className="lg:col-span-4 p-10 border-none shadow-sm bg-white">
          <h3 className="text-2xl font-serif italic mb-10">Deal Blueprint</h3>
          
          <form className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Target Category</label>
              <div className="relative">
                <select className="w-full bg-transparent border-b border-neutral-200 py-3 text-sm focus:outline-none appearance-none uppercase tracking-widest font-medium">
                  <option>FOR HER</option>
                  <option>FOR HIM</option>
                  <option>TESTERS</option>
                  <option>EXCLUSIVE</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Discount Percentage (%)</label>
              <Input 
                type="number" 
                defaultValue="15" 
                className="border-none border-b border-neutral-200 rounded-none px-0 py-6 text-2xl font-serif focus-visible:ring-0"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Start Date</label>
                <div className="relative">
                  <Input type="date" className="border-none border-b border-neutral-200 rounded-none px-0 py-3 text-xs focus-visible:ring-0" />
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">End Date</label>
                <div className="relative">
                  <Input type="date" className="border-none border-b border-neutral-200 rounded-none px-0 py-3 text-xs focus-visible:ring-0" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Deal Reference Code</label>
              <Input 
                placeholder="ESSENCE_SUMMER_24" 
                className="border-none border-b border-neutral-200 rounded-none px-0 py-3 text-sm uppercase tracking-widest focus-visible:ring-0"
              />
            </div>

            <Button className="w-full h-14 bg-neutral-700 hover:bg-black text-white text-[10px] uppercase tracking-widest font-bold transition-all mt-10">
              Validate & Activate
            </Button>
          </form>
        </Card>

        {/* Active Deals Table */}
        <div className="lg:col-span-8 space-y-10">
          <Card className="p-0 border-none shadow-sm bg-white overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Category</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Discount</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Duration</th>
                  <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {activeDeals.map((deal) => (
                  <tr key={deal.id} className="group hover:bg-neutral-50 transition-colors">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 relative overflow-hidden bg-neutral-100">
                          <Image 
                            src={deal.image} 
                            alt={deal.category} 
                            fill 
                            className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="text-lg font-serif mb-1">{deal.category}</p>
                          <p className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold">{deal.subtext}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8">
                      <span className="text-2xl font-serif">{deal.discount}</span>
                    </td>
                    <td className="px-8 py-8">
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-widest font-bold">{deal.duration}</p>
                        <div className="h-[2px] bg-neutral-100 w-32">
                          <div className="h-full bg-black" style={{ width: `${deal.progress}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-400 hover:text-black">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Scheduled Campaigns Placeholder */}
          <Card className="p-20 border-none shadow-sm bg-neutral-50 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-8 shadow-sm">
              <Sparkles className="w-6 h-6 text-neutral-300" />
            </div>
            <h4 className="text-xl font-serif uppercase tracking-tight mb-4">Scheduled Campaigns</h4>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 max-w-xs leading-relaxed">
              No upcoming automated events. Create a new trigger above to begin.
            </p>
          </Card>
        </div>
      </div>

      {/* Add Deal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white p-10 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-serif uppercase tracking-tight mb-2">Create New Deal</h2>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Define promotional parameters</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Campaign Name</label>
                  <Input placeholder="e.g. Summer Solstice Sale" className="border-none bg-neutral-50 py-6 focus-visible:ring-0" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Category</label>
                    <select className="w-full bg-neutral-50 border-none py-3 px-4 text-sm focus:outline-none uppercase tracking-widest font-medium h-[52px]">
                      <option>FOR HER</option>
                      <option>FOR HIM</option>
                      <option>TESTERS</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Discount (%)</label>
                    <Input type="number" placeholder="20" className="border-none bg-neutral-50 py-6 focus-visible:ring-0" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Start Date</label>
                    <Input type="date" className="border-none bg-neutral-50 py-3 px-4 text-xs focus-visible:ring-0 h-[52px]" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">End Date</label>
                    <Input type="date" className="border-none bg-neutral-50 py-3 px-4 text-xs focus-visible:ring-0 h-[52px]" />
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-14 text-[10px] uppercase tracking-widest font-bold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="flex-1 h-14 bg-black text-white text-[10px] uppercase tracking-widest font-bold"
                  >
                    Activate Deal
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Branding */}
      <div className="pt-20 pb-10 border-t border-neutral-100 text-center">
        <h2 className="text-2xl font-serif tracking-[0.3em] mb-6 uppercase">L&apos;ESSENCE</h2>
        <div className="flex justify-center gap-8 text-[8px] uppercase tracking-widest font-bold text-neutral-400 mb-8">
          <button className="hover:text-black transition-colors">Privacy</button>
          <button className="hover:text-black transition-colors">Terms</button>
          <button className="hover:text-black transition-colors">Shipping</button>
          <button className="hover:text-black transition-colors">Sustainability</button>
        </div>
        <p className="text-[8px] uppercase tracking-widest text-neutral-400">
          © 2024 L&apos;ESSENCE MONOLITH. ALL RIGHTS RESERVED.
        </p>
      </div>
    </div>
  );
}
