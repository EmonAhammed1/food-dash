const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const { notifyStatusUpdate } = require("../socket");

// @route   GET /api/orders
// @desc    Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error in orders fetch");
  }
});

// @route   POST /api/orders
// @desc    Place a new order
router.post("/", async (req, res) => {
  const {
    orderId,
    restaurantName,
    items,
    subtotal,
    deliveryFee,
    vat,
    total,
    deliveryAddress,
    paymentMethod
  } = req.body;

  try {
    const newOrder = new Order({
      orderId: orderId || Math.floor(100000 + Math.random() * 900000).toString(),
      restaurantName,
      items,
      subtotal,
      deliveryFee,
      vat,
      total,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "Pending" : "Paid"
    });

    const savedOrder = await newOrder.save();
    try {
      const io = require("../socket").getIO();
      io.emit("new_order", savedOrder);
      console.log(`Socket broadcasted new_order: ${savedOrder.orderId}`);
    } catch (err) {
      console.error("Socket emit failed inside order creation:", err.message);
    }
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error in order placement");
  }
});

// @route   GET /api/orders/:id
// @desc    Get order details by orderId (not DB ObjectId, but custom tracking orderId)
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error in order fetching");
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status and notify via WebSockets
router.put("/:id/status", async (req, res) => {
  const { status } = req.body; // e.g. "Preparing", "PickedUp", "Delivering", "Arrived", "Delivered"

  try {
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    order.status = status;
    
    // Auto-update coordinates based on status stage for mockup tracking
    if (status === "Confirmed" || status === "Preparing") {
      order.riderCoordinates = { lat: 20, lng: 80 };
    } else if (status === "PickedUp") {
      order.riderCoordinates = { lat: 35, lng: 65 };
    } else if (status === "Delivering") {
      order.riderCoordinates = { lat: 55, lng: 45 };
    } else if (status === "Arrived" || status === "Delivered") {
      order.riderCoordinates = { lat: 80, lng: 20 };
    }

    await order.save();

    // Broadcast status change real-time via socket room
    notifyStatusUpdate(order.orderId, status);

    res.json(order);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error in order status update");
  }
});

module.exports = router;
