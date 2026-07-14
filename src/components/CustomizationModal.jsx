"use client";

import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./CustomizationModal.module.css";

export default function CustomizationModal({ item, isOpen, onClose }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomizations, setSelectedCustomizations] = useState({});

  // Reset modal state when item changes or opens
  useEffect(() => {
    if (item) {
      setQuantity(1);
      
      // Initialize defaults
      const initial = {};
      if (item.customizations) {
        Object.entries(item.customizations).forEach(([groupName, options]) => {
          const defaultOpt = options.find(opt => opt.default) || options[0];
          // Only auto-select single-choice items (like Size)
          if (groupName.toLowerCase() === "size" || groupName.toLowerCase() === "crust" || groupName.toLowerCase() === "sweetness") {
            initial[groupName] = defaultOpt;
          }
        });
      }
      setSelectedCustomizations(initial);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  // Calculate dynamic price
  const basePrice = item.price;
  const customizationsPrice = Object.values(selectedCustomizations).reduce((acc, opt) => {
    // If it's a nested group, we sum the values
    if (opt.price) {
      return acc + opt.price;
    }
    return acc;
  }, 0);

  const singleItemPrice = basePrice + customizationsPrice;
  const totalPrice = singleItemPrice * quantity;

  const handleSelectRadio = (groupName, option) => {
    setSelectedCustomizations(prev => ({
      ...prev,
      [groupName]: option
    }));
  };

  const handleToggleCheckbox = (groupName, option) => {
    setSelectedCustomizations(prev => {
      const currentGroup = prev[groupName] || {};
      const newGroup = { ...currentGroup };

      if (newGroup[option.name]) {
        delete newGroup[option.name];
      } else {
        newGroup[option.name] = option;
      }

      // Flat check: if the group is empty, remove the key
      if (Object.keys(newGroup).length === 0) {
        const next = { ...prev };
        delete next[groupName];
        return next;
      }

      return {
        ...prev,
        [groupName]: newGroup
      };
    });
  };

  const handleAddToBasket = () => {
    // Format customizations for the CartContext
    // CartContext expects a flat structure or predictable serialization
    // E.g., customizations: { Size: { name: "Double", price: 120 }, "Extra Cheese": { name: "Extra Cheese", price: 40 } }
    const formatted = {};
    Object.entries(selectedCustomizations).forEach(([key, val]) => {
      if (val.name) {
        // Single choice
        formatted[key] = val;
      } else {
        // Multi choice checkboxes
        Object.entries(val).forEach(([optionName, optionVal]) => {
          formatted[optionName] = optionVal;
        });
      }
    });

    addToCart(item, quantity, formatted);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className={styles.backdrop} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className={styles.modal}
        >
          {/* Close button */}
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>

          {/* Banner */}
          <div className={styles.imageSection}>
            {item.image ? (
              <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div>{item.emoji}</div>
            )}
          </div>

          {/* Scroll Area */}
          <div className={styles.scrollArea}>
            <div className={styles.itemHeader}>
              <h2 className={styles.itemName}>{item.name}</h2>
              <p className={styles.itemDesc}>{item.description}</p>
              <span className={styles.itemPrice} style={{ fontSize: "1.25rem" }}>
                ৳{item.price}
              </span>
            </div>

            {/* Customization Options */}
            {item.customizations &&
              Object.entries(item.customizations).map(([groupName, options]) => {
                const isSingleChoice =
                  groupName.toLowerCase() === "size" ||
                  groupName.toLowerCase() === "crust" ||
                  groupName.toLowerCase() === "sweetness";

                return (
                  <div key={groupName} className={styles.optionSection}>
                    <div className={styles.sectionHeader}>
                      <h3 className={styles.sectionTitle}>{groupName}</h3>
                      {isSingleChoice ? (
                        <span className={styles.requiredTag}>Select 1</span>
                      ) : (
                        <span className={styles.optionalTag}>Optional</span>
                      )}
                    </div>

                    <div className={styles.optionsList}>
                      {options.map((opt) => {
                        const isSelected = isSingleChoice
                          ? selectedCustomizations[groupName]?.name === opt.name
                          : !!selectedCustomizations[groupName]?.[opt.name];

                        return (
                          <div
                            key={opt.name}
                            onClick={() =>
                              isSingleChoice
                                ? handleSelectRadio(groupName, opt)
                                : handleToggleCheckbox(groupName, opt)
                            }
                            className={`${styles.optionLabel} ${
                              isSelected ? styles.activeOption : ""
                            }`}
                          >
                            <div className={styles.optionInputRow}>
                              <input
                                type={isSingleChoice ? "radio" : "checkbox"}
                                name={groupName}
                                checked={isSelected}
                                onChange={() => {}} // Controlled via parent click wrapper
                                className={isSingleChoice ? styles.radio : styles.checkbox}
                              />
                              <span className={styles.optionName}>{opt.name}</span>
                            </div>
                            <span className={styles.optionPrice}>
                              {opt.price > 0 ? `+৳${opt.price}` : "Free"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Footer controls */}
          <div className={styles.footer}>
            {/* Quantity */}
            <div className={styles.quantitySelector}>
              <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className={styles.qtyBtn}
                aria-label="Decrease quantity"
              >
                <Minus size={18} />
              </button>
              <span className={styles.qtyVal}>{quantity}</span>
              <button
                onClick={() => setQuantity(prev => prev + 1)}
                className={styles.qtyBtn}
                aria-label="Increase quantity"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Add to Basket button */}
            <button onClick={handleAddToBasket} className={`btn-primary ${styles.addBtn}`}>
              <ShoppingBag size={18} />
              <span>Add to Basket - ৳{totalPrice}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
