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
  { name: "Unisex", href: "/unisex" },
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
              href="/unisex"
              className="hover:text-white transition-colors"
            >
              Unisex
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
    <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest text-neutral-500">
      <p>© 2024 HAUTIQUE. ALL RIGHTS RESERVED.</p>
      <div className="flex gap-6">
        <Link href="/privacy-policy" className="hover:text-white transition-colors">
          Privacy Policy
        </Link>
        <Link href="/terms-of-service" className="hover:text-white transition-colors">
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

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/923197780890"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-8 right-8 z-[60] group"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-full shadow-xl border border-neutral-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <p className="text-[10px] uppercase tracking-widest font-bold whitespace-nowrap">How can we help?</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-14 h-14 bg-[#25D366] rounded-full shadow-2xl flex items-center justify-center text-white transition-all hover:bg-[#128C7E]"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-7 h-7 fill-current"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.628 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </motion.div>
        </div>
      </a>

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
