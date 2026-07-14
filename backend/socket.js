let io;

module.exports = {
  initSocket: (socketIo) => {
    io = socketIo;
    io.on("connection", (socket) => {
      console.log(`Socket client connected: ${socket.id}`);

      // Client joins order-specific room for tracking
      socket.on("join_order", (orderId) => {
        socket.join(`order_${orderId}`);
        console.log(`Socket client ${socket.id} joined room: order_${orderId}`);
      });

      // Rider transmits active coordinates updates
      socket.on("update_coordinates", ({ orderId, lat, lng }) => {
        io.to(`order_${orderId}`).emit("rider_location", { lat, lng });
        console.log(`Broadcasted coords for order ${orderId}: lat=${lat}, lng=${lng}`);
      });

      // Simple chat message from customer or rider
      socket.on("send_message", ({ orderId, sender, text }) => {
        io.to(`order_${orderId}`).emit("receive_message", { sender, text });
        console.log(`Chat message on order ${orderId} from ${sender}: ${text}`);
      });

      socket.on("disconnect", () => {
        console.log(`Socket client disconnected: ${socket.id}`);
      });
    });
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io is not initialized!");
    }
    return io;
  },
  notifyStatusUpdate: (orderId, status) => {
    if (io) {
      io.to(`order_${orderId}`).emit("status_update", { status });
      console.log(`Broadcasted status update for order ${orderId}: ${status}`);
    }
  }
};
