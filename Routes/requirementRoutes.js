const express = require("express");
const router = express.Router();
const Requirement = require("../models/Requirement");
const { findById } = require("../models/Message");
const Bid = require("../models/bidModel");

// POST requirement
router.post("/", async (req, res) => {
  try {
    console.log("📝 Received request body:", req.body);
    const { title, description, price, location, client, category } = req.body;

    if (!title || !description || !price || !location || !client || !category) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newPrice = Number(price);
    if (isNaN(newPrice) || newPrice <= 0) {
      return res.status(400).json({ message: "Invalid price" });
    }

    const newRequirement = new Requirement({
      title,
      description,
      price: newPrice,
      location,
      client, // ✅ store client here
      category: category ? String(category).trim() : undefined,
      status: "Pending",
    });

    await newRequirement.save();
    res.json({
      message: "Requirement created successfully",
      requirement: newRequirement,
    });
  } catch (error) {
    console.error("Error creating requirement:", error);
    res
      .status(500)
      .json({ message: "Error creating requirement", error: error.message });
  }
});

// Get requirements by client
router.get("/my/:clientId", async (req, res) => {
  try {
    const requirements = await Requirement.find({
      client: req.params.clientId,
    }).sort({ cretedAt: -1 });
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: "Error Getting requirement", error });
  }
});

// Get all requirements
router.get("/", async (req, res) => {
  try {
    const requirements = await Requirement.find().populate(
      "client",
      "name email"
    ); // ✅ use client not clientId
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requirements", error });
  }
});

// get one requirement by id
router.get("/:id", async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }
    res.json(requirement);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// update requirement by ID
// update requirement by ID (only if not Completed)
router.put("/:id", async (req, res) => {
  try {
    // Find the requirement first
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    // Block updates if already completed
    if (requirement.status === "Completed") {
      return res.status(403).json({
        message: "This requirement is completed and cannot be edited.",
      });
    }

    // Otherwise allow update
    const updatedRequirement = await Requirement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedRequirement);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating requirement", error });
  }
});

// Requirement Status
// Requirement Status Update
router.put("/:reqId/status", async (req, res) => {
  try {
    const { reqId } = req.params; // ✅ correct param
    const { status } = req.body;

    // ✅ make sure status matches enum exactly
    if (!["Pending", "Active", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updated = await Requirement.findByIdAndUpdate(
      reqId,
      { status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

//delete requirement// or wherever your Bids model is

router.delete("/:id", async (req, res) => {
  try {
    const reqId = req.params.id;

    // Delete the requirement itself
    const deleteRequirement = await Requirement.findByIdAndDelete(reqId);

    if (!deleteRequirement) {
      return res.status(404).json({ message: "Requirement not found" });
    }

    // Delete all bids related to this requirement
    await Bid.deleteMany({ requirement: reqId });

    res.json({
      message: "Requirement and its bids deleted successfully",
      requirement: deleteRequirement,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting requirement and bids", error });
  }
});

module.exports = router;
