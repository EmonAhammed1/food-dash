"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, MapPin, Sun, Moon, ChevronDown, Clock, User, LogOut, Layout } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Header.module.css";

export default function Header() {
  const router = useRouter();
  const { theme, toggleTheme, itemsCount, setIsCartOpen, total } = useCart();
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem("user");
      const parsed = storedUser ? JSON.parse(storedUser) : null;
      if (JSON.stringify(parsed) !== JSON.stringify(user)) {
        setUser(parsed);
      }
    };
    checkUser();
    const interval = setInterval(checkUser, 1000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setDropdownOpen(false);
    router.push("/");
  };

  return (
    <header className={styles.header}>
      <div className={`container ${styles.nav}`}>
        {/* Logo */}
        <Link href="/">
          <div className={styles.logoContainer}>
            <span>Food</span>
            <span className={styles.logoAccent}>Dash</span>
          </div>
        </Link>

        {/* Mock Location Selector */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={styles.locationContainer}
        >
          <MapPin size={18} color="var(--primary)" />
          <div className={styles.locationText}>
            Deliver to: <strong>Gulshan-2, Dhaka</strong>
          </div>
          <ChevronDown size={14} color="var(--text-secondary)" />
        </motion.div>

        {/* Actions (Theme & Cart) */}
        <div className={styles.navActions}>
          {/* Theme Toggler */}
          <motion.button
            whileTap={{ rotate: 180, scale: 0.9 }}
            onClick={toggleTheme}
            className={styles.iconBtn}
            aria-label="Toggle Theme"
          >
            {theme === "light" ? (
              <Moon size={20} color="var(--text-primary)" />
            ) : (
              <Sun size={20} color="var(--text-primary)" />
            )}
          </motion.button>

          {/* Active Orders Tracker Shortcut */}
          <Link href="/orders/active" style={{ display: "none" }}>
            <motion.div whileHover={{ y: -2 }} className={styles.iconBtn}>
              <Clock size={20} color="var(--text-primary)" />
            </motion.div>
          </Link>

          {/* Cart Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCartOpen(true)}
            className={styles.cartBtn}
          >
            <ShoppingBag size={18} />
            <span>Cart</span>
            
            {/* Animated Badge */}
            <AnimatePresence mode="wait">
              {itemsCount > 0 && (
                <motion.span
                  key={itemsCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  className={styles.badge}
                >
                  {itemsCount}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* User Menu / Login Action */}
          {user ? (
            <div className={styles.userMenuContainer}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={styles.userBtn}
              >
                <User size={18} color="var(--primary)" />
                <span>{user.name.split(" ")[0]}</span>
                <ChevronDown size={14} />
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={styles.dropdown}
                  >
                    {user.role === "merchant" && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push("/merchant/dashboard");
                        }}
                        className={styles.dropdownItem}
                      >
                        <Layout size={14} />
                        Merchant Panel
                      </button>
                    )}
                    {user.role === "rider" && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          router.push("/rider/dashboard");
                        }}
                        className={styles.dropdownItem}
                      >
                        <Layout size={14} />
                        Rider Console
                      </button>
                    )}
                    <button onClick={handleLogout} className={styles.dropdownItem}>
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/auth")}
              className={styles.loginBtn}
            >
              <User size={18} />
              <span>Log In</span>
            </motion.button>
          )}
        </div>
      </div>
    </header>
  );
}
