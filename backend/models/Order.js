const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  customizations: {
    type: Map,
    of: {
      name: { type: String },
      price: { type: Number }
    }
  }
});

const OrderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  restaurantName: {
    type: String,
    required: true
  },
  items: [OrderItemSchema],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  vat: { type: Number, required: true },
  total: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Confirmed", "Preparing", "PickedUp", "Delivering", "Arrived", "Delivered"],
    default: "Confirmed"
  },
  deliveryAddress: {
    house: { type: String, required: true },
    road: { type: String, required: true },
    area: { type: String, required: true },
    instructions: { type: String }
  },
  riderCoordinates: {
    lat: { type: Number, default: 20 }, // Simulated progress start coordinate percentage
    lng: { type: Number, default: 80 }
  },
  paymentMethod: {
    type: String,
    enum: ["cod", "bkash", "card"],
    default: "cod"
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Paid", "Failed"],
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Order", OrderSchema);
