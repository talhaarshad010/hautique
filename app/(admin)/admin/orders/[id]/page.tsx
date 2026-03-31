'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { orders, type Order } from '@/lib/mock-data';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  User, 
  MapPin, 
  Phone, 
  Mail,
  Printer,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import Image from 'next/image';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const order = orders.find(o => o.id === orderId);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h1 className="text-2xl font-serif">Order Not Found</h1>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-[10px] uppercase tracking-[0.2em] text-neutral-400 hover:text-black transition-colors mb-4"
          >
            <ArrowLeft className="w-3 h-3 mr-2" />
            Back to Orders
          </button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-serif tracking-tight uppercase">Order {order.id}</h1>
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full",
              order.status === 'Delivered' ? 'bg-green-50 text-green-700' :
              order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700' :
              'bg-red-50 text-red-700'
            )}>
              {order.status}
            </span>
          </div>
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Placed on {order.date}</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none text-[10px] uppercase tracking-widest h-10 px-6">
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
          <Button className="flex-1 md:flex-none text-[10px] uppercase tracking-widest h-10 px-8 bg-black text-white hover:bg-neutral-800">
            Fulfill Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold">Order Items</h2>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400">3 Items</span>
            </div>
            <div className="divide-y divide-neutral-100">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-6 flex items-center gap-6">
                  <div className="relative w-20 h-24 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                    <Image 
                      src={`https://picsum.photos/seed/prod${item}/200/300`} 
                      alt="Product" 
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1">Premium Leather Bag</h3>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Category: Accessories • Size: Medium</p>
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-serif text-neutral-500">$299.00 x 1</p>
                      <p className="text-sm font-serif font-bold">$299.00</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 bg-neutral-50 space-y-3">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500">
                <span>Subtotal</span>
                <span>$897.00</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500">
                <span>Shipping</span>
                <span>$25.00</span>
              </div>
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500">
                <span>Tax (10%)</span>
                <span>$89.70</span>
              </div>
              <div className="pt-3 border-t border-neutral-200 flex justify-between text-sm font-bold uppercase tracking-[0.2em]">
                <span>Total</span>
                <span className="font-serif text-lg">${order.total}.00</span>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6 border-none shadow-sm">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-8">Order Timeline</h2>
            <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-neutral-100">
              {[
                { status: 'Delivered', date: 'Oct 24, 2023 14:30', icon: CheckCircle2, color: 'text-green-500' },
                { status: 'Out for Delivery', date: 'Oct 24, 2023 09:15', icon: Truck, color: 'text-blue-500' },
                { status: 'In Transit', date: 'Oct 23, 2023 18:45', icon: Package, color: 'text-neutral-400' },
                { status: 'Order Processed', date: 'Oct 23, 2023 10:20', icon: Clock, color: 'text-neutral-400' },
              ].map((step, idx) => (
                <div key={idx} className="flex gap-6 relative">
                  <div className={cn(
                    "w-9 h-9 rounded-full bg-white border border-neutral-100 flex items-center justify-center z-10 shadow-sm",
                    step.color
                  )}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase tracking-widest">{step.status}</p>
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">{step.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Customer Info */}
        <div className="space-y-8">
          {/* Customer Profile */}
          <Card className="p-6 border-none shadow-sm">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-6">Customer Profile</h2>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                <User className="w-6 h-6 text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-bold uppercase tracking-widest">{order.customerName}</p>
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Customer since 2022</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-neutral-500">
                <Mail className="w-4 h-4" />
                <span className="text-xs">customer@example.com</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500">
                <Phone className="w-4 h-4" />
                <span className="text-xs">{order.phone}</span>
              </div>
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-6 border-none shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold">Shipping Address</h2>
              <MapPin className="w-4 h-4 text-neutral-400" />
            </div>
            <p className="text-xs text-neutral-600 leading-relaxed uppercase tracking-widest">
              {order.address}<br />
              New York, NY 10001<br />
              United States
            </p>
          </Card>

          {/* Payment Info */}
          <Card className="p-6 border-none shadow-sm">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-6">Payment Information</h2>
            <div className="p-4 bg-neutral-50 rounded space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">Method</span>
                <span className="text-xs font-bold uppercase tracking-widest">Visa •••• 4242</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400">Status</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-green-600">Paid</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
