const mongoose = require("mongoose");

const CustomizationOptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, default: 0 },
  default: { type: Boolean, default: false }
});

const MenuItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  emoji: { type: String },
  image: { type: String },
  customizations: {
    type: Map,
    of: [CustomizationOptionSchema]
  }
});

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  items: [MenuItemSchema]
});

const RestaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  emoji: { type: String },
  image: { type: String },
  rating: { type: Number, default: 4.5 },
  reviews: { type: String, default: "100+" },
  cuisines: { type: String, required: true },
  deliveryTime: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  distance: { type: String, required: true },
  discount: { type: String },
  category: { type: String, required: true },
  menu: [CategorySchema] // Array of categories with items
});

module.exports = mongoose.model("Restaurant", RestaurantSchema);
