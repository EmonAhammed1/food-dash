"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { io } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, MessageSquare, Send, Phone, Star } from "lucide-react";
import Header from "@/components/Header";
import styles from "./order.module.css";

const TIMELINE_STEPS = [
  {
    title: "Order Confirmed",
    desc: "Your order has been received by Burger Lab.",
    time: "20 min left",
  },
  {
    title: "Preparing Food",
    desc: "The kitchen is cooking and packing your meal.",
    time: "15 min left",
  },
  {
    title: "Rider Picked Up",
    desc: "Rider Kamrul Hasan has picked up your order.",
    time: "10 min left",
  },
  {
    title: "Out for Delivery",
    desc: "Rider is heading to your location in Gulshan.",
    time: "5 min left",
  },
  {
    title: "Delivered!",
    desc: "Please collect your warm food package.",
    time: "0 min left",
  },
];

export default function OrderStatusPage({ params }) {
  const { id } = use(params);

  // States
  const [activeStep, setActiveStep] = useState(0);
  const [chatText, setChatText] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "rider", text: "Assalamu Alaikum, ami order ready holei niye ashbo." },
  ]);

  const [socket, setSocket] = useState(null);
  const [useSimulatedTimer, setUseSimulatedTimer] = useState(false);
  const [riderLocation, setRiderLocation] = useState({ lat: 80, lng: 20 }); // Restaurant position (X=20, Y=80)

  useEffect(() => {
    // 1. Fetch initial order state from DB
    const fetchOrder = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/orders/${id}`);
        const data = await res.json();
        
        if (data && data.status) {
          const statusMap = {
            Confirmed: 0,
            Preparing: 1,
            PickedUp: 2,
            Delivering: 3,
            Arrived: 4,
            Delivered: 4,
          };
          setActiveStep(statusMap[data.status] || 0);
          if (data.riderCoordinates) {
            setRiderLocation(data.riderCoordinates);
          }
        } else {
          // If order not found in DB, fallback to simulated mockup
          setUseSimulatedTimer(true);
        }
      } catch (err) {
        console.error("Failed to fetch order from backend:", err);
        setUseSimulatedTimer(true); // Fallback
      }
    };
    fetchOrder();

    // 2. Initialize WebSockets Client
    const socketClient = io("http://localhost:5000");
    setSocket(socketClient);

    socketClient.on("connect", () => {
      console.log("Connected to WebSockets Server successfully.");
      socketClient.emit("join_order", id);
    });

    socketClient.on("status_update", ({ status }) => {
      console.log("Socket status update received:", status);
      const statusMap = {
        Confirmed: 0,
        Preparing: 1,
        PickedUp: 2,
        Delivering: 3,
        Arrived: 4,
        Delivered: 4,
      };
      setActiveStep(statusMap[status] || 0);
    });

    socketClient.on("rider_location", ({ lat, lng }) => {
      console.log("Socket coordinates update received:", lat, lng);
      setRiderLocation({ lat, lng });
    });

    socketClient.on("receive_message", (msg) => {
      console.log("Socket message received:", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketClient.disconnect();
    };
  }, [id]);

  // Simulate active step progression (only run as fallback if server is offline)
  useEffect(() => {
    if (!useSimulatedTimer) return;
    if (activeStep >= TIMELINE_STEPS.length - 1) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < TIMELINE_STEPS.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 15000); // Progress step every 15 seconds for demonstration

    return () => clearInterval(interval);
  }, [activeStep, useSimulatedTimer]);

  // Interpolate rider coordinates based on progress
  // Restaurant is at x=20%, y=80% | Home is at x=80%, y=20%
  const progress = activeStep / (TIMELINE_STEPS.length - 1);
  const startX = 20; // %
  const startY = 80; // %
  const endX = 80; // %
  const endY = 20; // %
  const simulatedX = startX + (endX - startX) * progress;
  const simulatedY = startY + (endY - startY) * progress;

  // Use dynamic coordinates from sockets, or fallback to simulated interpolation
  const riderX = useSimulatedTimer ? simulatedX : riderLocation.lng;
  const riderY = useSimulatedTimer ? simulatedY : riderLocation.lat;

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!chatText.trim()) return;

    if (socket && socket.connected) {
      socket.emit("send_message", {
        orderId: id,
        sender: "customer",
        text: chatText,
      });
      setChatText("");
    } else {
      // Fallback
      const newMsg = { sender: "customer", text: chatText };
      setMessages((prev) => [...prev, newMsg]);
      setChatText("");

      // Simulate Rider reply
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "rider", text: "Ji sir, ok. Rasta block ektu." }]);
      }, 3000);
    }
  };

  const handleQuickReply = (text) => {
    if (socket && socket.connected) {
      socket.emit("send_message", {
        orderId: id,
        sender: "customer",
        text,
      });
    } else {
      // Fallback
      setMessages((prev) => [...prev, { sender: "customer", text }]);
      setTimeout(() => {
        setMessages((prev) => [...prev, { sender: "rider", text: "Ji sir, ok." }]);
      }, 3000);
    }
  };

  return (
    <div className={styles.main}>
      <Header />

      <div className="container" style={{ marginTop: "32px" }}>
        <div className={styles.grid}>
          {/* Timeline Tracking Details */}
          <div className={`glass-card ${styles.card}`}>
            <div className={styles.orderHeader}>
              <div>
                <h1 className={styles.orderTitle}>Track Your Order</h1>
                <span className={styles.orderId}>Order ID: #{id}</span>
              </div>
              <div className={styles.timerContainer}>
                <span className={styles.timerValue}>
                  {activeStep === 4 ? "Delivered" : `${20 - activeStep * 5} Min`}
                </span>
                <span className={styles.timerLabel}>Estimated Time</span>
              </div>
            </div>

            {/* Vertical timeline steps */}
            <div className={styles.timeline}>
              {/* Background progress bars */}
              <div className={styles.timelineLine} />
              <div
                className={styles.timelineProgressLine}
                style={{ height: `${(activeStep / (TIMELINE_STEPS.length - 1)) * 100}%` }}
              />

              {TIMELINE_STEPS.map((step, idx) => {
                const isActive = idx === activeStep;
                const isCompleted = idx < activeStep;

                return (
                  <div key={idx} className={styles.step}>
                    <div
                      className={`${styles.stepIcon} ${
                        isActive ? styles.stepActive : isCompleted ? styles.stepCompleted : ""
                      }`}
                    >
                      {isCompleted ? <Check size={18} /> : <span>{idx + 1}</span>}
                    </div>

                    <div className={styles.stepContent}>
                      <h3
                        className={`${styles.stepTitle} ${
                          isActive ? styles.stepTitleActive : ""
                        }`}
                      >
                        {step.title}
                      </h3>
                      <p className={styles.stepDesc}>{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rider profile and chat */}
            <div className={styles.riderSection}>
              <span className={styles.riderHeader}>Your Delivery Partner</span>
              <div className={styles.riderBox}>
                <div className={styles.riderProfile}>
                  <div className={styles.riderAvatar}>🛵</div>
                  <div className={styles.riderInfo}>
                    <span className={styles.riderName}>Kamrul Hasan</span>
                    <span className={styles.riderRating}>
                      <Star size={12} fill="currentColor" /> 4.9 (240 deliveries)
                    </span>
                  </div>
                </div>

                <div className={styles.chatActions}>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className="btn-secondary"
                    style={{ padding: "8px 16px", fontSize: "0.85rem", height: "40px" }}
                  >
                    <MessageSquare size={16} />
                    <span>{showChat ? "Hide Chat" : "Chat with Rider"}</span>
                  </button>
                  <a
                    href="tel:01700000000"
                    className="btn-primary"
                    style={{
                      padding: "8px 16px",
                      fontSize: "0.85rem",
                      height: "40px",
                      boxShadow: "none",
                    }}
                  >
                    <Phone size={16} />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              {/* Chat panel */}
              <AnimatePresence>
                {showChat && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={styles.chatArea}
                  >
                    {/* Chat messages */}
                    <div className={styles.chatMessages}>
                      {messages.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`${styles.msg} ${
                            msg.sender === "customer" ? styles.msgCustomer : styles.msgRider
                          }`}
                        >
                          {msg.text}
                        </div>
                      ))}
                    </div>

                    {/* Quick replies */}
                    <div className={styles.quickReplies}>
                      <button
                        onClick={() => handleQuickReply("Ami gate-e wait korchi.")}
                        className={styles.quickReplyBtn}
                      >
                        Ami gate-e wait korchi
                      </button>
                      <button
                        onClick={() => handleQuickReply("Change taka ready rakhbo?")}
                        className={styles.quickReplyBtn}
                      >
                        Change taka rakhbo?
                      </button>
                      <button
                        onClick={() => handleQuickReply("Apnar location thik ache?")}
                        className={styles.quickReplyBtn}
                      >
                        Location thik ache?
                      </button>
                    </div>

                    {/* Chat inputs */}
                    <form onSubmit={handleSendMessage} className={styles.chatInputArea}>
                      <input
                        type="text"
                        placeholder="Type message to rider..."
                        className={styles.input}
                        style={{ height: "40px", fontSize: "0.875rem" }}
                        value={chatText}
                        onChange={(e) => setChatText(e.target.value)}
                      />
                      <button type="submit" className={`btn-primary ${styles.sendBtn}`}>
                        <Send size={16} />
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Simulated Live Tracking Map */}
          <div className={`glass-card ${styles.mapCard}`}>
            <div className={styles.mapHeader}>
              <h2 className={styles.mapTitle}>Live Tracking Map</h2>
            </div>

            <div className={styles.mapArea}>
              {/* SVG connection path */}
              <svg className={styles.svgMap}>
                {/* Dashed route path */}
                <line
                  x1="20%"
                  y1="80%"
                  x2="80%"
                  y2="20%"
                  stroke="var(--text-muted)"
                  strokeWidth="3"
                  strokeDasharray="6, 6"
                />
                {/* Completed route path */}
                <line
                  x1="20%"
                  y1="80%"
                  x2={`${riderX}%`}
                  y2={`${riderY}%`}
                  stroke="var(--primary)"
                  strokeWidth="3"
                  strokeDasharray="6, 6"
                />
              </svg>

              {/* Restaurant Marker */}
              <div className={styles.marker} style={{ left: "20%", top: "80%" }}>
                <div className={`${styles.markerIcon} ${styles.markerIconRest}`}>🍳</div>
                <span className={styles.markerLabel}>Burger Lab</span>
              </div>

              {/* Customer Home Marker */}
              <div className={styles.marker} style={{ left: "80%", top: "20%" }}>
                <div className={`${styles.markerIcon} ${styles.markerIconHome}`}>🏠</div>
                <span className={styles.markerLabel}>Your Home</span>
              </div>

              {/* Rider Bike Marker (Animated Position) */}
              <motion.div
                animate={{ left: `${riderX}%`, top: `${riderY}%` }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className={styles.marker}
              >
                <div
                  className={styles.markerIcon}
                  style={{
                    borderColor: "var(--accent-gold)",
                    background: "var(--accent-gold)",
                    color: "#171717",
                    transform: "scale(1.1)",
                    boxShadow: "0 0 15px rgba(255, 165, 2, 0.6)",
                  }}
                >
                  🏍️
                </div>
                <span
                  className={styles.markerLabel}
                  style={{ background: "var(--accent-gold)", color: "#171717" }}
                >
                  Rider
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
