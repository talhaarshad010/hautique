'use client';

import * as React from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Upload,
  Loader2,
  Search,
  Filter,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { Button, Card, Input, cn } from '@/components/ui';
import { motion, AnimatePresence } from 'motion/react';
import { useDatabase } from '@/hooks/useDatabase';
import { useCloudinary } from '@/hooks/useCloudinary';
import { ref, onValue, remove, set } from 'firebase/database';
import { database } from '@/lib/firebase';
import { type Deal, type Product } from '@/lib/mock-data';

export default function DealsPage() {
  const { pushData, loading: databaseLoading } = useDatabase();
  const { uploadFile, isUploading: storageLoading } = useCloudinary();
  
  const [dealsList, setDealsList] = React.useState<Deal[]>([]);
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [isPageLoading, setIsPageLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingDealId, setEditingDealId] = React.useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = React.useState('');
  const [productSearchTerm, setProductSearchTerm] = React.useState('');

  const [formData, setFormData] = React.useState({
    name: '',
    subtextText: '',
    durationRange: '',
    image: '',
    price: '',
    gallery: [] as string[],
    productIds: [] as string[],
    productSizes: {} as Record<string, string[]>
  });

  // Fetch Deals from Firebase
  React.useEffect(() => {
    const dealsRef = ref(database, 'deals');
    const unsubscribe = onValue(dealsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([id, deal]: [string, any]) => ({
          id,
          ...deal
        }));
        setDealsList(formatted);
      } else {
        setDealsList([]);
      }
      setIsPageLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch Products from Firebase
  React.useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([id, product]: [string, any]) => ({
          id,
          ...product
        }));
        setProductsList(formatted);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredDeals = dealsList.filter(deal => {
    return deal.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const filteredProducts = productsList.filter(p => {
    return p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
           p.brand.toLowerCase().includes(productSearchTerm.toLowerCase());
  });

  const toggleProductSelection = (productId: string) => {
    setFormData(prev => {
      const current = prev.productIds || [];
      const currentSizes = prev.productSizes || {};
      if (current.includes(productId)) {
        const newSizes = { ...currentSizes };
        delete newSizes[productId];
        return { 
          ...prev, 
          productIds: current.filter(id => id !== productId),
          productSizes: newSizes
        };
      } else {
        const product = productsList.find(p => p.id === productId);
        return { 
          ...prev, 
          productIds: [...current, productId],
          productSizes: {
            ...currentSizes,
            [productId]: product?.sizes || []
          }
        };
      }
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, image: url }));
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map(file => uploadFile(file));
      const urls = await Promise.all(uploadPromises);
      setFormData(prev => ({ 
        ...prev, 
        gallery: [...(prev.gallery || []), ...urls] 
      }));
    } catch (error) {
      console.error("Gallery upload failed:", error);
    }
  };

  const removeGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.image) return;

    try {
      const entry = {
        ...formData,
        price: Number(formData.price) || 0,
        updatedAt: new Date().toISOString()
      };

      if (editingDealId) {
        await set(ref(database, `deals/${editingDealId}`), entry);
      } else {
        await pushData('deals', entry);
      }
      
      closeModal();
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };

  const handleEdit = (deal: Deal) => {
    setEditingDealId(deal.id);
    setFormData({
      name: deal.name,
      subtextText: deal.subtextText,
      durationRange: deal.durationRange,
      image: deal.image,
      price: deal.price?.toString() || '',
      gallery: deal.gallery || [],
      productIds: deal.productIds || [],
      productSizes: deal.productSizes || {}
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        await remove(ref(database, `deals/${id}`));
      } catch (error) {
        console.error("Failed to delete deal:", error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDealId(null);
    setProductSearchTerm('');
    setFormData({
      name: '',
      subtextText: '',
      durationRange: '',
      image: '',
      price: '',
      gallery: [],
      productIds: [],
      productSizes: {}
    });
  };

  const getProductById = (id: string) => productsList.find(p => p.id === id);

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl  tracking-tight uppercase mb-2">Campaigns & Deals</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Configure promotional logic for the store.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          size="sm" 
          className="text-[10px] uppercase tracking-widest h-10 px-8 bg-black text-white"
        >
          Add New Deal
        </Button>
      </div>

      <div className="lg:col-span-12 flex flex-col md:flex-row gap-4">
        <Card className="flex-grow p-4 flex gap-4 border-none shadow-sm bg-white">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input
              placeholder="Search deals..."
              className="pl-12 border-none bg-neutral-50 focus-visible:ring-0 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>
      </div>

      {/* Active Deals Table */}
      <Card className="p-0 border-none shadow-sm bg-white overflow-hidden min-h-[400px] relative">
        {isPageLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50">
                <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Campaign</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Price</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Products</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Duration</th>
                <th className="px-8 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredDeals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-neutral-400 uppercase tracking-widest text-[10px]">
                    No active deals found.
                  </td>
                </tr>
              ) : (
                filteredDeals.map((deal) => (
                  <tr key={deal.id} className="group hover:bg-neutral-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 relative overflow-hidden bg-neutral-100 rounded">
                          <img
                            src={deal.image.includes('/upload/') ? deal.image.replace('/upload/', '/upload/f_auto,q_auto/') : deal.image} 
                            alt={deal.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold uppercase tracking-widest">{deal.name}</p>
                          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">{deal.subtextText}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-lg ">PKR {deal.price || 0}.00</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1">
                        {(deal.productIds || []).slice(0, 3).map((pid) => {
                          const product = getProductById(pid);
                          return product ? (
                            <div key={pid} className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm -ml-2 first:ml-0">
                              <img src={product.image.includes('/upload/') ? product.image.replace('/upload/', '/upload/f_auto,q_auto,w_50/') : product.image} alt={product.name} className="w-full h-full object-cover" />
                            </div>
                          ) : null;
                        })}
                        {(deal.productIds || []).length > 3 && (
                          <span className="text-[10px] font-bold text-neutral-400 ml-1">+{(deal.productIds || []).length - 3}</span>
                        )}
                        {(!deal.productIds || deal.productIds.length === 0) && (
                          <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-widest">None</span>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-[10px] uppercase tracking-widest font-bold">{deal.durationRange}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <button 
                          onClick={() => handleEdit(deal)}
                          className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-400 hover:text-black"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(deal.id)}
                          className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </Card>

      {/* Add/Edit Deal Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="sticky top-0 bg-white z-10 px-10 pt-10 pb-6 border-b border-neutral-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl  uppercase tracking-tight mb-2">
                      {editingDealId ? 'Edit Deal' : 'Create New Deal'}
                    </h2>
                    <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Define promotional parameters</p>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="px-10 pb-10 pt-6 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Campaign Name</label>
                  <Input 
                    placeholder="e.g. Summer Solstice Sale" 
                    className="border-none bg-neutral-50 py-6 focus-visible:ring-0" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Deal Price (PKR)</label>
                  <Input 
                    type="number" 
                    placeholder="99" 
                    className="border-none bg-neutral-50 py-6 focus-visible:ring-0" 
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Subtext (e.g. FLORAL COLLECTION)</label>
                  <Input 
                    placeholder="FLORAL & MUSK COLLECTION" 
                    className="border-none bg-neutral-50 py-6 focus-visible:ring-0" 
                    value={formData.subtextText}
                    onChange={(e) => setFormData({ ...formData, subtextText: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Start / End Dates</label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input 
                        type="date"
                        className="border-none bg-neutral-50 focus-visible:ring-0 text-[11px] h-[52px] w-full" 
                        onChange={(e) => {
                          const start = e.target.value;
                          const currentRange = formData.durationRange.split(' — ');
                          const end = currentRange[1] || '';
                          setFormData({ ...formData, durationRange: `${start} — ${end}` });
                        }}
                      />
                    </div>
                    <span className="text-neutral-300 ">—</span>
                    <div className="flex-1">
                      <Input 
                        type="date"
                        className="border-none bg-neutral-50 focus-visible:ring-0 text-[11px] h-[52px] w-full" 
                        onChange={(e) => {
                          const end = e.target.value;
                          const currentRange = formData.durationRange.split(' — ');
                          const start = currentRange[0] || '';
                          setFormData({ ...formData, durationRange: `${start} — ${end}` });
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Product Selector */}
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                      Select Products for This Deal
                    </label>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-black">
                      {formData.productIds.length} Selected
                    </span>
                  </div>

                  {/* Selected Products Preview with Size Selection */}
                  {formData.productIds.length > 0 && (
                    <div className="space-y-6">
                      {formData.productIds.map((pid) => {
                        const product = getProductById(pid);
                        if (!product) return null;
                        return (
                          <div key={pid} className="bg-neutral-50 p-6 space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-neutral-200">
                                  <img 
                                    src={product.image.includes('/upload/') ? product.image.replace('/upload/', '/upload/f_auto,q_auto,w_80/') : product.image} 
                                    alt={product.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                                <div>
                                  <p className="text-[10px] uppercase tracking-widest font-bold">{product.name}</p>
                                  <p className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold">{product.category}</p>
                                </div>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => toggleProductSelection(pid)} 
                                className="p-2 hover:bg-neutral-200 rounded-full transition-colors text-neutral-400"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="space-y-2">
                              <label className="text-[8px] uppercase tracking-widest font-bold text-neutral-400">Included ML Sizes</label>
                              <div className="flex flex-wrap gap-2">
                                {(product.sizes || []).map(size => {
                                  const isIncluded = formData.productSizes?.[pid]?.includes(size);
                                  return (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => {
                                        const currentSizes = formData.productSizes?.[pid] || [];
                                        const newSizes = isIncluded 
                                          ? currentSizes.filter(s => s !== size)
                                          : [...currentSizes, size];
                                        setFormData({
                                          ...formData,
                                          productSizes: {
                                            ...formData.productSizes,
                                            [pid]: newSizes
                                          }
                                        });
                                      }}
                                      className={cn(
                                        "px-4 py-1.5 text-[8px] uppercase tracking-[0.2em] font-bold border transition-all",
                                        isIncluded 
                                          ? "bg-black text-white border-black" 
                                          : "bg-white text-neutral-300 border-neutral-100 hover:border-black hover:text-black"
                                      )}
                                    >
                                      {size}
                                    </button>
                                  );
                                })}
                                {(product.sizes || []).length === 0 && (
                                  <p className="text-[8px] uppercase tracking-widest text-neutral-300 font-bold italic">No sizes defined for this product</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Product Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
                    <Input 
                      placeholder="Search products to add..." 
                      className="border-none bg-neutral-50 pl-10 focus-visible:ring-0 text-sm"
                      value={productSearchTerm}
                      onChange={(e) => setProductSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Product Grid */}
                  <div className="max-h-[200px] overflow-y-auto border border-neutral-100 rounded-lg divide-y divide-neutral-50">
                    {filteredProducts.length === 0 ? (
                      <div className="px-4 py-8 text-center text-[10px] uppercase tracking-widest text-neutral-300">
                        No products found
                      </div>
                    ) : (
                      filteredProducts.map((product) => {
                        const isSelected = formData.productIds.includes(product.id);
                        return (
                          <button
                            type="button"
                            key={product.id}
                            onClick={() => toggleProductSelection(product.id)}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                              isSelected ? "bg-neutral-50" : "hover:bg-neutral-50/50"
                            )}
                          >
                            <div className="w-10 h-10 rounded overflow-hidden bg-neutral-100 flex-shrink-0">
                              <img 
                                src={product.image.includes('/upload/') ? product.image.replace('/upload/', '/upload/f_auto,q_auto,w_80/') : product.image}
                                alt={product.name} 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className="text-[10px] font-bold uppercase tracking-widest truncate">{product.name}</p>
                              <p className="text-[9px] uppercase tracking-widest text-neutral-400">{product.category} • PKR {product.price}</p>
                            </div>
                            <div className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                              isSelected 
                                ? "bg-black border-black" 
                                : "border-neutral-200"
                            )}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Deal Image</label>
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32 bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center overflow-hidden group rounded">
                      {formData.image ? (
                        <>
                          <img 
                            src={formData.image.includes('/upload/') ? formData.image.replace('/upload/', '/upload/f_auto,q_auto/') : formData.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <label className="cursor-pointer p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors">
                              <Upload className="w-4 h-4" />
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-2">
                          {storageLoading ? (
                            <Loader2 className="w-6 h-6 animate-spin text-neutral-300" />
                          ) : (
                            <>
                              <ImageIcon className="w-6 h-6 text-neutral-300" />
                              <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold">Pick Image</span>
                            </>
                          )}
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>
                      )}
                    </div>
                    {formData.image && (
                      <div className="flex-grow">
                        <p className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold mb-2">Thumbnail Active</p>
                        <p className="text-[10px] text-neutral-500 truncate max-w-xs">{formData.image}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Gallery Images (Max 4)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {formData.gallery?.map((url, index) => (
                      <div key={index} className="relative aspect-square bg-neutral-50 border border-neutral-100 group rounded overflow-hidden">
                        <img 
                          src={url.includes('/upload/') ? url.replace('/upload/', '/upload/f_auto,q_auto/') : url} 
                          alt={`Gallery ${index}`} 
                          className="w-full h-full object-cover" 
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-1 right-1 p-1 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    ))}
                    {(!formData.gallery || formData.gallery.length < 4) && (
                      <label className="aspect-square bg-neutral-50 border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center cursor-pointer hover:bg-neutral-100 transition-colors group rounded">
                        <Plus className="w-5 h-5 text-neutral-300 group-hover:text-black transition-colors mb-1" />
                        <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold">Add Gallery</span>
                        <input type="file" className="hidden" accept="image/*" multiple onChange={handleGalleryUpload} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={closeModal}
                    className="flex-1 h-14 text-[10px] uppercase tracking-widest font-bold"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={databaseLoading || storageLoading || !formData.image}
                    className="flex-1 h-14 bg-black text-white text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
                  >
                    {databaseLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : editingDealId ? "Update Campaign" : "Activate Deal"}
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
