require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message");
const indexRoutes = require("./Routes/index.route");

const app = express();
const server = http.createServer(app);

// ✅ Allowed origins (no trailing slash)
const allowedOrigins = [
  "http://localhost:5173", // dev
  "https://market-place-react.vercel.app", // production
];

// Middleware
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/", indexRoutes);

// ✅ Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "https://market-place-react.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// sOCKET.IO EVENTS
io.on("connection", (socket) => {
  //   console.log("🔌 A user connected");

  socket.on("Send Message", async (data) => {
    try {
      const { sender, receiver, text } = data;
      // save to db
      const newMessage = await Message.create({ sender, text, receiver });
      // emit to the receiver in real time
      io.emit("recieveMessage", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("🔌 A user disconnected");
  });
});

// MongoDB Connection
mongoose
  .connect(process.env.DATABASE_URL || process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error",
    error: err.message,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
