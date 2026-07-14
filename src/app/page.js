"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, Clock, Truck, Award } from "lucide-react";
import Header from "@/components/Header";
import CartSidebar from "@/components/CartSidebar";
import styles from "./page.module.css";

const MOCK_CATEGORIES = [
  { id: "all", name: "All Foods", emoji: "🍽️" },
  { id: "burgers", name: "Burgers", emoji: "🍔" },
  { id: "pizza", name: "Pizza", emoji: "🍕" },
  { id: "biryani", name: "Biryani", emoji: "🍲" },
  { id: "desserts", name: "Desserts", emoji: "🍰" },
  { id: "healthy", name: "Healthy", emoji: "🥗" },
  { id: "drinks", name: "Beverages", emoji: "🥤" },
];

const MOCK_RESTAURANTS = [
  {
    id: "r1",
    name: "Burger Lab",
    emoji: "🍔",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviews: "500+",
    cuisines: "Burgers, Fast Food, Fries",
    deliveryTime: 25, // in minutes
    deliveryFee: 30, // in BDT
    distance: "1.8 km",
    discount: "৳50 OFF on ৳300+",
    category: "burgers",
  },
  {
    id: "r2",
    name: "Sultans Kacchi",
    emoji: "🍲",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviews: "1k+",
    cuisines: "Biryani, Kacchi, Bengali, Mutton",
    deliveryTime: 35,
    deliveryFee: 40,
    distance: "3.2 km",
    discount: "Free Delivery",
    category: "biryani",
  },
  {
    id: "r3",
    name: "Pizza Express",
    emoji: "🍕",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
    rating: 4.5,
    reviews: "350+",
    cuisines: "Italian, Pizza, Pasta",
    deliveryTime: 30,
    deliveryFee: 35,
    distance: "2.5 km",
    discount: "20% OFF",
    category: "pizza",
  },
  {
    id: "r4",
    name: "The Salad Company",
    emoji: "🥗",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80",
    rating: 4.6,
    reviews: "150+",
    cuisines: "Salads, Healthy, Keto, Juices",
    deliveryTime: 20,
    deliveryFee: 0,
    distance: "1.2 km",
    discount: "Buy 1 Get 1",
    category: "healthy",
  },
  {
    id: "r5",
    name: "Chillox",
    emoji: "🍔",
    image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80",
    rating: 4.7,
    reviews: "800+",
    cuisines: "Burgers, Fast Food, Shakes",
    deliveryTime: 25,
    deliveryFee: 30,
    distance: "1.9 km",
    discount: "৳30 OFF",
    category: "burgers",
  },
  {
    id: "r6",
    name: "Sweet Delights",
    emoji: "🍰",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80",
    rating: 4.9,
    reviews: "200+",
    cuisines: "Cakes, Pastries, Desserts, Waffles",
    deliveryTime: 15,
    deliveryFee: 20,
    distance: "0.8 km",
    discount: "৳40 OFF",
    category: "desserts",
  },
];

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all"); // "all", "rating", "time", "free"

  // Fetch restaurants from backend API
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/restaurants`);
        const data = await res.json();
        if (data && data.length > 0) {
          setRestaurants(data);
        } else {
          setRestaurants(MOCK_RESTAURANTS);
        }
      } catch (err) {
        console.error("Failed to fetch restaurants from backend:", err);
        setRestaurants(MOCK_RESTAURANTS); // fallback
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurants();
  }, []);

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((r) => {
    const matchesCategory = activeCategory === "all" || r.category === activeCategory;
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cuisines.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterOption === "free" ? r.deliveryFee === 0 : true;

    return matchesCategory && matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (filterOption === "rating") return b.rating - a.rating;
    if (filterOption === "time") return a.deliveryTime - b.deliveryTime;
    return 0;
  });

  return (
    <div className={styles.main}>
      <Header />
      <CartSidebar />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <div className={styles.heroText}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={styles.badge}
            >
              <Award size={16} />
              <span>Fastest Food Delivery in Dhaka</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className={styles.title}
            >
              Craving food? <br />
              We deliver it <span className={styles.titleHighlight}>Hot & Fast</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className={styles.description}
            >
              Order from the best local restaurants in your neighborhood. Get super fast delivery
              with live tracking of your order.
            </motion.p>

            {/* Address and Food Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={styles.searchBar}
            >
              <div className={styles.searchField}>
                <MapPin size={18} color="var(--primary)" />
                <input
                  type="text"
                  placeholder="Gulshan-2, Dhaka"
                  className={styles.input}
                  readOnly
                />
              </div>
              <div className={styles.searchDivider} />
              <div className={styles.searchField}>
                <Search size={18} color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="Search restaurant, cuisines..."
                  className={styles.input}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="btn-primary styles.searchBtn">Find Food</button>
            </motion.div>
          </div>

          {/* Hero Visuals */}
          <div className={styles.heroVisuals}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={styles.illustrationWrapper}
            >
              <div className={styles.mainCircle}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  style={{ width: "100%", height: "100%", position: "absolute" }}
                />
              </div>

              {/* Floating Cards */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`${styles.floatingCard} ${styles.card1}`}
              >
                <div className={styles.avatar}>🍕</div>
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700 }}>Fresh Pizza</h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-green)", fontWeight: 600 }}>
                    15 Min Delivery
                  </span>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05 }}
                className={`${styles.floatingCard} ${styles.card2}`}
              >
                <div className={styles.avatar}>🍔</div>
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700 }}>Juicy Burger</h4>
                  <span style={{ fontSize: "0.75rem", color: "var(--accent-gold)", fontWeight: 600 }}>
                    ★ 4.9 Ratings
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categoriesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>What's on your mind?</h2>
            <p className={styles.sectionDesc}>Explore delicious categories of food items.</p>
          </div>

          <div className={styles.categoriesGrid}>
            {MOCK_CATEGORIES.map((cat, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`${styles.categoryCard} ${
                  activeCategory === cat.id ? styles.activeCategory : ""
                }`}
              >
                <span className={styles.categoryIcon}>{cat.emoji}</span>
                <span className={styles.categoryName}>{cat.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurants Listing */}
      <section className={styles.restaurantsSection}>
        <div className="container">
          <div className={styles.filterRow}>
            <div>
              <h2 className={styles.sectionTitle}>Popular Restaurants</h2>
              <p className={styles.sectionDesc}>Order from top kitchens in Gulshan.</p>
            </div>

            {/* Sort Filters */}
            <div className={styles.filterGroup}>
              <button
                onClick={() => setFilterOption("all")}
                className={`${styles.filterTab} ${filterOption === "all" ? styles.activeFilter : ""}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterOption("rating")}
                className={`${styles.filterTab} ${filterOption === "rating" ? styles.activeFilter : ""}`}
              >
                ★ Top Rated
              </button>
              <button
                onClick={() => setFilterOption("time")}
                className={`${styles.filterTab} ${filterOption === "time" ? styles.activeFilter : ""}`}
              >
                ⚡ Fastest
              </button>
              <button
                onClick={() => setFilterOption("free")}
                className={`${styles.filterTab} ${filterOption === "free" ? styles.activeFilter : ""}`}
              >
                🚲 Free Delivery
              </button>
            </div>
          </div>

          {/* Restaurant Grid */}
          <motion.div layout className={styles.grid}>
            <AnimatePresence mode="popLayout">
              {filteredRestaurants.map((res) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                  key={res.id}
                >
                  <Link href={`/restaurants/${res.id}`}>
                    <div className={`glass-card ${styles.card}`}>
                      <div className={styles.cardImage}>
                        <img src={res.image} alt={res.name} className={styles.bannerImg} />
                        {res.discount && (
                          <div className={styles.discountBadge}>{res.discount}</div>
                        )}
                      </div>

                      <div className={styles.cardBody}>
                        <div className={styles.cardHeader}>
                          <h3 className={styles.restaurantName}>{res.name}</h3>
                          <div className={styles.rating}>
                            <Star size={14} fill="currentColor" />
                            <span>{res.rating}</span>
                          </div>
                        </div>

                        <p className={styles.cuisineList}>{res.cuisines}</p>

                        <div className={styles.cardFooter}>
                          <div className={styles.footerInfo}>
                            <Clock size={14} />
                            <span>{res.deliveryTime} mins</span>
                          </div>
                          <div className={styles.footerInfo}>
                            <Truck size={14} />
                            <span>
                              {res.deliveryFee === 0 ? "Free Delivery" : `৳${res.deliveryFee}`}
                            </span>
                          </div>
                          <div className={styles.footerInfo}>
                            <span>{res.distance}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredRestaurants.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ textAlign: "center", padding: "60px 0" }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}>
                No restaurants found
              </h3>
              <p style={{ color: "var(--text-secondary)" }}>
                Try searching for other keywords or select another food category.
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
