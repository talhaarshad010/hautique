'use client';

import * as React from 'react';
import { Card, Badge, Button, Input } from '@/components/ui';
import { orders, type Order } from '@/lib/mock-data';
import { Search, Filter, Download, ExternalLink, Eye, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ref, onValue, update } from 'firebase/database';
import { database } from '@/lib/firebase';

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [ordersList, setOrdersList] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([id, order]: [string, any]) => ({
          dbId: id,
          ...order
        }));
        // Sort by id (date) descending if possible, or just as is
        setOrdersList(formatted.reverse());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleStatus = async (dbId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Pending' ? 'Delivered' : 'Pending';
    try {
      await update(ref(database, `orders/${dbId}`), { status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const filteredOrders = ordersList.filter(o => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl  tracking-tight uppercase mb-2">Orders</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Track and manage customer orders and fulfillment.</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto text-[10px] uppercase tracking-widest h-10 px-8">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 border-none shadow-sm">
        <div className="flex-grow">
          {/* Internal search removed by user request */}
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="text-[10px] uppercase tracking-widest h-10 px-6">
            <Filter className="w-4 h-4 mr-2" />
            Status
          </Button>
          <Button variant="outline" className="text-[10px] uppercase tracking-widest h-10 px-6">
            Date Range
          </Button>
        </div>
      </Card>

      {/* Orders Table */}
      <div className="bg-white border-none shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50">
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Order ID</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Customer</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Address</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Status</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400">Total</th>
              <th className="px-6 py-4 text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 relative min-h-[200px]">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-200" />
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mt-4">Loading Orders...</p>
                </td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">No orders found</p>
                </td>
              </tr>
            ) : filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-6">
                  <span className="text-sm font-bold uppercase tracking-widest">{order.id}</span>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">{order.date}</p>
                </td>
                <td className="px-6 py-6">
                  <p className="text-sm font-bold uppercase tracking-widest">{order.customerName}</p>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">{order.phone}</p>
                </td>
                <td className="px-6 py-6">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest max-w-[200px] truncate">{order.address}</p>
                </td>
                <td className="px-6 py-6">
                  <button
                    onClick={() => toggleStatus((order as any).dbId, order.status)}
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-all hover:scale-105 active:scale-95",
                      order.status === 'Delivered' ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                      order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' :
                      'bg-red-50 text-red-700 hover:bg-red-100'
                    )}
                  >
                    {order.status}
                  </button>
                </td>
                <td className="px-6 py-6 text-sm ">PKR {order.total}.00</td>
                <td className="px-6 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/orders/${order.id}`}>
                      <Button variant="outline" size="sm" className="h-8 px-4 text-[10px] uppercase tracking-widest font-bold">
                        <Eye className="w-3 h-3 mr-2" />
                        View
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
