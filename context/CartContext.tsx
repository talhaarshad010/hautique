'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Product } from '@/lib/mock-data';

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  removeFromCart: (productId: string, size?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('hautique-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('hautique-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number = 1, size?: string) => {
    // If product has sizes but none provided, pick first
    const selectedSize = size || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => 
        item.id === product.id && item.selectedSize === selectedSize
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === product.id && item.selectedSize === selectedSize 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
      }
      return [...prevItems, { ...product, quantity, selectedSize }];
    });
  };

  const removeFromCart = (productId: string, size?: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => 
      !(item.id === productId && item.selectedSize === size)
    ));
  };

  const updateQuantity = (productId: string, quantity: number, size?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (
        item.id === productId && item.selectedSize === size 
          ? { ...item, quantity } 
          : item
      ))
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
