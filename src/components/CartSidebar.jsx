"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CartSidebar.module.css";

export default function CartSidebar() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    subtotal,
    deliveryFee,
    vat,
    total,
  } = useCart();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className={styles.backdrop}
          />

          {/* Sidebar Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={styles.sidebar}
          >
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.titleContainer}>
                <ShoppingBag size={20} color="var(--primary)" />
                <h3 className={styles.title}>Your Basket</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className={styles.closeBtn}
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content list */}
            {cartItems.length === 0 ? (
              <div className={styles.emptyState}>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ShoppingBag size={64} color="var(--text-muted)" strokeWidth={1} />
                </motion.div>
                <h4 className={styles.emptyTitle}>Your basket is empty</h4>
                <p className={styles.emptyDesc}>
                  Add items from your favorite restaurants to start a new order.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className={`btn-primary ${styles.browseBtn}`}
                >
                  Browse Food
                </button>
              </div>
            ) : (
              <>
                <div className={styles.itemsList}>
                  {cartItems.map((item, idx) => {
                    const extraCost = Object.values(item.customizations).reduce(
                      (acc, opt) => acc + (opt.price || 0),
                      0
                    );
                    const itemTotal = (item.price + extraCost) * item.quantity;

                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={`${item.id}-${JSON.stringify(item.customizations)}-${idx}`}
                        className={styles.itemCard}
                      >
                        {/* Details */}
                        <div className={styles.itemDetails}>
                          <h4 className={styles.itemName}>{item.name}</h4>
                          
                          {/* Customizations tags */}
                          {Object.keys(item.customizations).length > 0 && (
                            <div className={styles.itemCustomizations}>
                              {Object.entries(item.customizations).map(([key, opt]) => (
                                <span key={key} className={styles.customizationItem}>
                                  + {key}: {opt.name} {opt.price > 0 && `(+৳${opt.price})`}
                                </span>
                              ))}
                            </div>
                          )}

                          <span className={styles.itemPrice}>৳{itemTotal}</span>
                        </div>

                        {/* Quantity management */}
                        <div className={styles.itemActions}>
                          <button
                            onClick={() => removeFromCart(item.id, item.customizations)}
                            className={styles.deleteBtn}
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                          
                          <div className={styles.quantitySelector}>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1, item.customizations)
                              }
                              className={styles.qtyBtn}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={14} />
                            </button>
                            <span className={styles.qtyValue}>{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1, item.customizations)
                              }
                              className={styles.qtyBtn}
                              aria-label="Increase quantity"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer and summary */}
                <div className={styles.footer}>
                  <div className={styles.billSummary}>
                    <div className={styles.billRow}>
                      <span>Subtotal</span>
                      <span>৳{subtotal}</span>
                    </div>
                    <div className={styles.billRow}>
                      <span>Delivery Fee</span>
                      <span>
                        {deliveryFee === 0 ? (
                          <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>
                            FREE
                          </span>
                        ) : (
                          `৳${deliveryFee}`
                        )}
                      </span>
                    </div>
                    <div className={styles.billRow}>
                      <span>VAT (5%)</span>
                      <span>৳{vat}</span>
                    </div>
                    <div className={styles.billRowTotal}>
                      <span>Total Amount</span>
                      <span className={styles.totalPrice}>৳{total}</span>
                    </div>
                  </div>

                  <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                    <button className={`btn-primary ${styles.checkoutBtn}`}>
                      <span>Proceed to Checkout</span>
                      <ArrowRight size={18} />
                    </button>
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
