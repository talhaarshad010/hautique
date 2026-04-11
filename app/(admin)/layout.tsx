'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User
} from 'lucide-react';
import { cn } from '@/components/ui';
import { motion, AnimatePresence } from 'motion/react';
import { ref, onValue } from 'firebase/database';
import { database } from '@/lib/firebase';

// ─── Notification Hook ───────────────────────────────────────────
function useOrderNotifications() {
  const [newOrderCount, setNewOrderCount] = React.useState(0);
  const [latestOrder, setLatestOrder] = React.useState<any>(null);
  const [showToast, setShowToast] = React.useState(false);
  const previousOrderCountRef = React.useRef<number | null>(null);
  const isInitialLoadRef = React.useRef(true);

  React.useEffect(() => {
    // Load seen count from localStorage
    const seenCount = parseInt(localStorage.getItem('hautique_seen_orders') || '0', 10);

    const ordersRef = ref(database, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const ordersList = Object.entries(data).map(([key, val]: [string, any]) => ({
        _key: key,
        ...val,
      }));

      const currentCount = ordersList.length;

      if (isInitialLoadRef.current) {
        // First load: calculate unseen orders
        isInitialLoadRef.current = false;
        previousOrderCountRef.current = currentCount;

        const unseen = Math.max(0, currentCount - seenCount);
        setNewOrderCount(unseen);
        return;
      }

      // Subsequent update: new order arrived
      if (previousOrderCountRef.current !== null && currentCount > previousOrderCountRef.current) {
        const newestOrder = ordersList[ordersList.length - 1];
        setLatestOrder(newestOrder);
        setNewOrderCount((prev) => prev + (currentCount - (previousOrderCountRef.current || 0)));

        // Show in-app toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);

        // Browser notification
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            sendBrowserNotification(newestOrder);
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then((perm) => {
              if (perm === 'granted') {
                sendBrowserNotification(newestOrder);
              }
            });
          }
        }
      }

      previousOrderCountRef.current = currentCount;
    });

    return () => unsubscribe();
  }, []);

  const markAllSeen = React.useCallback(() => {
    if (previousOrderCountRef.current !== null) {
      localStorage.setItem('hautique_seen_orders', previousOrderCountRef.current.toString());
    }
    setNewOrderCount(0);
  }, []);

  const dismissToast = React.useCallback(() => setShowToast(false), []);

  return { newOrderCount, latestOrder, showToast, markAllSeen, dismissToast };
}

function sendBrowserNotification(order: any) {
  try {
    const notification = new Notification('🛍️ New Order Received!', {
      body: `Order ${order.id || 'new'} from ${order.customerName || 'a customer'} — PKR ${Number(order.total || 0).toLocaleString()}`,
      icon: '/favicon.ico',
      tag: 'hautique-new-order',
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (e) {
    console.error('Notification error:', e);
  }
}

// ─── Sidebar ─────────────────────────────────────────────────────
const Sidebar = ({ isOpen, setIsOpen, onLogout }: { isOpen: boolean; setIsOpen: (v: boolean) => void; onLogout: () => void }) => {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Deals', href: '/admin/deals', icon: Tag },
    { name: 'Hero Slider', href: '/admin/slider', icon: LayoutDashboard },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 bottom-0 w-64 bg-black text-white z-50 transition-transform duration-300 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-8 flex items-center justify-between">
          <Link href="/" className="text-2xl font-sans font-bold tracking-tighter">
            HAUTIQUE
          </Link>
          <button className="lg:hidden" onClick={() => setIsOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8 px-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center gap-4 px-4 py-3 text-sm uppercase tracking-widest transition-colors rounded-lg',
                  active ? 'bg-white text-black font-bold' : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                )}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-8 left-0 right-0 px-8">
          <button 
            onClick={onLogout}
            className="flex items-center gap-4 text-sm uppercase tracking-widest text-neutral-400 hover:text-red-400 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

// ─── Header ──────────────────────────────────────────────────────
const Header = ({
  setSidebarOpen,
  newOrderCount,
  onBellClick,
}: {
  setSidebarOpen: (v: boolean) => void;
  newOrderCount: number;
  onBellClick: () => void;
}) => {
  return (
    <header className="h-20 bg-white border-b border-border px-6 md:px-12 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 w-64 invisible">
          {/* Search removed */}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={onBellClick}
          className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <Bell className="w-5 h-5" />
          {newOrderCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full px-1 border-2 border-white animate-pulse">
              {newOrderCount > 99 ? '99+' : newOrderCount}
            </span>
          )}
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Admin User</p>
            <p className="text-[10px] text-neutral-400 uppercase tracking-widest">Super Admin</p>
          </div>
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

// ─── Toast Notification ──────────────────────────────────────────
const OrderToast = ({ order, onDismiss }: { order: any; onDismiss: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -20, x: 20 }}
    animate={{ opacity: 1, y: 0, x: 0 }}
    exit={{ opacity: 0, y: -20, x: 20 }}
    className="fixed top-24 right-6 z-[200] bg-black text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm border border-neutral-800"
  >
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
        <ShoppingBag className="w-5 h-5 text-green-400" />
      </div>
      <div className="flex-grow min-w-0">
        <p className="text-[10px] uppercase tracking-widest font-bold text-green-400 mb-1">New Order Received</p>
        <p className="text-sm font-serif truncate">{order?.customerName || 'Customer'}</p>
        <p className="text-xs text-neutral-400 mt-0.5">
          {order?.id || 'New Order'} — PKR {Number(order?.total || 0).toLocaleString()}
        </p>
      </div>
      <button onClick={onDismiss} className="text-neutral-500 hover:text-white transition-colors flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

// ─── Layout ──────────────────────────────────────────────────────
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isAuth, setIsAuth] = React.useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const { newOrderCount, latestOrder, showToast, markAllSeen, dismissToast } = useOrderNotifications();

  // Request notification permission on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  React.useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuth(true);
      return;
    }

    const auth = localStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuth(true);
    } else {
      setIsAuth(false);
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleBellClick = () => {
    markAllSeen();
    router.push('/admin/orders');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    router.push('/admin/login');
  };

  if (isAuth === null) return null;
  if (isAuth === false && pathname !== '/admin/login') return null;

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans admin-panel">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} onLogout={handleLogout} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header
          setSidebarOpen={setSidebarOpen}
          newOrderCount={newOrderCount}
          onBellClick={handleBellClick}
        />
        <main className="p-6 md:p-12 flex-grow">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Toast for new orders */}
      <AnimatePresence>
        {showToast && latestOrder && (
          <OrderToast order={latestOrder} onDismiss={dismissToast} />
        )}
      </AnimatePresence>
    </div>
  );
}
