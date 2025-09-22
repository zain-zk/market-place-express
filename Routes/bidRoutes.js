const express = require("express");
const router = express.Router();
const Bid = require("../models/bidModel");

router.post("/", async (req, res) => {
  try {
    // console.log("📩 Incoming Bid Request:", req.body);
    const { requirementId, amount, proposal, deliveryTime, provider } =
      req.body;

    const newBid = new Bid({
      provider, // logged-in service provider
      requirement: requirementId,
      amount,
      proposal,
      deliveryTime,
    });

    await newBid.save();
    res.status(201).json(newBid);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error placing Bid", error: error.message });
  }
});

// GET provider's bids
router.get("/my-bids", async (req, res) => {
  try {
    const providerId = req.query.provider;

    if (!providerId) {
      return res.status(400).json({ message: "Provider ID is required" });
    }

    const bids = await Bid.find({ provider: providerId })
      .populate({
        path: "requirement",
        select: "title location price client", // include location + client
        populate: {
          path: "client",
          select: "name email", // get client name + email
        },
      })
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error("❌ Error fetching bids:", error);
    res
      .status(500)
      .json({ message: "Error fetching bids", error: error.message });
  }
});

// Correct: match on "requirement", not "requirementId"
router.get("/requirements/:id/bids", async (req, res) => {
  try {
    const bids = await Bid.find({ requirement: req.params.id })
      .populate("provider", "name email") // show provider details
      .populate({
        path: "requirement",
        select: "title location price", // include requirement info
      })
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    console.error("❌ Error fetching requirement bids:", error);
    res
      .status(500)
      .json({ message: "Error fetching bids", error: error.message });
  }
});

// Bid Status
router.put("/:bidId/status", async (req, res) => {
  try {
    const { bidId } = req.params;
    const { status } = req.body;
    const bid = await Bid.findByIdAndUpdate(bidId, { status }, { new: true });
    if (!bid) {
      return res.status(404).json({ message: "Bid Not Found" });
    }
    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// DELETE a bid by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params; // ✅ use "id" because route is "/:id"
    const bid = await Bid.findByIdAndDelete(id);

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    res.json({ message: "Bid deleted successfully", bid });
  } catch (error) {
    console.error("❌ Error deleting bid:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
