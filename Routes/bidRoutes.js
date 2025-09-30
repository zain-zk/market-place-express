const express = require("express");
const router = express.Router();
const Bid = require("../models/bidModel");
const Requirement = require("../models/Requirement");

// POST Bid
router.post("/", async (req, res) => {
  try {
    const { requirementId, amount, proposal, deliveryTime, provider } =
      req.body;

    const newBid = new Bid({
      provider,
      requirement: requirementId,
      amount,
      proposal,
      deliveryTime,
    });

    await newBid.save();

    // 🔹 update requirement status to Active automatically
    await Requirement.findByIdAndUpdate(requirementId, { status: "Active" });

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
        select: "title location price client status category", // include status also
        populate: {
          path: "client",
          select: "name email",
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

// GET all bids for one requirement
router.get("/requirements/:id/bids", async (req, res) => {
  try {
    const bids = await Bid.find({ requirement: req.params.id })
      .populate("provider", "name email")
      .populate({
        path: "requirement",
        select: "title location price status category",
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

// ✅ NEW: Get a single bid by ID
router.get("/:bidId", async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId)
      .populate({
        path: "requirement",
        select: "title description location price client status category",
        populate: {
          path: "client",
          select: "name email",
        },
      })
      .populate("provider", "name email");

    if (!bid) {
      return res.status(404).json({ message: "Bid not found" });
    }

    res.json(bid);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
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
    const { id } = req.params;
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
