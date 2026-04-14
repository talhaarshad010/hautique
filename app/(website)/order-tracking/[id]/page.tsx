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
    <div className="pt-12 pb-24 px-6 md:px-12 max-w-6xl mx-auto">
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
                const imageUrl = item.image || product?.image || "https://picsum.photos/seed/p/200/300";
                
                return (
                  <div
                    key={idx}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-20 bg-neutral-50 border border-neutral-100 overflow-hidden rounded relative">
                        <img
                          src={
                            imageUrl.includes("/upload/")
                              ? imageUrl.replace("/upload/", "/upload/f_auto,q_auto/")
                              : imageUrl
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
              <a 
                href="https://wa.me/923197780890" 
                target="_blank" 
                rel="noreferrer"
                className="block"
              >
                <Button
                  variant="outline"
                  className="w-full text-[10px] uppercase tracking-widest h-12 font-bold hover:bg-green-600 hover:text-white hover:border-green-600 transition-all flex items-center justify-center gap-2"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    className="w-4 h-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp Assistance
                </Button>
              </a>
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
