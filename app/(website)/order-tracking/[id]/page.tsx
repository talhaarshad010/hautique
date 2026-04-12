"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/app/assets/images/logo.png";
import { Card, Button } from "@/components/ui";
import { products } from "@/lib/mock-data";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  ShoppingBag,
  MapPin,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";
import { Loader2 } from "lucide-react";

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const ordersRef = ref(database, "orders");
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val() as any;
      if (data) {
        const found = Object.values(data).find((o: any) => o.id === orderId);
        setOrder(found || null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-200" />
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mt-4 tracking-[0.3em]">
          Locating Order...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mb-8">
          <ShoppingBag className="w-10 h-10 text-neutral-300" />
        </div>
        <h1 className="text-3xl  mb-4">Order Not Found</h1>
        <p className="text-neutral-500 mb-10 max-w-sm">
          We couldn't find an order with the ID{" "}
          <span className="font-bold text-black">{orderId}</span>. Please check
          your confirmation email and try again.
        </p>
        <Button onClick={() => router.push("/shop")} variant="outline">
          Back to Shop
        </Button>
      </div>
    );
  }

  const steps = [
    {
      label: "Delivered",
      status: "Delivered",
      icon: CheckCircle2,
      desc: "Your fragrance has arrived.",
    },
    {
      label: "Out for Delivery",
      status: "Out for Delivery",
      icon: Truck,
      desc: "Our courier is on the way.",
    },
    {
      label: "Received",
      status: "Received",
      icon: Package,
      desc: "Your order is being prepared.",
    },
    {
      label: "Pending",
      status: "Pending",
      icon: Clock,
      desc: "We have received your order.",
    },
  ];

  return (
    <div className="pt-32 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div>
          <button
            onClick={() => router.push("/shop")}
            className="flex items-center text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-3 h-3 mr-2" />
            Back to Shop
          </button>
          <h1 className="text-5xl  tracking-tight uppercase mb-4">
            Track Order
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-bold uppercase tracking-widest text-neutral-900">
              {order.id}
            </span>
            <span className="w-1 h-1 bg-neutral-300 rounded-full" />
            <span className="text-xs uppercase tracking-widest text-neutral-400">
              Placed on {order.date}
            </span>
          </div>
        </div>
        <div className="px-6 py-2 bg-neutral-50 border border-neutral-100 text-[10px] uppercase tracking-[0.2em] font-bold">
          Current Status:{" "}
          <span className="text-black ml-2 underline decoration-black/20 underline-offset-4">
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Journey Timeline */}
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-neutral-400 mb-10">
              Delivery Progress
            </h2>
            <div className="space-y-0 relative">
              {steps.map((step, idx) => {
                const isCompleted =
                  order.status === step.status ||
                  order.status === "Delivered" ||
                  (order.status === "Out for Delivery" &&
                    step.status !== "Delivered") ||
                  (order.status === "Received" &&
                    (step.status === "Received" || step.status === "Pending"));

                const isCurrent = order.status === step.status;

                return (
                  <div
                    key={idx}
                    className="relative flex gap-8 pb-12 last:pb-0"
                  >
                    {/* Line */}
                    {idx !== steps.length - 1 && (
                      <div
                        className={cn(
                          "absolute left-[17px] top-9 bottom-0 w-[2px]",
                          isCompleted ? "bg-black" : "bg-neutral-100",
                        )}
                      />
                    )}

                    {/* Icon Node */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500",
                        isCurrent
                          ? "bg-black border-black text-white scale-110 shadow-lg"
                          : isCompleted
                            ? "bg-white border-black text-black"
                            : "bg-white border-neutral-100 text-neutral-300",
                      )}
                    >
                      <step.icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div
                      className={cn(
                        "transition-opacity duration-500",
                        !isCompleted && "opacity-30",
                      )}
                    >
                      <h3
                        className={cn(
                          "text-sm font-bold uppercase tracking-widest mb-1",
                          isCurrent && "text-black",
                        )}
                      >
                        {step.label}
                      </h3>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest line-clamp-1">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Order Details */}
          <section className="pt-12 border-t border-neutral-100">
            <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-neutral-400 mb-8">
              Order Summary
            </h2>
            <div className="space-y-6">
              {order.items?.map((item: any, idx: number) => {
                const product = products.find((p) => p.id === item.productId);
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-20 bg-neutral-50 border border-neutral-100 overflow-hidden rounded relative">
                        <img
                          src={
                            product?.image ||
                            "https://picsum.photos/seed/p/200/300"
                          }
                          alt={item.name}
                          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm  uppercase tracking-wider">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm ">
                      PKR {item.price * item.quantity}.00
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 p-8 bg-neutral-50 space-y-4">
              <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">
                <span>Subtotal</span>
                <span className="text-black">
                  PKR {order.total - (order.shippingFee || 0)}.00
                </span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">
                <span>Shipping</span>
                <span
                  className={cn(
                    "text-black",
                    (order.shippingFee || 0) === 0 && "text-green-600",
                  )}
                >
                  {order.shippingFee && order.shippingFee > 0
                    ? `PKR ${order.shippingFee}.00`
                    : "Free"}
                </span>
              </div>
              <div className="pt-4 border-t border-neutral-200 flex justify-between">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black">
                  Grand Total
                </span>
                <span className="text-2xl ">PKR {order.total}.00</span>
              </div>
            </div>
          </section>
        </div>

        {/* Info Column */}
        <div className="space-y-12">
          {/* Shipping To */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">
                Shipping To
              </h2>
            </div>
            <div className="p-6 border border-neutral-100 rounded-sm">
              <p className="text-sm font-bold uppercase tracking-widest mb-3">
                {order.customerName}
              </p>
              <p className="text-xs text-neutral-500 leading-relaxed uppercase tracking-widest">
                {order.address}
              </p>
            </div>
          </section>

          {/* Need Help */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle className="w-4 h-4 text-neutral-400" />
              <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-neutral-400">
                Need Assistance?
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest leading-loose">
                If you have any questions regarding your delivery, please
                contact our concierge service.
              </p>
              <Button
                variant="outline"
                className="w-full text-[10px] uppercase tracking-widest h-12 font-bold hover:bg-black hover:text-white transition-all"
              >
                Contact Concierge
              </Button>
            </div>
          </section>

          {/* Branding Note */}
          <div className="pt-12 text-center opacity-20 hover:opacity-100 transition-opacity">
            <Image src={logo} alt="HAUTIQUE" className="h-14 w-auto mx-auto object-contain invert" />
            <p className="text-[8px] uppercase tracking-[0.5em] mt-3">
              The Art of Scent
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
