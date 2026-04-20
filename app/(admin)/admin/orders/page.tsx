'use client';

import * as React from 'react';
import { Card, Badge, Button, Input } from '@/components/ui';
import { orders, type Order } from '@/lib/mock-data';
import { Search, Filter, Download, ExternalLink, Eye, Loader2, ChevronDown, Calendar, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ref, onValue, update, remove } from 'firebase/database';
import { database } from '@/lib/firebase';
import { AnimatePresence, motion } from 'motion/react';

const STATUS_OPTIONS = ['All', 'Pending', 'Received', 'Out for Delivery', 'Delivered', 'Cancelled'] as const;

export default function AdminOrdersPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [ordersList, setOrdersList] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = React.useState<string>('All');
  const [statusDropdownOpen, setStatusDropdownOpen] = React.useState(false);
  const [dateRangeOpen, setDateRangeOpen] = React.useState(false);
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');

  const statusRef = React.useRef<HTMLDivElement>(null);
  const dateRef = React.useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (statusRef.current && !statusRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setDateRangeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.entries(data).map(([id, order]: [string, any]) => ({
          dbId: id,
          ...order
        }));
        setOrdersList(formatted.reverse());
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleStatus = async (dbId: string, currentStatus: string) => {
    const statusCycle: Record<string, string> = {
      'Pending': 'Received',
      'Received': 'Out for Delivery',
      'Out for Delivery': 'Delivered',
      'Delivered': 'Pending',
      'Cancelled': 'Pending'
    };
    const newStatus = statusCycle[currentStatus] || 'Pending';
    try {
      await update(ref(database, `orders/${dbId}`), { status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleDeleteOrder = async (dbId: string) => {
    if (window.confirm('Are you sure you want to delete this order? This cannot be undone.')) {
      try {
        await remove(ref(database, `orders/${dbId}`));
      } catch (error) {
        console.error('Failed to delete order:', error);
      }
    }
  };

  // Parse order date string to Date object for comparison
  const parseOrderDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
    return null;
  };

  const filteredOrders = ordersList.filter(o => {
    // Search filter
    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
    
    // Date range filter
    let matchesDate = true;
    if (dateFrom || dateTo) {
      const orderDate = parseOrderDate(o.date);
      if (orderDate) {
        if (dateFrom) {
          const from = new Date(dateFrom);
          from.setHours(0, 0, 0, 0);
          if (orderDate < from) matchesDate = false;
        }
        if (dateTo) {
          const to = new Date(dateTo);
          to.setHours(23, 59, 59, 999);
          if (orderDate > to) matchesDate = false;
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // CSV Export
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;

    const headers = ['Order ID', 'Customer Name', 'Phone', 'Address', 'Items', 'Status', 'Total (PKR)', 'Date'];
    const rows = filteredOrders.map(order => [
      order.id,
      order.customerName,
      order.phone || '',
      `"${(order.address || '').replace(/"/g, '""')}"`,
      `"${(order.items || []).map((i: any) => `${i.name} x${i.quantity}`).join(', ')}"`,
      order.status,
      order.total,
      order.date
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    link.href = url;
    link.download = `hautique-orders-${today}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setSelectedStatus('All');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = selectedStatus !== 'All' || dateFrom || dateTo;

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl  tracking-tight uppercase mb-2">Orders</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Track and manage customer orders and fulfillment.</p>
        </div>
        <Button 
          onClick={handleExportCSV}
          variant="outline" 
          className="w-full sm:w-auto text-[10px] uppercase tracking-widest h-10 px-8"
          disabled={filteredOrders.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 border-none shadow-sm items-start md:items-center">
        <div className="flex-grow" />
        <div className="flex flex-wrap gap-3 items-center">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black transition-colors font-bold flex items-center gap-1 px-3 py-2"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}

          {/* Status Filter */}
          <div ref={statusRef} className="relative">
            <Button 
              variant="outline" 
              className={cn(
                "text-[10px] uppercase tracking-widest h-10 px-6",
                selectedStatus !== 'All' && "bg-black text-white border-black hover:bg-neutral-800 hover:text-white"
              )}
              onClick={() => {
                setStatusDropdownOpen(!statusDropdownOpen);
                setDateRangeOpen(false);
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              {selectedStatus === 'All' ? 'Status' : selectedStatus}
              <ChevronDown className={cn("w-3 h-3 ml-2 transition-transform", statusDropdownOpen && "rotate-180")} />
            </Button>

            <AnimatePresence>
              {statusDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-50 bg-white border border-neutral-100 shadow-xl rounded-lg overflow-hidden min-w-[200px]"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setStatusDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full text-left px-5 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors",
                        selectedStatus === status
                          ? "bg-black text-white"
                          : "text-neutral-500 hover:bg-neutral-50 hover:text-black"
                      )}
                    >
                      {status}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Date Range Filter */}
          <div ref={dateRef} className="relative">
            <Button 
              variant="outline" 
              className={cn(
                "text-[10px] uppercase tracking-widest h-10 px-6",
                (dateFrom || dateTo) && "bg-black text-white border-black hover:bg-neutral-800 hover:text-white"
              )}
              onClick={() => {
                setDateRangeOpen(!dateRangeOpen);
                setStatusDropdownOpen(false);
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              {dateFrom || dateTo ? 'Filtered' : 'Date Range'}
              <ChevronDown className={cn("w-3 h-3 ml-2 transition-transform", dateRangeOpen && "rotate-180")} />
            </Button>

            <AnimatePresence>
              {dateRangeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 z-50 bg-white border border-neutral-100 shadow-xl rounded-lg p-5 min-w-[280px] space-y-4"
                >
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400">From</label>
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] uppercase tracking-[0.2em] font-bold text-neutral-400">To</label>
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => { setDateFrom(''); setDateTo(''); }}
                      className="flex-1 text-[9px] uppercase tracking-widest font-bold py-2 text-neutral-400 hover:text-black transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      onClick={() => setDateRangeOpen(false)}
                      className="flex-1 text-[9px] uppercase tracking-widest font-bold py-2 bg-black text-white rounded-lg hover:bg-neutral-800 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>

      {/* Active Filter Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Filtering:</span>
          {selectedStatus !== 'All' && (
            <span className="bg-neutral-100 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
              {selectedStatus}
              <button onClick={() => setSelectedStatus('All')} className="hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {dateFrom && (
            <span className="bg-neutral-100 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
              From: {dateFrom}
              <button onClick={() => setDateFrom('')} className="hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {dateTo && (
            <span className="bg-neutral-100 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full flex items-center gap-2">
              To: {dateTo}
              <button onClick={() => setDateTo('')} className="hover:text-red-500 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          <span className="text-[10px] text-neutral-400 italic ml-2">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

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
                  {hasActiveFilters && (
                    <button 
                      onClick={clearFilters}
                      className="text-[10px] uppercase tracking-widest text-neutral-400 hover:text-black mt-3 underline underline-offset-4 transition-colors"
                    >
                      Clear all filters
                    </button>
                  )}
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
                      order.status === 'Received' ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                      order.status === 'Out for Delivery' ? 'bg-purple-50 text-purple-700 hover:bg-purple-100' :
                      order.status === 'Cancelled' ? 'bg-red-50 text-red-700 hover:bg-red-100' :
                      'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
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
                    <button
                      onClick={() => handleDeleteOrder((order as any).dbId)}
                      className="h-8 px-3 border border-neutral-200 rounded-md text-neutral-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                      title="Delete order"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
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
