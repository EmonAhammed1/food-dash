const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");

// Mock seeding data matching our premium frontend mock data
const SEED_DATA = [
  {
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
    category: "burgers",
    menu: [
      {
        name: "Popular Items",
        items: [
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
                { name: "Double Patty", price: 100 }
              ],
              Extras: [
                { name: "Extra Cheese Slice", price: 30 },
                { name: "Beef Bacon Strip", price: 60 }
              ]
            }
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
                { name: "Double Fillet", price: 80 }
              ],
              Extras: [
                { name: "Extra Cheese", price: 30 },
                { name: "Garlic Dip", price: 20 }
              ]
            }
          }
        ]
      },
      {
        name: "Beef Burgers",
        items: [
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
                { name: "Double Patty", price: 80 }
              ]
            }
          },
          {
            id: "m4",
            name: "Smokey BBQ Burger",
            description: "BBQ glazed beef patty, crispy onion rings, sliced pickles, and rich cheddar cheese.",
            price: 220,
            emoji: "🍔",
            image: "https://images.unsplash.com/photo-1521305916504-4a1121188589?w=300&auto=format&fit=crop&q=80"
          }
        ]
      },
      {
        name: "Appetizers & Sides",
        items: [
          {
            id: "m5",
            name: "French Fries (Large)",
            description: "Golden brown crispy potato fries salted to perfection.",
            price: 120,
            emoji: "🍟",
            image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=300&auto=format&fit=crop&q=80"
          },
          {
            id: "m6",
            name: "Garlic Mushrooms",
            description: "Fresh button mushrooms sautéed with red chili flakes, fresh herbs, and loaded garlic.",
            price: 180,
            emoji: "🍄",
            image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=300&auto=format&fit=crop&q=80"
          }
        ]
      },
      {
        name: "Drinks & Desserts",
        items: [
          {
            id: "m7",
            name: "Coca Cola (Can)",
            description: "250ml chilled carbonated soft drink.",
            price: 45,
            emoji: "🥤",
            image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=80"
          },
          {
            id: "m8",
            name: "Oreo Milkshake",
            description: "Thick creamy shake blended with real oreo cookies and whipped cream.",
            price: 150,
            emoji: "🥤",
            image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&auto=format&fit=crop&q=80"
          }
        ]
      }
    ]
  },
  {
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
    menu: [
      {
        name: "Kacchi Platter",
        items: [
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
                { name: "Extra Mutton Piece", price: 150 }
              ],
              Sides: [
                { name: "Borhani (Glass)", price: 50 },
                { name: "Jorda", price: 60 }
              ]
            }
          },
          {
            id: "m202",
            name: "Mutton Kacchi - Double",
            description: "Fragrant rice served with two pieces of mutton, boiled egg, and soft potato.",
            price: 580,
            emoji: "🍲",
            image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=300&auto=format&fit=crop&q=80"
          }
        ]
      },
      {
        name: "Sides & Borhani",
        items: [
          {
            id: "m203",
            name: "Sultans Special Borhani",
            description: "Authentic, rich, and spiced yogurt drink flavored with mint.",
            price: 60,
            emoji: "🥤",
            image: "https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=300&auto=format&fit=crop&q=80"
          },
          {
            id: "m204",
            name: "Chicken Roast (1 pc)",
            description: "Richly flavored slow-cooked chicken roast with thick gravy.",
            price: 140,
            emoji: "🍗",
            image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&auto=format&fit=crop&q=80"
          }
        ]
      }
    ]
  },
  {
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
    menu: [
      {
        name: "Mains & Platters",
        items: [
          {
            id: "r3-m1",
            name: "Special Pizza Express Combo",
            description: "Signature item. Comes with chef's choice side.",
            price: 350,
            emoji: "🍕",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80",
            customizations: {
              Size: [
                { name: "Regular Size", price: 0, default: true },
                { name: "Upgraded Size", price: 90 }
              ]
            }
          },
          {
            id: "r3-m2",
            name: "Classic Pizza Express Option",
            description: "Freshly prepared daily with handpicked premium ingredients.",
            price: 220,
            emoji: "🍕",
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80"
          }
        ]
      },
      {
        name: "Sides & Beverages",
        items: [
          {
            id: "r3-m3",
            name: "Cheesy Garlic Bread",
            description: "Freshly baked bread with garlic butter and melted cheese.",
            price: 110,
            emoji: "🍞",
            image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300&auto=format&fit=crop&q=80"
          },
          {
            id: "r3-m4",
            name: "Fresh Fruit Juice",
            description: "Freshly squeezed seasonal fruit juice.",
            price: 90,
            emoji: "🥤",
            image: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&auto=format&fit=crop&q=80"
          }
        ]
      }
    ]
  }
];

// @route   GET /api/restaurants
// @desc    Get all restaurants
router.get("/", async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error in restaurant list fetching");
  }
});

// @route   GET /api/restaurants/:id
// @desc    Get a single restaurant detail
router.get("/:id", async (req, res) => {
  try {
    // If id matches r1, r2, r3, we check matching names (since seeding generates mongodb ObjectIds)
    // To make it easy, we find by matching _id or matching res name via search
    let restaurant;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      restaurant = await Restaurant.findById(req.params.id);
    } else {
      // Fallback: match by names or ids in seed helper
      const map = { r1: "Burger Lab", r2: "Sultans Kacchi", r3: "Pizza Express" };
      const name = map[req.params.id];
      if (name) {
        restaurant = await Restaurant.findOne({ name });
      }
    }

    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found." });
    }

    res.json(restaurant);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error in restaurant detail fetching");
  }
});

// @route   POST /api/restaurants/seed
// @desc    Seed mock data to database
router.post("/seed", async (req, res) => {
  try {
    await Restaurant.deleteMany(); // Clear existing
    const created = await Restaurant.insertMany(SEED_DATA);
    res.status(201).json({
      message: "Database seeded successfully!",
      count: created.length,
      data: created
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error in seeding data");
  }
});

module.exports = router;
