'use client';

import * as React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Download,
  Package,
  Star,
  Loader2,
  Clock,
  CheckCircle2,
  Truck
} from 'lucide-react';
import { Button, Card, cn } from '@/components/ui';
import { useAnalytics, type Period } from '@/hooks/useAnalytics';

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'All Time', value: 'all' },
];

const StatCard = ({ title, value, icon: Icon }: { title: string; value: string; icon: any }) => (
  <Card className="p-8 border-none shadow-sm bg-white">
    <div className="flex items-center justify-between mb-6">
      <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">{title}</p>
      <div className="p-2 bg-neutral-100 rounded-lg">
        <Icon className="w-4 h-4 text-neutral-500" />
      </div>
    </div>
    <h3 className="text-3xl font-serif">{value}</h3>
  </Card>
);

export default function AnalyticsPage() {
  const [period, setPeriod] = React.useState<Period>('all');
  const data = useAnalytics(period);

  if (data.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-neutral-300" />
        <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">Loading Analytics...</p>
      </div>
    );
  }

  // Prepare donut chart data
  const deliveryData = [
    { name: 'Delivered', value: data.deliveryRate },
    { name: 'Remaining', value: 100 - data.deliveryRate },
  ];

  return (
    <div className="space-y-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif tracking-tight uppercase mb-2">Analytics Overview</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">
            Live performance data from your store
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Period Filter */}
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={cn(
                "text-[10px] uppercase tracking-widest font-bold h-10 px-5 transition-all border",
                period === opt.value
                  ? "bg-black text-white border-black"
                  : "bg-white text-neutral-400 border-neutral-200 hover:border-neutral-400"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`PKR ${data.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard 
          title="Total Orders" 
          value={data.totalOrders.toString()}
          icon={ShoppingBag}
        />
        <StatCard 
          title="Avg Order Value" 
          value={`PKR ${data.avgOrderValue.toLocaleString()}`}
          icon={TrendingUp}
        />
        <StatCard 
          title="Total Products" 
          value={data.totalProducts.toString()}
          icon={Package}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity */}
        <Card className="lg:col-span-2 p-8 border-none shadow-sm bg-white">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-serif uppercase tracking-tight mb-1">Revenue Velocity</h3>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Daily transactional volume in PKR</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-black" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Revenue</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            {data.revenueByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.revenueByDay} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a3a3a3' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#a3a3a3' }}
                    tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(0)}k` : value.toString()}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f5f5f5' }}
                    contentStyle={{ border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', borderRadius: '0px', fontSize: '12px' }}
                    formatter={(value: any) => [`PKR ${Number(value || 0).toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                    {data.revenueByDay.map((_, index) => (
                      <Cell key={`cell-${index}`} fill="#000000" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">No revenue data for this period</p>
              </div>
            )}
          </div>
        </Card>

        {/* Category Breakdown & Delivery Rate */}
        <div className="space-y-6">
          <Card className="p-8 border-none shadow-sm bg-neutral-100">
            <h3 className="text-xl font-serif uppercase tracking-tight mb-8">Category Mix</h3>
            <div className="space-y-8">
              {data.categoryBreakdown.length > 0 ? (
                data.categoryBreakdown.map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                      <span>{item.label}</span>
                      <span>{item.percentage}% ({item.count})</span>
                    </div>
                    <div className="h-1 bg-neutral-200 w-full">
                      <div className="h-full bg-black transition-all duration-700" style={{ width: `${item.percentage}%` }} />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold text-center py-4">No products yet</p>
              )}
            </div>

            <div className="mt-12 pt-12 border-t border-neutral-200">
              <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6">Delivery Rate</h4>
              <div className="flex items-center justify-center relative h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deliveryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={0}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#000000" />
                      <Cell fill="#e5e5e5" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-serif">{data.deliveryRate}%</span>
                  <span className="text-[8px] uppercase tracking-widest text-neutral-400">Delivered</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Summary */}
        <Card className="p-8 border-none shadow-sm bg-black text-white relative overflow-hidden flex flex-col justify-between min-h-[400px]">
          <div className="relative z-10">
            <h3 className="text-3xl font-serif uppercase leading-tight mb-4">Order<br />Status</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Current Order Pipeline</p>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-yellow-400" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Pending</span>
              </div>
              <span className="text-2xl font-serif">{data.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Delivered</span>
              </div>
              <span className="text-2xl font-serif">{data.deliveredOrders}</span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-700 pt-4">
              <div className="flex items-center gap-3">
                <Truck className="w-4 h-4 text-white" />
                <span className="text-[10px] uppercase tracking-widest font-bold">Total Orders</span>
              </div>
              <span className="text-2xl font-serif">{data.totalOrders}</span>
            </div>
          </div>

          {/* Decorative Stars */}
          <div className="absolute bottom-10 right-10 opacity-20">
            <Star className="w-20 h-20 fill-white" />
          </div>
          <div className="absolute bottom-24 right-24 opacity-10">
            <Star className="w-12 h-12 fill-white" />
          </div>
        </Card>

        {/* Regional Performance */}
        <Card className="lg:col-span-2 p-8 border-none shadow-sm bg-white">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-serif uppercase tracking-tight">City Performance</h3>
            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
              Top {data.topCities.length} cities
            </span>
          </div>

          <div className="space-y-0">
            {data.topCities.length > 0 ? (
              data.topCities.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between py-6 border-t border-neutral-100">
                  <div className="flex items-center gap-8">
                    <span className="text-[10px] font-bold text-neutral-300">{item.id}</span>
                    <span className="text-xs font-bold uppercase tracking-widest">{item.city}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-serif mb-1">PKR {item.revenue.toLocaleString()}</div>
                    <div className={cn(
                      "text-[8px] uppercase tracking-widest font-bold",
                      idx === 0 ? "text-green-600" : "text-neutral-400"
                    )}>
                      {idx === 0 ? "TOP CITY" : `${item.orderCount} ORDERS`}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold">No regional data available</p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Products Table */}
      {data.topProducts.length > 0 && (
        <Card className="p-8 border-none shadow-sm bg-white">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-serif uppercase tracking-tight">Top Selling Products</h3>
            <span className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
              By quantity sold
            </span>
          </div>
          <div className="space-y-0">
            {data.topProducts.map((product, idx) => (
              <div key={product.name} className="flex items-center justify-between py-5 border-t border-neutral-100">
                <div className="flex items-center gap-6">
                  <span className="text-[10px] font-bold text-neutral-300 w-6">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-widest">{product.name}</span>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest font-bold text-neutral-400">
                      {product.quantitySold} sold
                    </div>
                  </div>
                  <div className="text-right min-w-[120px]">
                    <div className="text-sm font-serif">PKR {product.revenue.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Footer Branding */}
      <div className="pt-20 pb-10 border-t border-neutral-100 text-center">
        <h2 className="text-2xl font-serif tracking-[0.3em] mb-6">HAUTIQUE</h2>
        <p className="text-[8px] uppercase tracking-widest text-neutral-400 mb-8">
          © 2024 HAUTIQUE. SYSTEM AUTHENTICATED. ANALYTICS ENGINE V3.0
        </p>
        <div className="flex justify-center gap-8 text-[8px] uppercase tracking-widest font-bold text-neutral-400">
          <button className="hover:text-black transition-colors">Privacy</button>
          <button className="hover:text-black transition-colors">Security Logs</button>
          <button className="hover:text-black transition-colors">Terminal</button>
        </div>
      </div>
    </div>
  );
}
