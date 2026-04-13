"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User, Search, Truck } from "lucide-react";
import { Button, cn } from "@/components/ui";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import logo from "@/app/assets/images/logo.png";

import { useCart } from "@/context/CartContext";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Shop", href: "/shop" },
  { name: "Testers", href: "/testers" },
  { name: "For Her", href: "/for-her" },
  { name: "For Him", href: "/for-him" },
  { name: "Deals", href: "/deals" },
];

const Navbar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const { cartCount } = useCart();

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/shop?search=${encodeURIComponent(searchTerm)}`;
      setIsSearchOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 md:px-12 py-2.5 md:py-3 flex items-center justify-between bg-white border-b border-neutral-200",
        scrolled && "shadow-sm",
      )}
    >
      <div className="flex items-center gap-8">
        <button className="lg:hidden" onClick={() => setIsOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/" className="flex items-center">
          <Image
            src={logo}
            alt="HAUTIQUE"
            className="h-12 md:h-18 w-auto object-contain invert"
          />
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-8">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "text-sm uppercase tracking-widest hover:text-neutral-500 transition-colors",
              pathname === link.href ? "font-bold border-b border-black" : "",
            )}
          >
            {link.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative flex items-center">
          <AnimatePresence>
            {isSearchOpen && (
              <motion.form
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 200, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                onSubmit={handleSearch}
                className="absolute right-8 overflow-hidden"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-transparent border-b border-black text-xs uppercase tracking-widest py-1 focus:outline-none"
                />
              </motion.form>
            )}
          </AnimatePresence>
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="hover:opacity-70 transition-opacity"
          >
            {isSearchOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </button>
        </div>
        <Link
          href="/track-order"
          className="hover:opacity-70 transition-opacity"
          title="Track Order"
        >
          <Truck className="w-5 h-5" />
        </Link>
        <Link href="/cart" className="relative hover:opacity-70 group">
          <ShoppingBag className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
          <AnimatePresence>
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-2 -right-2 bg-black text-white text-[8px] w-4 h-4 flex items-center justify-center rounded-full font-bold"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="bg-black text-white px-6 md:px-12 py-16">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
      <div className="md:col-span-1">
        <Image
          src={logo}
          alt="HAUTIQUE"
          className="h-16 w-auto object-contain mb-6"
        />
        <p className="text-neutral-400 text-sm leading-relaxed">
          Crafting timeless scents for the modern individual. Experience the art
          of luxury perfumery.
        </p>
      </div>
      <div>
        <h4 className="text-sm uppercase tracking-widest font-bold mb-6">
          Shop
        </h4>
        <ul className="flex flex-col gap-4 text-neutral-400 text-sm">
          <li>
            <Link
              href="/for-her"
              className="hover:text-white transition-colors"
            >
              For Her
            </Link>
          </li>
          <li>
            <Link
              href="/for-him"
              className="hover:text-white transition-colors"
            >
              For Him
            </Link>
          </li>
          <li>
            <Link
              href="/testers"
              className="hover:text-white transition-colors"
            >
              Testers
            </Link>
          </li>
          <li>
            <Link href="/shop" className="hover:text-white transition-colors">
              All Products
            </Link>
          </li>
        </ul>
      </div>
      <div>
        <h4 className="text-sm uppercase tracking-widest font-bold mb-6">
          Support
        </h4>
        <ul className="flex flex-col gap-4 text-neutral-400 text-sm">
          <li>
            <Link
              href="/track-order"
              className="text-white hover:text-white font-bold transition-colors"
            >
              Track Order
            </Link>
          </li>
          <li>
            <Link
              href="/shipping-policy"
              className="hover:text-white transition-colors"
            >
              Shipping Policy
            </Link>
          </li>
          <li>
            <Link
              href="/returns-exchanges"
              className="hover:text-white transition-colors"
            >
              Returns & Exchanges
            </Link>
          </li>
          <li>
            <Link href="/faqs" className="hover:text-white transition-colors">
              FAQs
            </Link>
          </li>
          <li>
            <Link
              href="/contact-us"
              className="hover:text-white transition-colors"
            >
              Contact Us
            </Link>
          </li>
        </ul>
      </div>
    </div>
    <div className="pt-8 border-t border-neutral-800 flex flex-col md:row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-neutral-500">
      <p>© 2024 HAUTIQUE. ALL RIGHTS RESERVED.</p>
      <div className="flex gap-6">
        <Link href="#" className="hover:text-white">
          Privacy Policy
        </Link>
        <Link href="#" className="hover:text-white">
          Terms of Service
        </Link>
      </div>
    </div>
  </footer>
);

export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar isOpen={isOpen} setIsOpen={setIsOpen} />
      <main className="flex-grow pt-[80px] md:pt-[90px]">{children}</main>
      <Footer />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-[90]"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[65%] max-w-[280px] bg-white shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)] z-[100] p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <Image
                  src={logo}
                  alt="HAUTIQUE"
                  className="h-12 w-auto object-contain invert"
                />
                <button onClick={() => setIsOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg uppercase tracking-widest font-medium"
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-6 border-t border-neutral-100 flex flex-col gap-6">
                  <Link
                    href="/track-order"
                    onClick={() => setIsOpen(false)}
                    className="text-lg uppercase tracking-widest font-medium flex items-center gap-3"
                  >
                    <Truck className="w-5 h-5" />
                    Track Order
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
