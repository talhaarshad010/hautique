"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Input, Textarea, Card } from "@/components/ui";
import { products } from "@/lib/mock-data";
import { motion } from "motion/react";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import { ref, push, set, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

export default function CheckoutPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [orderId, setOrderId] = React.useState("");
  const { cartItems, cartTotal, clearCart } = useCart();
  const router = useRouter();

  // Promo code state
  const [promoInput, setPromoInput] = React.useState('');
  const [promoDiscount, setPromoDiscount] = React.useState(0);
  const [appliedPromo, setAppliedPromo] = React.useState<{ code: string; discountType: string; discountValue: number } | null>(null);
  const [promoError, setPromoError] = React.useState('');  
  const [promoLoading, setPromoLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    fullName: "",
    email: "",
    phone: "+92 ",
    address: "",
    city: "",
    postalCode: "",
    notes: "",
  });

  const [shipping, setShipping] = React.useState<number>(0);

  React.useEffect(() => {
    const settingsRef = ref(database, "settings/shippingFee");
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (typeof data === "number") {
        setShipping(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const total = cartTotal + shipping - promoDiscount;

  React.useEffect(() => {
    if (cartItems.length === 0 && !isSubmitted) {
      router.push("/shop");
    }
  }, [cartItems, isSubmitted, router]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    let cleaned = input.replace(/[^\d+]/g, "");

    // Handle starting with 0
    if (cleaned.startsWith("0")) {
      cleaned = "+92" + cleaned.substring(1);
    } else if (!cleaned.startsWith("+") && cleaned.length > 0) {
      // Handle user just typing digits like 311...
      if (cleaned.startsWith("92")) {
        cleaned = "+" + cleaned;
      } else {
        cleaned = "+92" + cleaned;
      }
    }

    // Lock the prefix "+92"
    if (cleaned.length < 3 || cleaned === "+92") {
      setFormData({ ...formData, phone: "+92 " });
      return;
    }

    const digits = cleaned.replace(/\D/g, "");
    let formatted = cleaned;

    if (digits.startsWith("92")) {
      const network = digits.substring(2, 5);
      const remainder = digits.substring(5, 12);

      formatted = "+92";
      if (network) formatted += " " + network;
      if (remainder) formatted += " " + remainder;
    }

    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setSubmitting(true);
    try {
      const ordersRef = ref(database, "orders");
      const newOrderRef = push(ordersRef);
      const generatedId = `ORD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const newOrder = {
        id: generatedId,
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: `${formData.address}, ${formData.city}, ${formData.postalCode}`,
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.selectedSize || "Standard",
          image: item.image,
        })),
        total: total,
        shippingFee: shipping,
        promoCode: appliedPromo?.code || null,
        promoDiscount: promoDiscount || 0,
        status: "Pending",
        date: new Date().toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        }),
        notes: formData.notes,
      };

      await set(newOrderRef, newOrder);

      // Send Admin Notification via ntfy
      try {
        const topic =
          process.env.NEXT_PUBLIC_NTFY_TOPIC || "hautique_admin_alerts";
        await fetch(`https://ntfy.sh/${topic}`, {
          method: "POST",
          body: `New order #${generatedId} from ${formData.fullName} for PKR ${total}.00`,
          headers: {
            Title: "New Hautique Order!",
            Tags: "package,moneybag",
            Click: `${window.location.origin}/admin/orders/${generatedId}`,
          },
        });
      } catch (notifyError) {
        console.error("Failed to push admin notification:", notifyError);
      }

      // Save order to local history
      const savedOrders = JSON.parse(
        localStorage.getItem("hautique_recent_orders") || "[]",
      );
      if (!savedOrders.includes(generatedId)) {
        localStorage.setItem(
          "hautique_recent_orders",
          JSON.stringify([generatedId, ...savedOrders].slice(0, 5)),
        );
      }

      setOrderId(generatedId);
      setIsSubmitted(true);
      clearCart();
    } catch (error) {
      console.error("Order submission failed:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen pt-12 px-6 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <CheckCircle2 className="w-20 h-20 text-black mb-8 mx-auto" />
          <h1 className="text-4xl  mb-4">Order Placed Successfully</h1>
          <p className="text-neutral-500 mb-10 max-w-md mx-auto">
            Thank you for choosing Hautique. Your order{" "}
            <span className="font-bold text-black">#{orderId}</span> has been
            received and is being processed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={`/order-tracking/${orderId}`}>
              <Button size="lg" className="px-10">
                Track My Order
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg" className="px-10">
                Return to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto"
    >
      <div className="flex items-center gap-4 mb-12">
        <Link href="/cart" className="hover:opacity-60 transition-opacity">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-4xl ">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Shipping Form */}
        <form onSubmit={handleSubmit} className="space-y-10">
          <section>
            <h2 className="text-xl  mb-6 uppercase tracking-widest text-neutral-400">
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold">
                  Full Name *
                </label>
                <Input
                  required
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold">
                  Email Address *
                </label>
                <Input
                  required
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest font-bold">
                  Phone Number *
                </label>
                <Input
                  required
                  type="tel"
                  placeholder="+92 000 0000000"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={16}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl  mb-6 uppercase tracking-widest text-neutral-400">
              Shipping Address
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold">
                  Address
                </label>
                <Input
                  placeholder="123 Luxury Lane"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold">
                    City
                  </label>
                  <Input
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold">
                    Postal Code
                  </label>
                  <Input
                    placeholder="10001"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl  mb-6 uppercase tracking-widest text-neutral-400">
              Additional Information
            </h2>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold">
                Order Notes (Optional)
              </label>
              <Textarea
                placeholder="Special instructions for delivery..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </div>
          </section>

          <section>
            <h2 className="text-xl  mb-6 uppercase tracking-widest text-neutral-400">
              Payment Method
            </h2>
            <div className="p-6 border border-black bg-neutral-50 flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-4 h-4 rounded-full border-4 border-black" />
                <span className="font-medium">Cash on Delivery (COD)</span>
              </div>
              <span className="text-[10px] uppercase tracking-widest text-neutral-500">
                Standard
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold">
                Coupon Code
              </label>
              {appliedPromo ? (
                <div className="flex items-center justify-between bg-green-50 border border-green-200 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-700 uppercase tracking-widest">{appliedPromo.code}</span>
                    <span className="text-[10px] text-green-600 uppercase tracking-widest">
                      {appliedPromo.discountType === 'percentage' ? `${appliedPromo.discountValue}% Off` : `PKR ${appliedPromo.discountValue} Off`}
                    </span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setAppliedPromo(null); setPromoDiscount(0); setPromoInput(''); setPromoError(''); }}
                    className="text-[10px] uppercase tracking-widest font-bold text-red-500 hover:text-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Enter code (e.g. HAUTIQUE10)" 
                      value={promoInput}
                      onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                      className="uppercase tracking-widest font-bold"
                    />
                    <Button 
                      variant="outline" 
                      type="button" 
                      className="shrink-0"
                      disabled={promoLoading || !promoInput}
                      onClick={async () => {
                        if (!promoInput) return;
                        setPromoLoading(true);
                        setPromoError('');
                        try {
                          const promoRef = ref(database, 'settings/promoCodes');
                          const unsubscribe = onValue(promoRef, (snapshot) => {
                            const data = snapshot.val();
                            unsubscribe();
                            if (!data) {
                              setPromoError('Invalid promo code.');
                              setPromoLoading(false);
                              return;
                            }
                            const codes = Object.values(data) as any[];
                            const match = codes.find((c: any) => c.code === promoInput && c.active);
                            if (!match) {
                              setPromoError('Invalid or expired promo code.');
                              setPromoLoading(false);
                              return;
                            }
                            // Calculate discount
                            let discount = 0;
                            if (match.discountType === 'percentage') {
                              discount = Math.round(cartTotal * match.discountValue / 100);
                            } else {
                              discount = Math.min(match.discountValue, cartTotal);
                            }
                            setPromoDiscount(discount);
                            setAppliedPromo({ code: match.code, discountType: match.discountType, discountValue: match.discountValue });
                            setPromoLoading(false);
                          });
                        } catch (err) {
                          setPromoError('Failed to validate code.');
                          setPromoLoading(false);
                        }
                      }}
                    >
                      {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                    </Button>
                  </div>
                  {promoError && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">{promoError}</p>
                  )}
                </>
              )}
            </div>
          </section>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting || cartItems.length === 0}
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin mx-auto text-white" />
            ) : (
              "Confirm Order"
            )}
          </Button>
        </form>

        {/* Order Summary */}
        <div className="w-full">
          <Card className="sticky top-32 bg-neutral-50 border-none">
            <h2 className="text-xl  mb-8 border-b border-border pb-4">
              Your Order
            </h2>
            <div className="space-y-6 mb-8">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 bg-white border border-border overflow-hidden rounded">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute -top-1 -right-1 bg-black text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm ">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
                          {item.category}
                        </p>
                        {item.selectedSize && (
                          <span className="text-[10px] text-black font-bold uppercase tracking-widest px-2 py-0.5 bg-neutral-100 rounded-full">
                            {item.selectedSize}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium">
                    PKR {item.price * item.quantity}.00
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Subtotal</span>
                <span>PKR {cartTotal}.00</span>
              </div>
              {promoDiscount > 0 && appliedPromo && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    Discount ({appliedPromo.code})
                  </span>
                  <span className="text-green-600 font-medium">- PKR {promoDiscount}.00</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                  {shipping === 0 ? 'Free' : `PKR ${shipping}.00`}
                </span>
              </div>
              <div className="pt-4 border-t border-border flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>PKR {total}.00</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-white border border-border text-[10px] leading-relaxed text-neutral-500 uppercase tracking-widest text-center">
              By placing your order, you agree to Hautique&apos;s Terms of
              Service and Privacy Policy.
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
