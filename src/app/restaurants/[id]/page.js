"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { Star, Clock, Truck, ArrowLeft, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import CartSidebar from "@/components/CartSidebar";
import CustomizationModal from "@/components/CustomizationModal";
import styles from "./restaurant.module.css";

// Rich Mock Data with Fallbacks
const RESTAURANT_DATA = {
  r1: {
    id: "r1",
    name: "Burger Lab",
    emoji: "🍔",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    rating: 4.8,
    reviews: "500+",
    cuisines: "Burgers, Fast Food, Fries",
    deliveryTime: 25,
    deliveryFee: 30,
    distance: "1.8 km",
    discount: "৳50 OFF on ৳300+",
    menu: {
      "Popular Items": [
        {
          id: "m1",
          name: "Cheesy Blast Burger",
          description: "Beef patty stuffed with melted cheddar cheese, fresh lettuce, and special lab sauce.",
          price: 240,
          emoji: "🍔",
          image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&auto=format&fit=crop&q=80",
          customizations: {
            Size: [
              { name: "Regular Patty", price: 0, default: true },
              { name: "Double Patty", price: 100 },
            ],
            Extras: [
              { name: "Extra Cheese Slice", price: 30 },
              { name: "Beef Bacon Strip", price: 60 },
            ],
          },
        },
        {
          id: "m2",
          name: "Crispy Chicken Burger",
          description: "Crispy deep-fried chicken breast, spicy mayo, crunchy pickles, toasted brioche bun.",
          price: 190,
          emoji: "🍔",
          image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=300&auto=format&fit=crop&q=80",
          customizations: {
            Size: [
              { name: "Single Fillet", price: 0, default: true },
              { name: "Double Fillet", price: 80 },
            ],
            Extras: [
              { name: "Extra Cheese", price: 30 },
              { name: "Garlic Dip", price: 20 },
            ],
          },
        },
      ],
      "Beef Burgers": [
        {
          id: "m3",
          name: "Classic Beef Burger",
          description: "Flame-grilled beef patty, fresh tomato, onions, and special house sauce.",
          price: 160,
          emoji: "🍔",
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop&q=80",
          customizations: {
            Size: [
              { name: "Single Patty", price: 0, default: true },
              { name: "Double Patty", price: 80 },
            ],
          },
        },
        {
          id: "m4",
          name: "Smokey BBQ Burger",
          description: "BBQ glazed beef patty, crispy onion rings, sliced pickles, and rich cheddar cheese.",
          price: 220,
          emoji: "🍔",
          image: "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=300&auto=format&fit=crop&q=80",
        },
      ],
      "Appetizers & Sides": [
        {
          id: "m5",
          name: "French Fries (Large)",
          description: "Golden brown crispy potato fries salted to perfection.",
          price: 120,
          emoji: "🍟",
          image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=80",
        },
        {
          id: "m6",
          name: "Garlic Mushrooms",
          description: "Fresh button mushrooms sautéed with red chili flakes, fresh herbs, and loaded garlic.",
          price: 180,
          emoji: "🍄",
          image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&auto=format&fit=crop&q=80",
        },
      ],
      "Drinks & Desserts": [
        {
          id: "m7",
          name: "Coca Cola (Can)",
          description: "250ml chilled carbonated soft drink.",
          price: 45,
          emoji: "🥤",
          image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80",
        },
        {
          id: "m8",
          name: "Oreo Milkshake",
          description: "Thick creamy shake blended with real oreo cookies and whipped cream.",
          price: 150,
          emoji: "🥤",
          image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=80",
        },
      ],
    },
  },
  r2: {
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
    menu: {
      "Kacchi Platter": [
        {
          id: "m201",
          name: "Mutton Kacchi - Single",
          description: "Traditional fragrant basmati rice cooked with tender mutton chunks and spiced soft potato.",
          price: 320,
          emoji: "🍲",
          image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&auto=format&fit=crop&q=80",
          customizations: {
            "Add Extra": [
              { name: "None", price: 0, default: true },
              { name: "Extra Mutton Piece", price: 150 },
            ],
            Sides: [
              { name: "Borhani (Glass)", price: 50 },
              { name: "Jorda", price: 60 },
            ],
          },
        },
        {
          id: "m202",
          name: "Mutton Kacchi - Double",
          description: "Fragrant rice served with two pieces of mutton, boiled egg, and soft potato.",
          price: 580,
          emoji: "🍲",
          image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300&auto=format&fit=crop&q=80",
        },
      ],
      "Sides & Borhani": [
        {
          id: "m203",
          name: "Sultans Special Borhani",
          description: "Authentic, rich, and spiced yogurt drink flavored with mint.",
          price: 60,
          emoji: "🥤",
          image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300&auto=format&fit=crop&q=80",
        },
        {
          id: "m204",
          name: "Chicken Roast (1 pc)",
          description: "Richly flavored slow-cooked chicken roast with thick gravy.",
          price: 140,
          emoji: "🍗",
          image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&auto=format&fit=crop&q=80",
        },
      ],
    },
  },
};

// Generates fallback menu if the ID isn't directly configured
const getRestaurantData = (id) => {
  if (RESTAURANT_DATA[id]) return RESTAURANT_DATA[id];

  // Helper map from home page list names
  const fallbacks = {
    r3: { name: "Pizza Express", emoji: "🍕", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80", cuisines: "Italian, Pizza, Pasta" },
    r4: { name: "The Salad Company", emoji: "🥗", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80", cuisines: "Salads, Healthy, Keto" },
    r5: { name: "Chillox", emoji: "🍔", image: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80", cuisines: "Burgers, Fast Food, Shakes" },
    r6: { name: "Sweet Delights", emoji: "🍰", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&auto=format&fit=crop&q=80", cuisines: "Cakes, Pastries, Desserts" },
  };

  const info = fallbacks[id] || { name: "Local Diner", emoji: "🍲", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80", cuisines: "Bengali, Rice, Curry" };

  return {
    id,
    name: info.name,
    emoji: info.emoji,
    image: info.image,
    rating: 4.6,
    reviews: "100+",
    cuisines: info.cuisines,
    deliveryTime: 20,
    deliveryFee: 30,
    distance: "1.5 km",
    discount: "৳30 OFF",
    menu: {
      "Mains & Platters": [
        {
          id: `${id}-m1`,
          name: `Special ${info.name} Combo`,
          description: `Signature item from ${info.name}. Comes with chef's choice side.`,
          price: 350,
          emoji: info.emoji,
          image: info.image,
          customizations: {
            Size: [
              { name: "Regular Size", price: 0, default: true },
              { name: "Upgraded Size", price: 90 },
            ],
          },
        },
        {
          id: `${id}-m2`,
          name: `Classic ${info.name} Option`,
          description: "Freshly prepared daily with handpicked premium ingredients.",
          price: 220,
          emoji: info.emoji,
          image: info.image,
        },
      ],
      "Sides & Beverages": [
        {
          id: `${id}-m3`,
          name: "Cheesy Garlic Bread",
          description: "Freshly baked bread with garlic butter and melted cheese.",
          price: 110,
          emoji: "🍞",
          image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300&auto=format&fit=crop&q=80",
        },
        {
          id: `${id}-m4`,
          name: "Fresh Fruit Juice",
          description: "Freshly squeezed seasonal fruit juice.",
          price: 90,
          emoji: "🥤",
          image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&auto=format&fit=crop&q=80",
        },
      ],
    },
  };
};

export default function RestaurantPage({ params }) {
  const { id } = use(params);
  const [restaurant, setRestaurant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/restaurants/${id}`);
        const data = await res.json();
        
        if (data && data.name) {
          // If menu is returned as an array from Mongoose, convert it to a Map format
          if (Array.isArray(data.menu)) {
            const menuMap = {};
            data.menu.forEach((cat) => {
              menuMap[cat.name] = cat.items || [];
            });
            data.menu = menuMap;
          }
          setRestaurant(data);
          setActiveCategory(Object.keys(data.menu)[0] || "");
        } else {
          const fallback = getRestaurantData(id);
          setRestaurant(fallback);
          setActiveCategory(Object.keys(fallback.menu)[0] || "");
        }
      } catch (err) {
        console.error("Failed to fetch restaurant menu from backend:", err);
        const fallback = getRestaurantData(id);
        setRestaurant(fallback);
        setActiveCategory(Object.keys(fallback.menu)[0] || "");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRestaurant();
  }, [id]);

  const handleOpenCustomizer = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  if (isLoading || !restaurant) {
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
    <div className={styles.main}>
      <Header />
      <CartSidebar />

      {/* Restaurant Profile Banner */}
      <section className={styles.banner}>
        <div className={`container ${styles.bannerContent}`}>
          {/* Back button */}
          <Link href="/">
            <motion.div whileHover={{ scale: 1.05 }} className={styles.restEmoji} style={{ overflow: "hidden" }}>
              <img src={restaurant.image} alt={restaurant.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </motion.div>
          </Link>

          <div className={styles.restInfo}>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 4 }}>
              <ArrowLeft size={14} /> Back to restaurants
            </Link>
            <h1 className={styles.restName}>{restaurant.name}</h1>
            <p className={styles.cuisines}>{restaurant.cuisines}</p>

            <div className={styles.metaRow}>
              <div className={styles.metaItem}>
                <span className={styles.ratingBadge}>★ {restaurant.rating}</span>
                <span>({restaurant.reviews} reviews)</span>
              </div>
              <div className={styles.metaItem}>
                <Clock size={16} />
                <span>{restaurant.deliveryTime} mins</span>
              </div>
              <div className={styles.metaItem}>
                <Truck size={16} />
                <span>{restaurant.deliveryFee === 0 ? "Free Delivery" : `৳${restaurant.deliveryFee}`}</span>
              </div>
              {restaurant.discount && (
                <div className={styles.metaItem} style={{ color: "var(--primary)", fontWeight: 700 }}>
                  <span>% {restaurant.discount}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Menu Container */}
      <section className={styles.menuContainer}>
        <div className={`container ${styles.menuLayout}`}>
          {/* Left Category Navigation */}
          <div className={styles.sidebarNav}>
            <span className={styles.navTitle}>Menu Categories</span>
            {Object.keys(restaurant.menu).map((catName) => (
              <button
                key={catName}
                onClick={() => {
                  setActiveCategory(catName);
                  document.getElementById(catName)?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`${styles.navLink} ${
                  activeCategory === catName ? styles.activeNavLink : ""
                }`}
              >
                {catName}
              </button>
            ))}
          </div>

          {/* Right Menu Content */}
          <div className={styles.menuContent}>
            {Object.entries(restaurant.menu).map(([categoryName, items]) => (
              <div key={categoryName} id={categoryName} className={styles.categorySection}>
                <h2 className={styles.categoryTitle}>{categoryName}</h2>

                <div className={styles.menuGrid}>
                  {items.map((item) => (
                    <motion.div
                      whileHover={{ y: -4 }}
                      onClick={() => handleOpenCustomizer(item)}
                      key={item.id}
                      className={`glass-card ${styles.menuItemCard}`}
                    >
                      <div className={styles.itemInfo}>
                        <div className={styles.itemMain}>
                          <h3 className={styles.itemName}>{item.name}</h3>
                          <p className={styles.itemDesc}>{item.description}</p>
                        </div>
                        <div className={styles.itemPriceRow}>
                          <span className={styles.price}>৳{item.price}</span>
                        </div>
                      </div>

                      <div className={styles.itemImageSection}>
                        {item.image ? (
                          <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          item.emoji
                        )}
                        <div className={styles.addIconBtn}>
                          <Plus size={18} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customizer modal */}
      <CustomizationModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
