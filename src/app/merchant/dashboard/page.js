"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { ShoppingBag, CheckCircle, Clock, Truck, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import styles from "./merchant.module.css";

export default function MerchantDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Authenticate user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "merchant") {
      router.push("/");
      return;
    }
    setUser(parsedUser);

    // Fetch initial order list
    const fetchOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/orders");
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();

    // Setup WebSockets connection
    const socket = io("http://localhost:5000");

    socket.on("connect", () => {
      console.log("Merchant Dashboard linked to Socket server.");
    });

    socket.on("new_order", (newOrder) => {
      console.log("New order received via WebSockets:", newOrder);
      // Append order to list
      setOrders((prev) => [newOrder, ...prev]);

      // Play alert chime
      try {
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-84.wav");
        audio.volume = 0.5;
        audio.play();
      } catch (err) {
        console.error("Failed to play audio alert:", err);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  // Update order status
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const updatedOrder = await res.json();

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error("Failed to update status on API:", err);
      // Fallback local update
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Confirmed":
        return { background: "rgba(255, 165, 2, 0.1)", color: "var(--warning)" };
      case "Preparing":
        return { background: "rgba(255, 71, 87, 0.1)", color: "var(--primary)" };
      case "PickedUp":
      case "Delivering":
        return { background: "rgba(0, 184, 148, 0.1)", color: "#00b894" };
      case "Delivered":
        return { background: "rgba(9, 132, 227, 0.1)", color: "#0984e3" };
      default:
        return { background: "rgba(0, 0, 0, 0.05)", color: "var(--text-secondary)" };
    }
  };

  if (isLoading) {
    return (
      <div className={styles.main}>
        <Header />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh", color: "var(--primary)" }}>
          <div style={{ width: 48, height: 48, border: "4px solid var(--primary-light)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-bg">
      <Header />
      <div className={styles.wrapper}>
        <div className="container">
          <div className={styles.dashboardHeader}>
            <h1 className={styles.title}>Merchant Console</h1>
            {user && (
              <div className={styles.merchantInfo}>
                <ShoppingBag size={20} color="var(--primary)" />
                <span className={styles.merchantName}>{user.name}</span>
              </div>
            )}
          </div>

          <div className={styles.grid}>
            <AnimatePresence>
              {orders.length === 0 ? (
                <div className={`glass-card ${styles.emptyState}`}>
                  <ShieldAlert size={64} color="var(--text-muted)" strokeWidth={1} />
                  <h2 className={styles.emptyTitle}>No Orders Yet</h2>
                  <p className={styles.emptySubtitle}>When customers place orders, they will show up here in real-time.</p>
                </div>
              ) : (
                orders.map((order) => (
                  <motion.div
                    key={order.orderId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`glass-card ${styles.card}`}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.orderId}>Order #{order.orderId}</span>
                      <span className={styles.statusTag} style={getStatusStyle(order.status)}>
                        {order.status}
                      </span>
                    </div>

                    <div className={styles.itemsList}>
                      {order.items?.map((item, idx) => (
                        <div key={idx} className={styles.itemRow}>
                          <div>
                            <span className={styles.itemQuantity}>{item.quantity}x</span> {item.name}
                            {item.customizations && Object.keys(item.customizations).length > 0 && (
                              <div className={styles.customizations}>
                                {Object.entries(item.customizations)
                                  .map(([key, val]) => `${key}: ${val.name}`)
                                  .join(", ")}
                              </div>
                            )}
                          </div>
                          <span>৳{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className={styles.cardFooter}>
                      <div>
                        <div className={styles.totalText}>Amount Paid</div>
                        <div className={styles.totalAmount}>৳{order.total}</div>
                      </div>

                      <div className={styles.actions}>
                        {order.status === "Confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(order.orderId, "Preparing")}
                            className={`${styles.actionBtn} ${styles.btnPrimary}`}
                          >
                            Accept & Prepare
                          </button>
                        )}
                        {order.status === "Preparing" && (
                          <button
                            onClick={() => handleUpdateStatus(order.orderId, "PickedUp")}
                            className={`${styles.actionBtn} ${styles.btnSecondary}`}
                          >
                            Mark Picked Up
                          </button>
                        )}
                        {order.status === "PickedUp" && (
                          <button
                            onClick={() => handleUpdateStatus(order.orderId, "Delivering")}
                            className={`${styles.actionBtn} ${styles.btnPrimary}`}
                          >
                            Out for Delivery
                          </button>
                        )}
                        {order.status === "Delivering" && (
                          <button
                            onClick={() => handleUpdateStatus(order.orderId, "Delivered")}
                            className={`${styles.actionBtn} ${styles.btnPrimary}`}
                          >
                            Mark Delivered
                          </button>
                        )}
                        {order.status === "Delivered" && (
                          <span style={{ color: "#00b894", fontSize: "0.9rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                            <CheckCircle size={16} /> Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
