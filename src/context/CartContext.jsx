"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [theme, setTheme] = useState('light');
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Initialize theme and cart from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart items', e);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const addToCart = (item, quantity = 1, customizations = {}) => {
    setCartItems((prevItems) => {
      // Find if item with same ID and same customizations already exists
      const existingItemIndex = prevItems.findIndex(
        (prevItem) =>
          prevItem.id === item.id &&
          JSON.stringify(prevItem.customizations) === JSON.stringify(customizations)
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      return [...prevItems, { ...item, quantity, customizations }];
    });
  };

  const removeFromCart = (itemId, customizations = {}) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.id === itemId &&
            JSON.stringify(item.customizations) === JSON.stringify(customizations)
          )
      )
    );
  };

  const updateQuantity = (itemId, quantity, customizations = {}) => {
    if (quantity <= 0) {
      removeFromCart(itemId, customizations);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId &&
        JSON.stringify(item.customizations) === JSON.stringify(customizations)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations
  const itemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const subtotal = cartItems.reduce((total, item) => {
    const extraCost = Object.values(item.customizations).reduce((acc, opt) => {
      return acc + (opt.price || 0);
    }, 0);
    return total + (item.price + extraCost) * item.quantity;
  }, 0);

  const deliveryFee = subtotal > 500 ? 0 : subtotal > 0 ? 40 : 0; // Free delivery over 500 BDT
  const vat = Math.round(subtotal * 0.05); // 5% VAT
  const total = subtotal + deliveryFee + vat;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        theme,
        toggleTheme,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemsCount,
        subtotal,
        deliveryFee,
        vat,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
