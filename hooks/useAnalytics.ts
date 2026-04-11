import { useState, useEffect, useMemo } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "@/lib/firebase";

// ---------- Types ----------

export type Period = "7d" | "30d" | "all";

interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  size?: string;
}

interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  items: OrderItem[];
  total: number;
  shippingFee: number;
  status: string;
  date: string;
  notes?: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  image: string;
  description?: string;
  createdAt?: string;
}

export interface DailyRevenue {
  day: string;       // e.g. "Apr 01"
  value: number;
  orderCount: number;
}

export interface CategoryBreakdown {
  label: string;
  count: number;
  percentage: number;
}

export interface CityPerformance {
  id: string;
  city: string;
  revenue: number;
  orderCount: number;
}

export interface TopProduct {
  name: string;
  quantitySold: number;
  revenue: number;
}

export interface AnalyticsData {
  // Loading
  loading: boolean;

  // Stat cards
  totalRevenue: number;
  totalOrders: number;
  avgOrderValue: number;
  totalProducts: number;
  deliveredOrders: number;
  pendingOrders: number;
  deliveryRate: number;

  // Charts
  revenueByDay: DailyRevenue[];
  categoryBreakdown: CategoryBreakdown[];
  topCities: CityPerformance[];
  topProducts: TopProduct[];
}

// ---------- Helpers ----------

/**
 * Parse order date string (e.g. "March 20, 2024") into a Date object.
 * Returns null if parsing fails.
 */
function parseOrderDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Check if a date falls within the given period from today.
 */
function isWithinPeriod(date: Date | null, period: Period): boolean {
  if (period === "all" || !date) return true;
  const now = new Date();
  const days = period === "7d" ? 7 : 30;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date >= cutoff;
}

/**
 * Format a Date as a short label for the chart, e.g. "Apr 01"
 */
function formatDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

/**
 * Extract city from an address string.
 * Addresses are stored as "street, city, postalCode".
 * We take the second-to-last comma-separated segment and clean it.
 */
function extractCity(address: string): string {
  if (!address) return "Unknown";
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length >= 2) {
    // City is typically the second segment in "street, city, postalCode"
    return parts[parts.length - 2] || "Unknown";
  }
  return parts[0] || "Unknown";
}

// ---------- Hook ----------

export function useAnalytics(period: Period = "30d"): AnalyticsData {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to Firebase
  useEffect(() => {
    let ordersLoaded = false;
    let productsLoaded = false;

    const ordersRef = ref(database, "orders");
    const unsubOrders = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          ...val,
          _key: key,
        }));
        setOrders(list);
      } else {
        setOrders([]);
      }
      ordersLoaded = true;
      if (productsLoaded) setLoading(false);
    });

    const productsRef = ref(database, "products");
    const unsubProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, val]: [string, any]) => ({
          id: key,
          ...val,
        }));
        setProducts(list);
      } else {
        setProducts([]);
      }
      productsLoaded = true;
      if (ordersLoaded) setLoading(false);
    });

    return () => {
      unsubOrders();
      unsubProducts();
    };
  }, []);

  // Compute all analytics from raw data
  const analytics = useMemo<Omit<AnalyticsData, "loading">>(() => {
    // Filter orders by period
    const filteredOrders = orders.filter((o) =>
      isWithinPeriod(parseOrderDate(o.date), period)
    );

    // --- Stat Cards ---
    const totalRevenue = filteredOrders.reduce(
      (sum, o) => sum + (Number(o.total) || 0),
      0
    );
    const totalOrders = filteredOrders.length;
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const totalProducts = products.length;
    const deliveredOrders = filteredOrders.filter(
      (o) => o.status === "Delivered"
    ).length;
    const pendingOrders = filteredOrders.filter(
      (o) => o.status === "Pending"
    ).length;
    const deliveryRate =
      totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

    // --- Revenue by Day (for bar chart) ---
    const dayMap = new Map<string, { value: number; orderCount: number; date: Date }>();
    filteredOrders.forEach((o) => {
      const d = parseOrderDate(o.date);
      if (!d) return;
      const key = formatDayLabel(d);
      const existing = dayMap.get(key) || { value: 0, orderCount: 0, date: d };
      existing.value += Number(o.total) || 0;
      existing.orderCount += 1;
      dayMap.set(key, existing);
    });
    const revenueByDay: DailyRevenue[] = Array.from(dayMap.entries())
      .map(([day, data]) => ({ day, value: data.value, orderCount: data.orderCount, _date: data.date }))
      .sort((a, b) => a._date.getTime() - b._date.getTime())
      .map(({ _date, ...rest }) => rest);

    // --- Category Breakdown ---
    const catMap = new Map<string, number>();
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      catMap.set(cat, (catMap.get(cat) || 0) + 1);
    });
    const categoryBreakdown: CategoryBreakdown[] = Array.from(catMap.entries())
      .map(([label, count]) => ({
        label,
        count,
        percentage: totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // --- Top Cities ---
    const cityMap = new Map<string, { revenue: number; orderCount: number }>();
    filteredOrders.forEach((o) => {
      const city = extractCity(o.address);
      const existing = cityMap.get(city) || { revenue: 0, orderCount: 0 };
      existing.revenue += Number(o.total) || 0;
      existing.orderCount += 1;
      cityMap.set(city, existing);
    });
    const topCities: CityPerformance[] = Array.from(cityMap.entries())
      .map(([city, data], idx) => ({
        id: String(idx + 1).padStart(2, "0"),
        city: city.toUpperCase(),
        revenue: data.revenue,
        orderCount: data.orderCount,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // --- Top Selling Products ---
    const productMap = new Map<string, { quantitySold: number; revenue: number }>();
    filteredOrders.forEach((o) => {
      if (!o.items) return;
      o.items.forEach((item) => {
        const name = item.name || "Unknown";
        const existing = productMap.get(name) || { quantitySold: 0, revenue: 0 };
        existing.quantitySold += item.quantity || 1;
        existing.revenue += (item.price || 0) * (item.quantity || 1);
        productMap.set(name, existing);
      });
    });
    const topProducts: TopProduct[] = Array.from(productMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue,
      totalProducts,
      deliveredOrders,
      pendingOrders,
      deliveryRate,
      revenueByDay,
      categoryBreakdown,
      topCities,
      topProducts,
    };
  }, [orders, products, period]);

  return { loading, ...analytics };
}