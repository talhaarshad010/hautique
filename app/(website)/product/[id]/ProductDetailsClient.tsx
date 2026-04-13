'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingCart, Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw, Star, MessageSquare, Send, Loader2 } from 'lucide-react';
import { push, set } from 'firebase/database';
import { Button, Badge, cn } from '@/components/ui';
import { type Product } from '@/lib/mock-data';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

interface ProductDetailsClientProps {
  initialProduct: Product;
  productId: string;
}

export default function ProductDetailsClient({ initialProduct, productId }: ProductDetailsClientProps) {
  const [product, setProduct] = React.useState<Product>(initialProduct);
  const [quantity, setQuantity] = React.useState(1);
  const [selectedImage, setSelectedImage] = React.useState<string>(initialProduct.image);
  const [selectedSize, setSelectedSize] = React.useState<string>(initialProduct.sizes?.[0] || '');
  const [isWishlisted, setIsWishlisted] = React.useState(false);
  const [relatedProducts, setRelatedProducts] = React.useState<Product[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [isReviewLoading, setIsReviewLoading] = React.useState(false);
  const [reviewForm, setReviewForm] = React.useState({ name: '', rating: 5, comment: '' });
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  React.useEffect(() => {
    // Sync with real-time data if needed
    const productRef = ref(database, `products/${productId}`);
    const unsubscribe = onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProduct({ id: productId, ...data });
      }
    });

    // Fetch related products
    const allProductsRef = ref(database, 'products');
    onValue(allProductsRef, (allSnapshot) => {
      const allData = allSnapshot.val();
      if (allData) {
        const formatted = Object.entries(allData)
          .map(([id, p]: [string, any]) => ({ id, ...p }))
          .filter((p) => p.category === initialProduct.category && p.id !== productId)
          .slice(0, 4);
        setRelatedProducts(formatted);
      }
    }, { onlyOnce: true });

    // Fetch reviews
    const reviewsRef = ref(database, `products/${productId}/reviews`);
    const unsubscribeReviews = onValue(reviewsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data)
          .map(([id, r]: [string, any]) => ({ id, ...r }))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setReviews(formatted);
      } else {
        setReviews([]);
      }
    });
 
    return () => {
      unsubscribe();
      unsubscribeReviews();
    };
  }, [productId, initialProduct.category]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) return;
    setIsReviewLoading(true);

    try {
      const newReviewRef = push(ref(database, `products/${productId}/reviews`));
      await set(newReviewRef, {
        name: reviewForm.name.trim() || 'Anonymous',
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        createdAt: new Date().toISOString()
      });
      setReviewForm({ name: '', rating: 5, comment: '' });
      setShowReviewForm(false);
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsReviewLoading(false);
    }
  };


  return (
    <div className="pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-16 mb-24">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2 space-y-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative aspect-square bg-neutral-100 border border-border overflow-hidden"
          >
            <img
              src={selectedImage.includes('/upload/') ? selectedImage.replace('/upload/', '/upload/f_auto,q_auto/') : selectedImage}
              alt={product.name}
              className="w-full h-full object-contain transition-all duration-500"
            />
            {product.isNew && <Badge className="absolute top-6 left-6">New Arrival</Badge>}
          </motion.div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {[product.image, ...(product.gallery || [])].map((imgUrl, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative flex-shrink-0 w-24 h-24 bg-neutral-100 border transition-all cursor-pointer overflow-hidden ${
                  selectedImage === imgUrl ? 'border-black opacity-100' : 'border-border opacity-50 hover:opacity-80'
                }`}
              >
                <img
                  src={imgUrl.includes('/upload/') ? imgUrl.replace('/upload/', '/upload/f_auto,q_auto/') : imgUrl}
                  alt={`Thumbnail ${i}`}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="mb-8">
            <span className="text-xs uppercase tracking-[0.3em] text-neutral-400 mb-4 block">{product.brand}</span>
            <h1 className="text-4xl md:text-5xl  mb-4 leading-tight">{product.name}</h1>
            <p className="text-2xl font-medium">PKR {product.price}.00</p>
          </div>

          <p className="text-neutral-600 leading-relaxed mb-10 border-b border-border pb-10">
            {product.description}
          </p>

          <div className="space-y-8 mb-12">
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-4">
                <span className="text-xs uppercase tracking-widest font-bold">Select Size</span>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-8 py-3 text-[10px] uppercase tracking-[0.2em] font-bold transition-all border",
                        selectedSize === size 
                          ? "bg-black text-white border-black" 
                          : "bg-white text-neutral-400 border-neutral-100 hover:border-black hover:text-black"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-6">
              <span className="text-xs uppercase tracking-widest font-bold">Quantity</span>
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-neutral-100 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-neutral-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="flex-grow"
                onClick={() => {
                  addToCart(product, quantity, selectedSize);
                  router.push('/cart');
                }}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Add to Cart
              </Button>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className={cn(
                    "w-14 h-14 p-0 transition-all duration-300",
                    isWishlisted ? "bg-red-50 border-red-100 text-red-500" : "hover:border-black"
                  )}
                  onClick={() => setIsWishlisted(!isWishlisted)}
                >
                  <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-border">
            <div className="flex flex-col items-center text-center gap-3">
              <Truck className="w-6 h-6 text-neutral-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Free Shipping</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <RotateCcw className="w-6 h-6 text-neutral-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold">30-Day Returns</span>
            </div>
            <div className="flex flex-col items-center text-center gap-3">
              <ShieldCheck className="w-6 h-6 text-neutral-400" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <section className="pt-24 mb-24 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="w-full md:w-1/3">
            <h2 className="text-3xl  mb-6">Customer Reviews</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex text-black">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className={cn("w-5 h-5 fill-current", reviews.length > 0 && Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) >= s ? "text-black" : "text-neutral-200")} />
                ))}
              </div>
              <span className="text-sm font-medium">{reviews.length} Reviews</span>
            </div>
            <Button 
                variant="outline" 
                className="w-full h-14 text-[10px] uppercase tracking-widest font-bold"
                onClick={() => setShowReviewForm(!showReviewForm)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {showReviewForm ? 'Cancel Review' : 'Write a Review'}
            </Button>
          </div>

          <div className="w-full md:w-2/3">
            <AnimatePresence>
                {showReviewForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden mb-12"
                  >
                    <form onSubmit={handleReviewSubmit} className="bg-neutral-50 p-8 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Your Name (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="Anonymous"
                            className="w-full bg-white border border-neutral-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                            value={reviewForm.name}
                            onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Rating</label>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                className="focus:outline-none"
                              >
                                <Star className={cn("w-6 h-6", reviewForm.rating >= star ? "fill-black text-black" : "text-neutral-300")} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">Your Review</label>
                        <textarea 
                          required
                          placeholder="Share your experience with this fragrance..."
                          className="w-full bg-white border border-neutral-200 p-4 text-sm focus:outline-none focus:border-black transition-colors min-h-[120px]"
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        />
                      </div>
                      <Button type="submit" disabled={isReviewLoading} className="w-full h-14 text-[10px] uppercase tracking-widest font-bold">
                        {isReviewLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Submit Anonymous Review
                            </>
                        )}
                      </Button>
                    </form>
                  </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-10">
              {reviews.length === 0 ? (
                <div className="py-12 border-t border-border flex flex-col items-center justify-center text-center">
                  <MessageSquare className="w-8 h-8 text-neutral-200 mb-4" />
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">No reviews yet. Be the first to share your thoughts.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="pt-10 border-t border-border first:border-0 first:pt-0">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-sm font-bold uppercase tracking-widest">{review.name}</h4>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
                          {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={cn("w-3 h-3 fill-current", review.rating >= s ? "text-black" : "text-neutral-200")} />
                        ))}
                      </div>
                    </div>
                    <p className="text-neutral-600 text-sm italic leading-relaxed">"{review.comment}"</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {relatedProducts.length > 0 && (
        <section className="pt-24 border-t border-border">
          <h2 className="text-3xl  mb-12">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => (
              <motion.div
                key={p.id}
                whileHover={{ y: -5 }}
                className="group flex flex-col bg-white border border-border overflow-hidden"
              >
                <a href={`/product/${p.id}`} className="relative aspect-square overflow-hidden">
                  <img
                    src={p.image.includes('/upload/') ? p.image.replace('/upload/', '/upload/f_auto,q_auto/') : p.image}
                    alt={p.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </a>
                <div className="p-6 text-center">
                  <h3 className="text-lg  mb-2">{p.name}</h3>
                  <p className="text-sm font-medium">PKR {p.price}.00</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
