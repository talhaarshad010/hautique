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

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (v: boolean) => void }) => {
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
          <button className="flex items-center gap-4 text-sm uppercase tracking-widest text-neutral-400 hover:text-white transition-colors w-full">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

const Header = ({ setSidebarOpen }: { setSidebarOpen: (v: boolean) => void }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Redirect to products page with search query as a simple implementation
      router.push(`/admin/products?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

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
        <button className="relative p-2 hover:bg-neutral-100 rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full border-2 border-white" />
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isAuth, setIsAuth] = React.useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();

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

  if (isAuth === null) return null;
  if (isAuth === false && pathname !== '/admin/login') return null;

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans admin-panel">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header setSidebarOpen={setSidebarOpen} />
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
    </div>
  );
}
