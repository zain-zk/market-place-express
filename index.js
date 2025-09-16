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

// Middleware
app.use(
  cors({
    // origin: "http://localhost:5173", // React app
    origin: "https://market-place-react.vercel.app/", // React app
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/", indexRoutes);

//Socket.Io Setup
const io = new Server(server, {
  cors: {
    // origin: "http://localhost:5173",
    origin: "https://market-place-react.vercel.app/",
    methods: ["GET", "POST"],
  },
});

// sOCKET.IO EVENTS
io.on("connection", (socket) => {
  socket.on("Send Message", async (data) => {
    try {
      const { sender, receiver, text } = data;

      //save to db
      const newMessage = await Message.create({ sender, text, receiver });

      //Emit to the reciever in real time
      io.emit("recieveMessage", newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });
  socket.on("disconnect", () => {});
});

// MongoDB Connection
mongoose
  .connect(process.env.DATABASE_URL)
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
