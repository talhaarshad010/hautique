'use client';

import * as React from 'react';
import { Button, Input, Card, cn } from '@/components/ui';
import { type Product } from '@/lib/mock-data';
import { useSearchParams } from 'next/navigation';
import { Plus, Search, Filter, Edit2, Trash2, Image as ImageIcon, X, Loader2, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useDatabase } from '@/hooks/useDatabase';
import { useCloudinary } from '@/hooks/useCloudinary';
import { ref, onValue, remove, set } from 'firebase/database';
import { database } from '@/lib/firebase';

const CATEGORIES = ['For Her', 'For Him', 'Testers'] as const;

export default function AdminProductsPage() {
  const { pushData, loading: databaseLoading } = useDatabase();
  const { uploadFile, isUploading: storageLoading } = useCloudinary();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const [searchTerm, setSearchTerm] = React.useState(initialSearch);
  const [filterCategory, setFilterCategory] = React.useState<string>('All');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [customSize, setCustomSize] = React.useState('');
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [isPageLoading, setIsPageLoading] = React.useState(true);

  // Form State
  const [formData, setFormData] = React.useState({
    name: '',
    brand: 'Hautique',
    category: 'For Her' as Product['category'],
    price: '',
    description: '',
    image: '',
    gallery: [] as string[],
    isNew: true,
    sizes: [] as string[]
  });

  // Fetch Products from Firebase
  React.useEffect(() => {
    const productsRef = ref(database, 'products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedProducts = Object.entries(data).map(([id, product]: [string, any]) => ({
          id,
          ...product
        }));
        setProductsList(formattedProducts);
      } else {
        setProductsList([]);
      }
      setIsPageLoading(false);
    });

    return () => unsubscribe();
  }, []);

  React.useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const filteredProducts = productsList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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
    if (!formData.name || !formData.price || !formData.image) return;

    try {
      const entry = {
        ...formData,
        price: Number(formData.price),
        updatedAt: new Date().toISOString()
      };

      if (editingProductId) {
        await set(ref(database, `products/${editingProductId}`), entry);
      } else {
        await pushData('products', {
          ...entry,
          createdAt: new Date().toISOString()
        });
      }
      
      closeModal();
    } catch (error) {
      console.error("Operation failed:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProductId(product.id);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      price: product.price.toString(),
      description: product.description || '',
      image: product.image,
      gallery: product.gallery || [],
      isNew: product.isNew || false,
      sizes: product.sizes || []
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await remove(ref(database, `products/${id}`));
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProductId(null);
    setFormData({
      name: '',
      brand: 'Hautique',
      category: 'For Her',
      price: '',
      description: '',
      image: '',
      gallery: [],
      isNew: true,
      sizes: []
    });
  };

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
        <div className="flex-grow">
          {/* Internal search removed by user request */}
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="pl-10 pr-8 h-10 bg-neutral-50 border-none rounded-md text-[10px] uppercase tracking-widest font-bold focus:outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* Products Table */}
      <div className="bg-white border-none shadow-sm overflow-x-auto min-h-[300px] relative">
        {isPageLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
          </div>
        ) : (
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
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-neutral-400 uppercase tracking-widest text-[10px]">
                    No products found. Add your first fragrance above.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 bg-neutral-100 overflow-hidden rounded">
                          <img
                            src={product.image.includes('/upload/') ? product.image.replace('/upload/', '/upload/f_auto,q_auto/') : product.image}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
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
                    <td className="px-6 py-6 text-sm font-serif">PKR {product.price}.00</td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">In Stock</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(product)}
                          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-neutral-400 hover:text-black" />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id)}
                          className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-400 hover:text-red-600"
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
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
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
              className="relative w-full max-w-2xl bg-white p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-serif uppercase tracking-tight mb-2">
                    {editingProductId ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Configure fragrance details</p>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Product Name</label>
                    <Input 
                      placeholder="e.g. Midnight Rose" 
                      className="border-none bg-neutral-50 py-6 focus-visible:ring-0" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Brand</label>
                    <Input 
                      placeholder="e.g. Hautique" 
                      className="border-none bg-neutral-50 py-6 focus-visible:ring-0" 
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Category</label>
                    <select 
                      className="w-full bg-neutral-50 border-none py-3 px-4 text-sm focus:outline-none uppercase tracking-widest font-medium h-[52px]"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as Product['category'] })}
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Price (PKR)</label>
                    <Input 
                      type="number" 
                      placeholder="120" 
                      className="border-none bg-neutral-50 py-6 focus-visible:ring-0" 
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Description</label>
                  <textarea 
                    className="w-full bg-neutral-50 border-none p-4 text-sm focus:outline-none min-h-[120px]"
                    placeholder="Describe the fragrance notes and character..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Available Sizes (ML)</label>
                  <div className="flex flex-wrap gap-3">
                    {['50ml', '100ml', '150ml', '200ml', ...(formData.sizes?.filter(s => !['50ml', '100ml', '150ml', '200ml'].includes(s)) || [])].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const currentSizes = formData.sizes || [];
                          const newSizes = currentSizes.includes(size)
                            ? currentSizes.filter(s => s !== size)
                            : [...currentSizes, size];
                          setFormData({ ...formData, sizes: newSizes });
                        }}
                        className={cn(
                          "px-6 py-2 text-[10px] uppercase tracking-widest font-bold border transition-all",
                          formData.sizes?.includes(size)
                            ? "bg-black text-white border-black"
                            : "bg-neutral-50 text-neutral-400 border-transparent hover:border-neutral-200"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                    
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Add Size (e.g. 30ml)"
                            value={customSize}
                            onChange={(e) => setCustomSize(e.target.value)}
                            className="bg-neutral-50 border-none px-4 text-[10px] uppercase tracking-widest font-bold w-32 focus:outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (customSize && !formData.sizes?.includes(customSize)) {
                                        setFormData({ ...formData, sizes: [...(formData.sizes || []), customSize] });
                                        setCustomSize('');
                                    }
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (customSize && !formData.sizes?.includes(customSize)) {
                                    setFormData({ ...formData, sizes: [...(formData.sizes || []), customSize] });
                                    setCustomSize('');
                                }
                            }}
                            className="px-4 py-2 bg-neutral-100 text-[10px] uppercase tracking-widest font-bold hover:bg-neutral-200 transition-colors"
                        >
                            + Add
                        </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Product Image</label>
                  <div className="flex items-center gap-6">
                    <div className="relative w-32 h-32 bg-neutral-50 border-2 border-dashed border-neutral-200 flex items-center justify-center overflow-hidden group">
                      {formData.image ? (
                        <>
                          <img 
                            src={formData.image.includes('/upload/') ? formData.image.replace('/upload/', '/upload/f_auto,q_auto/') : formData.image} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <label className="cursor-pointer p-2 bg-white rounded-full">
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
                        <p className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold mb-1">Image URL</p>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] text-neutral-500 truncate max-w-[150px]">{formData.image}</p>
                          <a href={formData.image} target="_blank" rel="noreferrer" className="text-[8px] uppercase font-bold text-black underline">View Full</a>
                        </div>
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
                        <span className="text-[8px] uppercase tracking-widest text-neutral-400 font-bold">Add More</span>
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
                    {databaseLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : editingProductId ? "Update Product" : "Save Product"}
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
