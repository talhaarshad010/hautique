'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@/components/ui';
import { orders, products, type Order } from '@/lib/mock-data';
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
  MoreVertical,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import Image from 'next/image';
import { Loader2, Edit2, Check, X } from 'lucide-react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isEditingShipping, setIsEditingShipping] = React.useState(false);
  const [newShipping, setNewShipping] = React.useState(0);
  const [dbKey, setDbKey] = React.useState('');

  React.useEffect(() => {
    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val() as any;
      if (data) {
        const foundArr = Object.entries(data) as [string, any][];
        const found = foundArr.find(([key, o]) => o.id === orderId);
        if (found) {
          setDbKey(found[0]);
          setOrder(found[1]);
          setNewShipping(found[1].shippingFee || 0);
        }
      }
      setLoading(false);
    });

  }, [orderId]);

  const updateStatus = async (newStatus: string) => {
    if (!dbKey) return;
    try {
      await update(ref(database, `orders/${dbKey}`), { status: newStatus });
    } catch (error) {
      console.error("Status update failed:", error);
    }
  };

  const saveShipping = async () => {
    if (!dbKey || !order) return;
    const subtotal = order.total - (order.shippingFee || 0);
    const updatedTotal = subtotal + Number(newShipping);
    try {
      await update(ref(database, `orders/${dbKey}`), { 
        shippingFee: Number(newShipping),
        total: updatedTotal
      });
      setIsEditingShipping(false);
    } catch (error) {
      console.error("Shipping update failed:", error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const sendWhatsAppUpdate = () => {
    if (!order) return;
    
    const trackingLink = `${window.location.origin}/order-tracking/${order.id}`;
    const message = `*HAUTIQUE - Luxury Fragrances*%0A%0Ahello, *${order.customerName}*%0A%0AWe have an update on your order *${order.id}*.%0A%0A*Status:* ${order.status}%0A*Total:* PKR ${order.total}.00%0A%0A*Items:*%0A${order.items?.map((item: any) => `- ${item.name} (${item.size || 'Standard'}) (x${item.quantity})`).join('%0A')}%0A%0AYou can track your real-time journey here:%0A${trackingLink}%0A%0AThank you for choosing Hautique.`;
    
    // Clean phone number (remove spaces, etc)
    const phone = order.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-200" />
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mt-4">Retrieving Order Details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h1 className="text-2xl ">Order Not Found</h1>
        <p className="text-neutral-400 text-xs uppercase tracking-widest">The order ID {orderId} does not exist in our records.</p>
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
            <h1 className="text-4xl  tracking-tight uppercase">Order {order.id}</h1>
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
        <div className="flex gap-3 w-full md:w-auto print:hidden">
          <Button 
            onClick={handlePrint}
            variant="outline" 
            className="flex-1 md:flex-none text-[10px] uppercase tracking-widest h-10 px-6"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Invoice
          </Button>
          
          <div className="relative group flex-1 md:flex-none">
            <Button className="w-full text-[10px] uppercase tracking-widest h-10 px-8 bg-black text-white hover:bg-neutral-800">
              Update Status
            </Button>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              {['Pending', 'Received', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  className="w-full text-left px-4 py-3 text-[10px] uppercase tracking-widest hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-0 font-bold"
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Items & Timeline */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Items */}
          <Card className="border-none shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center">
              <h2 className="text-xs uppercase tracking-[0.2em] font-bold">Order Items</h2>
              <span className="text-[10px] uppercase tracking-widest text-neutral-400">{order.items?.length || 0} Items</span>
            </div>
            <div className="divide-y divide-neutral-100">
              {order.items?.map((item: any, idx: number) => {
                // Find the product image from our mock data or use a fallback
                const imageUrl = item.image || products.find(p => p.id === item.productId)?.image || 'https://picsum.photos/seed/perfume/200/300';
                
                return (
                  <div key={idx} className="p-6 flex items-center gap-6">
                    <div className="relative w-20 h-24 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={imageUrl.includes('/upload/') ? imageUrl.replace('/upload/', '/upload/f_auto,q_auto/') : imageUrl}
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-sm font-bold uppercase tracking-widest">{item.name}</h3>
                        {item.size && <span className="text-[10px] bg-neutral-100 text-black px-2 py-0.5 rounded-full font-bold">{item.size}</span>}
                      </div>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Quantity: {item.quantity}</p>
                      <div className="flex justify-between items-end">
                        <p className="text-xs  text-neutral-500">PKR {item.price}.00 x {item.quantity}</p>
                        <p className="text-sm  font-bold">PKR {item.price * item.quantity}.00</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-6 bg-neutral-50 space-y-3">
              <div className="flex justify-between text-[10px] uppercase tracking-widest text-neutral-500">
                <span>Subtotal</span>
                <span>PKR {order.total - (order.shippingFee || 0)}.00</span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-neutral-500">
                <span>Shipping</span>
                {isEditingShipping ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={newShipping}
                      onChange={(e) => setNewShipping(Number(e.target.value))}
                      className="w-20 px-2 py-1 border border-border text-xs focus:outline-none focus:border-black"
                    />
                    <button onClick={saveShipping} className="text-green-600 p-1 hover:bg-green-50 rounded"><Check className="w-3 h-3" /></button>
                    <button onClick={() => setIsEditingShipping(false)} className="text-red-600 p-1 hover:bg-red-50 rounded"><X className="w-3 h-3" /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group/ship">
                    <span>PKR {order.shippingFee || 0}.00</span>
                    <button 
                      onClick={() => setIsEditingShipping(true)}
                      className="opacity-0 group-hover/ship:opacity-100 transition-opacity p-1 text-neutral-400 hover:text-black print:hidden"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="pt-3 border-t border-neutral-200 flex justify-between text-sm font-bold uppercase tracking-[0.2em]">
                <span>Total</span>
                <span className=" text-lg">PKR {order.total}.00</span>
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6 border-none shadow-sm print:hidden">
            <h2 className="text-xs uppercase tracking-[0.2em] font-bold mb-8">Order Journey</h2>
            <div className="space-y-8 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-px before:bg-neutral-100">
              {[
                { label: 'Delivered', status: 'Delivered', icon: CheckCircle2 },
                { label: 'Out for Delivery', status: 'Out for Delivery', icon: Truck },
                { label: 'Received', status: 'Received', icon: Package },
                { label: 'Pending', status: 'Pending', icon: Clock },
              ].map((step, idx) => {
                const isCompleted = order.status === step.status || 
                  (order.status === 'Delivered') ||
                  (order.status === 'Out for Delivery' && step.status !== 'Delivered') ||
                  (order.status === 'Received' && (step.status === 'Received' || step.status === 'Pending'));
                
                const isCurrent = order.status === step.status;

                return (
                  <div key={idx} className={cn("flex gap-6 relative", !isCompleted && "opacity-40")}>
                    <div className={cn(
                      "w-9 h-9 rounded-full bg-white border flex items-center justify-center z-10 shadow-sm",
                      isCurrent ? "border-black text-black scale-110" : isCompleted ? "border-neutral-200 text-neutral-600" : "border-neutral-100 text-neutral-300"
                    )}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={cn("text-sm font-bold uppercase tracking-widest", isCurrent && "text-black")}>{step.label}</p>
                      {isCurrent && <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">Current Status</p>}
                    </div>
                  </div>
                );
              })}
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
                <span className="text-xs">{(order as any).email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-neutral-500">
                <Phone className="w-4 h-4" />
                <span className="text-xs">{order.phone}</span>
              </div>
              
              <Button 
                onClick={sendWhatsAppUpdate}
                variant="outline" 
                className="w-full mt-4 text-[10px] uppercase tracking-widest h-10 font-bold border-green-600/20 text-green-700 hover:bg-green-50 hover:text-green-800 transition-all group"
              >
                <MessageSquare className="w-3 h-3 mr-2 group-hover:scale-110 transition-transform" />
                Notify on WhatsApp
              </Button>
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

        </div>
      </div>
    </div>
  );
}
