"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { MapPin, CreditCard, Wallet, ShoppingBag, ArrowRight, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, subtotal, deliveryFee, vat, total, clearCart } = useCart();

  // Form states
  const [address, setAddress] = useState({
    house: "",
    road: "",
    area: "Gulshan-2",
    instructions: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod"); // "cod", "bkash", "card"
  const [isPlacing, setIsPlacing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsPlacing(true);

    const orderData = {
      restaurantName: cartItems[0]?.restaurantName || "Burger Lab",
      items: cartItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        customizations: item.customizations,
      })),
      subtotal,
      deliveryFee,
      vat,
      total,
      deliveryAddress: address,
      paymentMethod,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
      const data = await res.json();

      if (data && data.orderId) {
        clearCart();
        router.push(`/orders/${data.orderId}`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      console.error("Order placement failed on API, falling back to mock:", err);
      // Fallback mockup
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const randomOrderId = Math.floor(100000 + Math.random() * 900000);
      clearCart();
      router.push(`/orders/${randomOrderId}`);
    } finally {
      setIsPlacing(false);
    }
  };

  return (
    <div className={styles.main}>
      <Header />

      <div className="container" style={{ marginTop: "32px" }}>
        <h1 className={styles.checkoutTitle}>Checkout</h1>

        {cartItems.length === 0 ? (
          <div className={`glass-card ${styles.emptyState}`}>
            <ShoppingBag size={64} color="var(--text-muted)" strokeWidth={1} />
            <h2 className={styles.emptyTitle}>No items to checkout</h2>
            <p className={styles.emptyDesc}>
              Your basket is empty. Please select food items from a restaurant.
            </p>
            <Link href="/">
              <button className="btn-primary">Browse Restaurants</button>
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {/* Left side form */}
            <form onSubmit={handlePlaceOrder}>
              {/* Delivery Details */}
              <div className={`glass-card ${styles.section}`}>
                <h2 className={styles.sectionTitle}>
                  <MapPin size={20} color="var(--primary)" />
                  <span>Delivery Address</span>
                </h2>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formGroupLabel}>Flat / House / Floor</label>
                    <input
                      required
                      type="text"
                      name="house"
                      placeholder="e.g. Flat 3A, House 45"
                      value={address.house}
                      onChange={handleInputChange}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formGroupLabel}>Road Name / Number</label>
                    <input
                      required
                      type="text"
                      name="road"
                      placeholder="e.g. Road 12"
                      value={address.road}
                      onChange={handleInputChange}
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formGroupLabel}>Area / Location</label>
                    <select
                      name="area"
                      value={address.area}
                      onChange={handleInputChange}
                      className={styles.select}
                    >
                      <option value="Gulshan-1">Gulshan-1</option>
                      <option value="Gulshan-2">Gulshan-2</option>
                      <option value="Banani">Banani</option>
                      <option value="Dhanmondi">Dhanmondi</option>
                      <option value="Uttara">Uttara</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formGroupLabel}>Rider Note (Optional)</label>
                    <input
                      type="text"
                      name="instructions"
                      placeholder="e.g. Leave at gate / Call when here"
                      value={address.instructions}
                      onChange={handleInputChange}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className={`glass-card ${styles.section}`}>
                <h2 className={styles.sectionTitle}>
                  <CreditCard size={20} color="var(--primary)" />
                  <span>Choose Payment Method</span>
                </h2>

                <div className={styles.paymentGrid}>
                  {/* COD */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod("cod")}
                    className={`${styles.paymentCard} ${
                      paymentMethod === "cod" ? styles.activePayment : ""
                    }`}
                  >
                    <span className={styles.paymentCardIcon}>💵</span>
                    <span className={styles.paymentCardLabel}>Cash on Delivery</span>
                  </motion.div>

                  {/* bKash */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod("bkash")}
                    className={`${styles.paymentCard} ${
                      paymentMethod === "bkash" ? styles.activePayment : ""
                    }`}
                  >
                    <span className={styles.paymentCardIcon}>📱</span>
                    <span className={styles.paymentCardLabel}>bKash / Nagad</span>
                  </motion.div>

                  {/* Card */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setPaymentMethod("card")}
                    className={`${styles.paymentCard} ${
                      paymentMethod === "card" ? styles.activePayment : ""
                    }`}
                  >
                    <span className={styles.paymentCardIcon}>💳</span>
                    <span className={styles.paymentCardLabel}>Card Payment</span>
                  </motion.div>
                </div>

                {paymentMethod === "bkash" && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginTop: "16px" }}
                  >
                    * Secure transaction redirection enabled. Sandbox test mode simulated.
                  </motion.p>
                )}
              </div>
            </form>

            {/* Right side summary */}
            <div className={`glass-card ${styles.summaryCard}`}>
              <div className={styles.summaryHeader}>
                <h2 className={styles.summaryTitle}>Order Summary</h2>
              </div>

              {/* Items listing */}
              <div className={styles.orderItems}>
                {cartItems.map((item, idx) => {
                  const extraCost = Object.values(item.customizations).reduce(
                    (acc, opt) => acc + (opt.price || 0),
                    0
                  );
                  const itemTotal = (item.price + extraCost) * item.quantity;

                  return (
                    <div key={`${item.id}-${idx}`} className={styles.orderItem}>
                      <div>
                        <span className={styles.itemName}>
                          {item.name} <span className={styles.itemQty}>x{item.quantity}</span>
                        </span>
                        {Object.keys(item.customizations).length > 0 && (
                          <div className={styles.itemCustomizations}>
                            {Object.values(item.customizations).map((opt) => (
                              <div key={opt.name}>+ {opt.name}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className={styles.itemPrice}>৳{itemTotal}</span>
                    </div>
                  );
                })}
              </div>

              {/* Cost calculations */}
              <div className={styles.billDetails}>
                <div className={styles.billRow}>
                  <span>Subtotal</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className={styles.billRow}>
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>FREE</span>
                    ) : (
                      `৳${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className={styles.billRow}>
                  <span>VAT (5%)</span>
                  <span>৳{vat}</span>
                </div>
                <div className={`${styles.billRow} ${styles.totalRow}`}>
                  <span>Total Amount</span>
                  <span className={styles.totalPrice}>৳{total}</span>
                </div>
              </div>

              {/* Checkout buttons */}
              <button
                type="submit"
                disabled={isPlacing}
                onClick={handlePlaceOrder}
                className={`btn-primary ${styles.placeBtn}`}
              >
                {isPlacing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    <span>Place Order (৳{total})</span>
                  </>
                )}
              </button>

              <div style={{ textAlign: "center", marginTop: "16px" }}>
                <Link href="/" style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  Back to shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
