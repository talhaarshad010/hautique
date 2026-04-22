'use client';

import * as React from 'react';
import { Button, Input, Card, cn } from '@/components/ui';
import { Plus, Edit2, Trash2, Image as ImageIcon, X, Loader2, Upload, Save, Monitor, Tablet, Smartphone, Play, Film } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useCloudinary } from '@/hooks/useCloudinary';
import { ref, onValue, remove, set, push } from 'firebase/database';
import { database } from '@/lib/firebase';

interface SliderItem {
  id: string;
  image: string; // Desktop/Default
  imageTablet: string;
  imageMobile: string;
  video: string;
  videoTablet: string;
  videoMobile: string;
  tag: string;
  title: string;
  buttonText?: string;
  link?: string;
  order?: number;
}

export default function AdminSliderPage() {
  const { uploadFile, isUploading: storageLoading } = useCloudinary();
  const [activeUploadField, setActiveUploadField] = React.useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingSlideId, setEditingSlideId] = React.useState<string | null>(null);
  const [slides, setSlides] = React.useState<SliderItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Form State
  const [formData, setFormData] = React.useState({
    image: '',
    imageTablet: '',
    imageMobile: '',
    video: '',
    videoTablet: '',
    videoMobile: '',
    tag: '',
    title: '',
    buttonText: 'Shop Now',
    link: '/shop'
  });

  // Fetch Slides from Firebase
  React.useEffect(() => {
    const sliderRef = ref(database, 'settings/heroSlider');
    const unsubscribe = onValue(sliderRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedSlides = Object.entries(data).map(([id, slide]: [string, any]) => ({
          id,
          ...slide
        })).sort((a, b) => (a.order || 0) - (b.order || 0));
        setSlides(formattedSlides);
      } else {
        setSlides([]);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveUploadField(field);
    try {
      const url = await uploadFile(file);
      setFormData(prev => ({ ...prev, [field]: url }));
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setActiveUploadField(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image && !formData.video) return;

    setIsSaving(true);
    try {
      if (editingSlideId) {
        await set(ref(database, `settings/heroSlider/${editingSlideId}`), {
          ...formData,
          order: slides.find(s => s.id === editingSlideId)?.order || 0
        });
      } else {
        const newSlideRef = push(ref(database, 'settings/heroSlider'));
        await set(newSlideRef, {
          ...formData,
          order: slides.length
        });
      }
      closeModal();
    } catch (error) {
      console.error("Operation failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (slide: SliderItem) => {
    setEditingSlideId(slide.id);
    setFormData({
      image: slide.image || '',
      imageTablet: slide.imageTablet || '',
      imageMobile: slide.imageMobile || '',
      video: slide.video || '',
      videoTablet: slide.videoTablet || '',
      videoMobile: slide.videoMobile || '',
      tag: slide.tag || '',
      title: slide.title || '',
      buttonText: slide.buttonText || 'Shop Now',
      link: slide.link || '/shop'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this slide?")) {
      try {
        await remove(ref(database, `settings/heroSlider/${id}`));
      } catch (error) {
        console.error("Failed to delete slide:", error);
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSlideId(null);
    setFormData({
      image: '',
      imageTablet: '',
      imageMobile: '',
      video: '',
      videoTablet: '',
      videoMobile: '',
      tag: '',
      title: '',
      buttonText: 'Shop Now',
      link: '/shop'
    });
  };

  const removeFile = (field: string) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl  tracking-tight uppercase mb-2">Hero Slider</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Manage your responsive homepage visuals and videos.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto text-[10px] uppercase tracking-widest h-10 px-8"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Slide
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-200" />
        </div>
      ) : slides.length === 0 ? (
        <Card className="p-20 text-center border-dashed">
          <ImageIcon className="w-12 h-12 text-neutral-200 mx-auto mb-6" />
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">No slides configured yet.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {slides.map((slide) => (
            <motion.div 
              key={slide.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative"
            >
              <Card className="p-0 overflow-hidden border-none shadow-sm h-full flex flex-col">
                <div className="relative aspect-video bg-neutral-100 overflow-hidden">
                  {slide.video ? (
                    <video 
                      src={slide.video} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                      muted 
                      loop 
                      autoPlay 
                      playsInline
                    />
                  ) : (
                    <img 
                      src={slide.image?.includes('/upload/') ? slide.image.replace('/upload/', '/upload/f_auto,q_auto/') : slide.image} 
                      alt={slide.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  
                  {slide.video && (
                    <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-md p-1.5 rounded-full">
                      <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button 
                      onClick={() => handleEdit(slide)}
                      className="p-3 bg-white rounded-full hover:bg-neutral-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-black" />
                    </button>
                    <button 
                      onClick={() => handleDelete(slide.id)}
                      className="p-3 bg-white rounded-full hover:bg-neutral-100 transition-colors text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 flex gap-1 items-center bg-black/20 backdrop-blur-sm px-2 py-1 rounded">
                    {slide.image && <Monitor className="w-3 h-3 text-white" />}
                    {slide.video && <Film className="w-3 h-3 text-white" />}
                    {(slide.imageTablet || slide.videoTablet) && <Tablet className="w-3 h-3 text-white" />}
                    {(slide.imageMobile || slide.videoMobile) && <Smartphone className="w-3 h-3 text-white" />}
                  </div>
                </div>
                <div className="p-6 flex-grow bg-white">
                  <span className="text-[8px] uppercase tracking-[0.3em] text-neutral-400 mb-2 block font-bold">{slide.tag || 'NO TAGLINE'}</span>
                  <h3 className="text-xl  leading-tight whitespace-pre-line">{slide.title}</h3>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Slide Modal */}
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
              className="relative w-full max-w-4xl bg-white p-10 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl  uppercase tracking-tight mb-2">
                    {editingSlideId ? 'Edit Slide' : 'Add New Slide'}
                  </h2>
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Configure your responsive hero masterpiece with images and videos</p>
                </div>
                <button onClick={closeModal} className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Media Config */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Desktop Config */}
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 flex items-center gap-2">
                      <Monitor className="w-3 h-3" /> Desktop View
                    </label>
                    <div className="flex flex-col gap-3">
                      {/* Desktop Image */}
                      <div className="relative aspect-video bg-neutral-50 border border-neutral-200 rounded-sm overflow-hidden group">
                        {formData.image ? (
                          <>
                            <img src={formData.image} className="w-full h-full object-cover" />
                            <button onClick={() => removeFile('image')} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-2">
                            {storageLoading && activeUploadField === 'image' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <ImageIcon className="w-4 h-4 text-neutral-300" />
                                <span className="text-[7px] uppercase tracking-widest text-neutral-400">Desktop Image</span>
                              </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'image')} />
                          </label>
                        )}
                      </div>
                      {/* Desktop Video */}
                      <div className="relative aspect-video bg-neutral-50 border border-neutral-200 rounded-sm overflow-hidden group">
                        {formData.video ? (
                          <>
                            <video src={formData.video} className="w-full h-full object-cover" />
                            <button onClick={() => removeFile('video')} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-2 bg-neutral-100/50">
                            {storageLoading && activeUploadField === 'video' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Play className="w-4 h-4 text-neutral-300" />
                                <span className="text-[7px] uppercase tracking-widest text-neutral-400">Desktop Video</span>
                              </>
                            )}
                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tablet Config */}
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 flex items-center gap-2">
                      <Tablet className="w-3 h-3" /> Tablet View
                    </label>
                    <div className="flex flex-col gap-3">
                      {/* Tablet Image */}
                      <div className="relative aspect-video bg-neutral-50 border border-neutral-200 rounded-sm overflow-hidden group">
                        {formData.imageTablet ? (
                          <>
                            <img src={formData.imageTablet} className="w-full h-full object-cover" />
                            <button onClick={() => removeFile('imageTablet')} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-2">
                            {storageLoading && activeUploadField === 'imageTablet' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <ImageIcon className="w-4 h-4 text-neutral-300" />
                                <span className="text-[7px] uppercase tracking-widest text-neutral-400">Tablet Image</span>
                              </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'imageTablet')} />
                          </label>
                        )}
                      </div>
                      {/* Tablet Video */}
                      <div className="relative aspect-video bg-neutral-50 border border-neutral-200 rounded-sm overflow-hidden group">
                        {formData.videoTablet ? (
                          <>
                            <video src={formData.videoTablet} className="w-full h-full object-cover" />
                            <button onClick={() => removeFile('videoTablet')} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-2 bg-neutral-100/50">
                            {storageLoading && activeUploadField === 'videoTablet' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Play className="w-4 h-4 text-neutral-300" />
                                <span className="text-[7px] uppercase tracking-widest text-neutral-400">Tablet Video</span>
                              </>
                            )}
                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'videoTablet')} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Config */}
                  <div className="space-y-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 flex items-center gap-2">
                      <Smartphone className="w-3 h-3" /> Mobile View
                    </label>
                    <div className="flex flex-col gap-3">
                      {/* Mobile Image */}
                      <div className="relative aspect-video bg-neutral-50 border border-neutral-200 rounded-sm overflow-hidden group">
                        {formData.imageMobile ? (
                          <>
                            <img src={formData.imageMobile} className="w-full h-full object-cover" />
                            <button onClick={() => removeFile('imageMobile')} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-2">
                            {storageLoading && activeUploadField === 'imageMobile' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <ImageIcon className="w-4 h-4 text-neutral-300" />
                                <span className="text-[7px] uppercase tracking-widest text-neutral-400">Mobile Image</span>
                              </>
                            )}
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'imageMobile')} />
                          </label>
                        )}
                      </div>
                      {/* Mobile Video */}
                      <div className="relative aspect-video bg-neutral-50 border border-neutral-200 rounded-sm overflow-hidden group">
                        {formData.videoMobile ? (
                          <>
                            <video src={formData.videoMobile} className="w-full h-full object-cover" />
                            <button onClick={() => removeFile('videoMobile')} className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </>
                        ) : (
                          <label className="cursor-pointer flex flex-col items-center justify-center h-full gap-2 bg-neutral-100/50">
                            {storageLoading && activeUploadField === 'videoMobile' ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Play className="w-4 h-4 text-neutral-300" />
                                <span className="text-[7px] uppercase tracking-widest text-neutral-400">Mobile Video</span>
                              </>
                            )}
                            <input type="file" className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'videoMobile')} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Tagline</label>
                    <Input 
                      placeholder="e.g. EXQUISITE FRAGRANCES" 
                      className="border-none bg-neutral-50 py-6 focus-visible:ring-0 uppercase tracking-[0.2em]"
                      value={formData.tag}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value.toUpperCase() })}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Button Text</label>
                    <Input 
                      placeholder="e.g. SHOP NOW" 
                      className="border-none bg-neutral-50 py-6 focus-visible:ring-0 uppercase tracking-[0.2em]"
                      value={formData.buttonText}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Main Title (Use \n for line breaks)</label>
                  <textarea 
                    placeholder="The Art of Scent\nInvisible Luxury"
                    className="w-full bg-neutral-50 border-none p-4 text-xl  focus:outline-none min-h-[100px] leading-tight"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
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
                    disabled={isSaving || storageLoading || (!formData.image && !formData.video)}
                    className="flex-1 h-14 bg-black text-white text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <span>Save Slide</span>}
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
