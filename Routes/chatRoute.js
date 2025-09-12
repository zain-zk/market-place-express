const express = require("express");
const Message = require("../models/Message");
const router = express.Router();

// ✅ Get chat history
router.get("/:userId/:otherId/:bidId", async (req, res) => {
  try {
    const { userId, otherId , bidId } = req.params;
    const messages = await Message.find({
      bid :bidId,
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId },
      ],
    }).sort("createdAt");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// ✅ Save new message
router.post("/", async (req, res) => {
  try {
    console.log("📩 Incoming message:", req.body); // debug log

    const { sender, receiver, text , bid } = req.body;

    if (!sender || !receiver || !text) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const newMessage = new Message({ sender, receiver, text , bid });
    await newMessage.save();

    res.json(newMessage);
  } catch (error) {
    console.error("❌ Error saving message:", error.message);
    res.status(500).json({ message: "Failed to save message", error: error.message });
  }
});


// ✅ Mark messages as read
router.put("/markAsRead/:userId/:otherId/:bidId", async (req, res) => {
  try {
    await Message.updateMany(
      { receiver: req.params.userId, sender: req.params.otherId, bid: req.params.bidId, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "Failed to update messages" });
  }
});

module.exports = router;
