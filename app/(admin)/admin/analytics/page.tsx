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
  Users, 
  ShoppingBag, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Zap,
  Globe,
  Star
} from 'lucide-react';
import { Button, Card, cn } from '@/components/ui';

const revenueData = [
  { day: '01', value: 25000, type: 'indirect' },
  { day: '02', value: 35000, type: 'indirect' },
  { day: '03', value: 30000, type: 'indirect' },
  { day: '04', value: 45000, type: 'indirect' },
  { day: '05', value: 65000, type: 'direct' },
  { day: '06', value: 55000, type: 'indirect' },
  { day: '07', value: 48000, type: 'indirect' },
  { day: '08', value: 72000, type: 'direct' },
  { day: '09', value: 58000, type: 'indirect' },
  { day: '10', value: 42000, type: 'indirect' },
  { day: '11', value: 50000, type: 'indirect' },
  { day: '12', value: 68000, type: 'indirect' },
];

const liquidityData = [
  { name: 'Sold', value: 74 },
  { name: 'Remaining', value: 26 },
];

const regionalData = [
  { id: '01', city: 'PARIS, FRANCE', revenue: '$84,200', status: 'TOP MARKET', statusColor: 'text-green-600' },
  { id: '02', city: 'LONDON, UK', revenue: '$62,150', status: 'STABLE', statusColor: 'text-neutral-400' },
  { id: '03', city: 'NEW YORK, USA', revenue: '$59,800', status: '+4% SHIFT', statusColor: 'text-green-600' },
];

const StatCard = ({ title, value, change, trend, description }: any) => (
  <Card className="p-8 border-none shadow-sm bg-white">
    <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-6 font-bold">{title}</p>
    <h3 className="text-3xl font-serif mb-2">{value}</h3>
    <div className="flex items-center gap-2">
      <span className={cn(
        "text-[10px] font-bold uppercase tracking-widest",
        trend === 'up' ? "text-green-600" : trend === 'down' ? "text-red-600" : "text-neutral-400"
      )}>
        {change}
      </span>
      <span className="text-[10px] text-neutral-400 uppercase tracking-widest">{description}</span>
    </div>
  </Card>
);

export default function AnalyticsPage() {
  return (
    <div className="space-y-10 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-serif tracking-tight uppercase mb-2">Analytics Overview</h1>
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Performance data for the last 30 business days</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="text-[10px] uppercase tracking-widest h-10 px-6">
            <Download className="w-3 h-3 mr-2" />
            Export Report
          </Button>
          <Button size="sm" className="text-[10px] uppercase tracking-widest h-10 px-6 bg-black text-white">
            Q3 Strategy
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value="$248,500.00" 
          change="+12.4%" 
          trend="up" 
          description="vs prev. month" 
        />
        <StatCard 
          title="Conversion Rate" 
          value="4.82%" 
          change="+0.5%" 
          trend="up" 
          description="vs prev. month" 
        />
        <StatCard 
          title="Avg Order Value" 
          value="$182.00" 
          change="Stable" 
          trend="neutral" 
          description="Performance" 
        />
        <StatCard 
          title="Active Users" 
          value="12.4K" 
          change="+2.1%" 
          trend="up" 
          description="New growth" 
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity */}
        <Card className="lg:col-span-2 p-8 border-none shadow-sm bg-white">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-xl font-serif uppercase tracking-tight mb-1">Revenue Velocity</h3>
              <p className="text-[10px] uppercase tracking-widest text-neutral-400">Daily transactional volume in USD</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-black" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Direct Sales</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{ border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', borderRadius: '0px' }}
                />
                <Bar dataKey="value" radius={[0, 0, 0, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'direct' ? '#000000' : '#d4d4d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Growth Index & Liquidity */}
        <div className="space-y-6">
          <Card className="p-8 border-none shadow-sm bg-neutral-100">
            <h3 className="text-xl font-serif uppercase tracking-tight mb-8">Growth Index</h3>
            <div className="space-y-8">
              {[
                { label: 'Organic Search', value: 65 },
                { label: 'Direct Traffic', value: 22 },
                { label: 'Referral', value: 13 },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
                    <span>{item.label}</span>
                    <span>{item.value}%</span>
                  </div>
                  <div className="h-1 bg-neutral-200 w-full">
                    <div className="h-full bg-black" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-12 border-t border-neutral-200">
              <h4 className="text-[10px] uppercase tracking-widest font-bold mb-6">Inventory Liquidity</h4>
              <div className="flex items-center justify-center relative h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={liquidityData}
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
                      <Cell fill="#ffffff" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-serif">74%</span>
                  <span className="text-[8px] uppercase tracking-widest text-neutral-400">Sold Through</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Exclusivity */}
        <Card className="p-8 border-none shadow-sm bg-black text-white relative overflow-hidden flex flex-col justify-between min-h-[400px]">
          <div className="relative z-10">
            <h3 className="text-3xl font-serif uppercase leading-tight mb-4">Member<br />Exclusivity</h3>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold">Loyalty Tier Performance</p>
          </div>
          
          <div className="relative z-10">
            <div className="text-6xl font-serif mb-2">1,240</div>
            <p className="text-[10px] uppercase tracking-widest font-bold">New Tier-1 Signups This Week</p>
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
            <h3 className="text-xl font-serif uppercase tracking-tight">Regional Performance</h3>
            <button className="text-[10px] uppercase tracking-widest font-bold border-b border-black pb-1">View Global Map</button>
          </div>

          <div className="space-y-0">
            {regionalData.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-6 border-t border-neutral-100">
                <div className="flex items-center gap-8">
                  <span className="text-[10px] font-bold text-neutral-300">{item.id}</span>
                  <span className="text-xs font-bold uppercase tracking-widest">{item.city}</span>
                </div>
                <div className="text-right">
                  <div className="text-lg font-serif mb-1">{item.revenue}</div>
                  <div className={cn("text-[8px] uppercase tracking-widest font-bold", item.statusColor)}>
                    {item.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Footer Branding */}
      <div className="pt-20 pb-10 border-t border-neutral-100 text-center">
        <h2 className="text-2xl font-serif tracking-[0.3em] mb-6">L&apos;ESSENCE</h2>
        <p className="text-[8px] uppercase tracking-widest text-neutral-400 mb-8">
          © 2024 L&apos;ESSENCE MONOLITH. SYSTEM AUTHENTICATED. ANALYTICS ENGINE V2.4
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
