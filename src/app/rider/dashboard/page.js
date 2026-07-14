"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { Bike, Navigation, Send, MessageSquare, List, CheckCircle, ShieldAlert } from "lucide-react";
import Header from "@/components/Header";
import styles from "./rider.module.css";

export default function RiderDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // WebSockets states
  const [socket, setSocket] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simLogs, setSimLogs] = useState([]);
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState([]);

  const simIntervalRef = useRef(null);
  const chatEndRef = useRef(null);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Authenticate user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/auth");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== "rider") {
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
          // Pick the first non-completed order as active by default
          const active = data.find((o) => o.status !== "Delivered");
          if (active) setSelectedOrder(active);
        }
      } catch (err) {
        console.error("Failed to load orders:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();

    // Setup WebSockets connection
    const socketClient = io("http://localhost:5000");
    setSocket(socketClient);

    socketClient.on("connect", () => {
      console.log("Rider Dashboard linked to Socket server.");
    });

    socketClient.on("new_order", (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    });

    socketClient.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketClient.disconnect();
      if (simIntervalRef.current) clearInterval(simIntervalRef.current);
    };
  }, [router]);

  // When selected order changes, join its websocket room and fetch status
  useEffect(() => {
    if (!selectedOrder || !socket) return;

    // Join order room
    socket.emit("join_order", selectedOrder.orderId);
    
    // Clear chat state and preload initial message
    setMessages([
      { sender: "rider", text: "Assalamu Alaikum, ami order ready holei niye ashbo." }
    ]);
  }, [selectedOrder, socket]);

  // GPS Simulation Trigger
  const handleToggleSimulation = async () => {
    if (isSimulating) {
      // Stop Simulation
      clearInterval(simIntervalRef.current);
      setIsSimulating(false);
      addLog("GPS Simulation Stopped.");
    } else {
      if (!selectedOrder) return;
      setIsSimulating(true);
      addLog("Starting GPS Coordinates Simulator...");

      // Update Order Status to Delivering initially
      await updateOrderStatus(selectedOrder.orderId, "Delivering");

      let progress = 0.0;
      const startX = 20; // % Restaurant
      const startY = 80; // %
      const endX = 80;   // % Home
      const endY = 20;   // %

      simIntervalRef.current = setInterval(async () => {
        progress += 0.05;
        if (progress > 1.0) {
          progress = 1.0;
          clearInterval(simIntervalRef.current);
          setIsSimulating(false);
          addLog("GPS Simulator reached destination!");
          
          // Mark Delivered
          await updateOrderStatus(selectedOrder.orderId, "Delivered");
          return;
        }

        // Interpolated percentage coordinates matching frontend SVG mapping
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;

        // Emit coordinates over socket
        if (socket && socket.connected) {
          socket.emit("update_coordinates", {
            orderId: selectedOrder.orderId,
            lat: currentY,
            lng: currentX
          });
          addLog(`[GPS Log] Emitted Lat: ${currentY.toFixed(1)}, Lng: ${currentX.toFixed(1)}`);
        }
      }, 2000); // Trigger coordinates updates every 2 seconds
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
        );
        setSelectedOrder((prev) => (prev.orderId === orderId ? { ...prev, status: newStatus } : prev));
        addLog(`Order status updated to: ${newStatus}`);
      }
    } catch (err) {
      console.error("Failed to update status on API:", err);
    }
  };

  const addLog = (msg) => {
    setSimLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!chatText.trim() || !selectedOrder || !socket) return;

    socket.emit("send_message", {
      orderId: selectedOrder.orderId,
      sender: "rider",
      text: chatText
    });
    setChatText("");
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
            <h1 className={styles.title}>Rider Console</h1>
            {user && (
              <div className={styles.riderInfo}>
                <Bike size={20} color="var(--primary)" />
                <span className={styles.riderName}>{user.name}</span>
              </div>
            )}
          </div>

          <div className={styles.grid}>
            {/* Left: Active Jobs / Simulator */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className={`glass-card ${styles.card}`}>
                <h2 className={styles.cardTitle}>Active Delivery Orders</h2>
                {orders.length === 0 ? (
                  <div className={styles.emptyState}>
                    <ShieldAlert size={48} strokeWidth={1} style={{ marginBottom: 12 }} />
                    <p>No delivery jobs currently available in the zone.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {orders.map((order) => (
                      <div
                        key={order.orderId}
                        onClick={() => setSelectedOrder(order)}
                        className={`${styles.orderRow} ${
                          selectedOrder?.orderId === order.orderId ? styles.orderRowActive : ""
                        }`}
                      >
                        <div>
                          <div className={styles.orderId}>Order #{order.orderId}</div>
                          <div className={styles.orderAddress}>
                            To: {order.deliveryAddress?.house}, {order.deliveryAddress?.area}
                          </div>
                        </div>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, opacity: 0.8 }}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedOrder && (
                <div className={`glass-card ${styles.card}`}>
                  <h2 className={styles.cardTitle}>GPS Tracking Simulator</h2>
                  <div className={styles.simulatorPanel}>
                    <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                      Simulate actual rider movements along the route to update customer map live.
                    </p>
                    <button
                      onClick={handleToggleSimulation}
                      className={`${styles.simBtn} ${isSimulating ? styles.simBtnActive : ""}`}
                    >
                      <Navigation size={18} />
                      {isSimulating ? "Stop Simulator" : "Start Delivering (Simulate GPS)"}
                    </button>

                    <div className={styles.logPanel}>
                      {simLogs.length === 0 ? (
                        <div style={{ color: "var(--text-muted)" }}>Logs waiting to start...</div>
                      ) : (
                        simLogs.map((log, idx) => (
                          <div key={idx} className={styles.logEntry}>
                            {log}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Customer Chat */}
            {selectedOrder ? (
              <div className={`glass-card ${styles.card}`}>
                <h2 className={styles.cardTitle}>Chat with Customer (Order #{selectedOrder.orderId})</h2>
                <div className={styles.chatWrapper}>
                  <div className={styles.chatBox}>
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`${styles.messageRow} ${
                          msg.sender === "customer" ? styles.messageCustomer : styles.messageRider
                        }`}
                      >
                        <div
                          className={`${styles.bubble} ${
                            msg.sender === "customer" ? styles.bubbleCustomer : styles.bubbleRider
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className={styles.chatForm}>
                    <input
                      type="text"
                      value={chatText}
                      onChange={(e) => setChatText(e.target.value)}
                      className={styles.chatInput}
                      placeholder="Type a message..."
                    />
                    <button type="submit" className={styles.sendBtn}>
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className={`glass-card ${styles.card}`} style={{ justifyContent: "center", alignItems: "center" }}>
                <MessageSquare size={48} strokeWidth={1} style={{ marginBottom: 12 }} />
                <p style={{ color: "var(--text-secondary)" }}>Select a delivery order to open customer chat.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
