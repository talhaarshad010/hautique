'use client';

import * as React from 'react';
import { Button, Input, Card, Badge } from '@/components/ui';
import { products, type Product } from '@/lib/mock-data';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Filter, Edit2, Trash2, MoreVertical, Image as ImageIcon, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function AdminProductsPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = React.useState(initialSearch);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  React.useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-serif tracking-tight uppercase mb-2">Products</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Manage your fragrance collection and inventory.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto text-[10px] uppercase tracking-widest h-10 px-8"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 border-none shadow-sm">
        <div className="flex-grow relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            placeholder="Search products..."
            className="pl-12 border-none bg-neutral-50 focus-visible:ring-0 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="flex-grow md:flex-grow-0 text-[10px] uppercase tracking-widest h-10 px-6">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" className="flex-grow md:flex-grow-0 text-[10px] uppercase tracking-widest h-10 px-6">
            Category
          </Button>
        </div>
      </Card>

      {/* Products Table */}
      <div className="bg-white border-none shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Product</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Category</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Price</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Stock</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 bg-neutral-100 overflow-hidden rounded">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover grayscale hover:grayscale-0 transition-all"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold uppercase tracking-widest">{product.name}</p>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest">{product.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-neutral-100 rounded-full">
                    {product.category}
                  </span>
                </td>
                <td className="px-6 py-6 text-sm font-serif">${product.price}.00</td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">In Stock</span>
                  </div>
                </td>
                <td className="px-6 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                      <Edit2 className="w-4 h-4 text-neutral-400 hover:text-black" />
                    </button>
                    <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-600" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
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
              className="relative w-full max-w-2xl bg-white p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-serif uppercase tracking-tight mb-2">Add New Product</h2>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Configure fragrance details</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Product Name</label>
                    <Input placeholder="e.g. Midnight Rose" className="border-none bg-neutral-50 py-6 focus-visible:ring-0" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Brand</label>
                    <Input placeholder="e.g. Hautique" className="border-none bg-neutral-50 py-6 focus-visible:ring-0" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Category</label>
                    <select className="w-full bg-neutral-50 border-none py-3 px-4 text-sm focus:outline-none uppercase tracking-widest font-medium h-[52px]">
                      <option>FOR HER</option>
                      <option>FOR HIM</option>
                      <option>TESTERS</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Price ($)</label>
                    <Input type="number" placeholder="120" className="border-none bg-neutral-50 py-6 focus-visible:ring-0" />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Description</label>
                  <textarea 
                    className="w-full bg-neutral-50 border-none p-4 text-sm focus:outline-none min-h-[120px]"
                    placeholder="Describe the fragrance notes and character..."
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Product Image URL</label>
                  <Input placeholder="https://..." className="border-none bg-neutral-50 py-6 focus-visible:ring-0" />
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
                    Save Product
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
