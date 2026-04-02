'use client';

import * as React from 'react';
import { Card, cn } from '@/components/ui';
import { orders, products } from '@/lib/mock-data';
import {
  TrendingUp,
  ShoppingBag,
  Users,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue
}: {
  title: string;
  value: string;
  icon: any;
  trend: 'up' | 'down';
  trendValue: string;
}) => (
  <Card className="flex flex-col gap-4">
    <div className="flex justify-between items-start">
      <div className="p-3 bg-neutral-100 rounded-lg">
        <Icon className="w-6 h-6" />
      </div>
      <div className={cn(
        'flex items-center text-xs font-bold',
        trend === 'up' ? 'text-green-600' : 'text-red-600'
      )}>
        {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
        {trendValue}
      </div>
    </div>
    <div>
      <p className="text-xs uppercase tracking-widest text-neutral-400 mb-1">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </Card>
);

export default function DashboardPage() {
  const [ordersList, setOrdersList] = React.useState<any[]>([]);
  const [productsCount, setProductsCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Fetch Orders for Revenue and Order Count
    const ordersRef = ref(database, 'orders');
    const unsubscribeOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setOrdersList(Object.values(data));
      }
    });

    // Fetch Products for count
    const productsRef = ref(database, 'products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProductsCount(Object.keys(data).length);
      }
      setLoading(false);
    });

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
    };
  }, []);

  const totalRevenue = ordersList.reduce((acc, order) => acc + (Number(order.total) || 0), 0);
  const deliveredOrders = ordersList.filter(o => o.status === 'Delivered').length;

  const stats: { title: string; value: string; icon: any; trend: 'up' | 'down'; trendValue: string }[] = [
    { title: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: 'up', trendValue: '+12%' },
    { title: 'Total Orders', value: ordersList.length.toString(), icon: ShoppingBag, trend: 'up', trendValue: '+8%' },
    { title: 'Total Products', value: productsCount.toString(), icon: TrendingUp, trend: 'up', trendValue: '+2%' },
    { title: 'Delivered', value: deliveredOrders.toString(), icon: Users, trend: 'up', trendValue: '+5%' },
  ];

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-serif tracking-tight uppercase mb-2">Executive Overview</h1>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Real-time performance analytics and store activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
      </div>

      {/* Recent Orders */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-serif">Recent Orders</h2>
          <button className="text-xs uppercase tracking-widest font-bold hover:underline">View All</button>
        </div>
        <div className="bg-white border border-border overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-border">
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold">Order ID</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold">Customer</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold">Status</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold">Date</th>
                <th className="px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-200" />
                  </td>
                </tr>
              ) : ordersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-neutral-400 text-xs uppercase tracking-widest font-bold">
                    No orders yet
                  </td>
                </tr>
              ) : ordersList.slice(0, 5).reverse().map((order, idx) => (
                <tr key={idx} className="border-b border-border hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium uppercase tracking-widest">{order.id}</td>
                  <td className="px-6 py-4 text-sm">{order.customerName}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'px-2 py-1 text-[10px] uppercase tracking-wider font-bold rounded',
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-neutral-500">{order.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-right">${order.total}.00</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
